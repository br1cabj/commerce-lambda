import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Coupon from "../models/Coupon.js";

const VALID_ORDER_STATUSES = [
  "Pendiente",
  "En Preparación",
  "Enviado",
  "Entregado",
  "Cancelado",
];

export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { products, shippingAddress, shippingCost, couponCode } = req.body;
    const userId = req.user.id;

    if (!products || !Array.isArray(products) || products.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Products are required." });
    }

    let totalAmount = 0;
    let totalEarnedPoints = 0;
    const orderProducts = [];

    for (let item of products) {
      const productFound = await Product.findOne({
        _id: item.product,
        tenantId: req.tenant._id,
        isDeleted: false,
      }).session(session);

      if (!productFound) {
        await session.abortTransaction();
        return res
          .status(404)
          .json({ message: "A product in your cart does not exist" });
      }

      if (productFound.stock < item.quantity) {
        await session.abortTransaction();
        return res
          .status(400)
          .json({ message: `Insufficient stock for ${productFound.model}.` });
      }

      const unitPrice =
        productFound.discount > 0
          ? productFound.price -
            productFound.price * (productFound.discount / 100)
          : productFound.price;

      totalAmount += unitPrice * item.quantity;
      totalEarnedPoints += (productFound.earnedPoints || 0) * item.quantity;

      await Product.updateOne(
        { _id: productFound._id },
        { $inc: { stock: -item.quantity } },
      ).session(session);

      orderProducts.push({
        product: productFound._id,
        quantity: item.quantity,
        price: productFound.price,
      });
    }

    let discountApplied = 0;
    let finalCouponCode = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        tenantId: req.tenant._id,
      }).session(session);
      if (
        coupon &&
        coupon.isActive &&
        (!coupon.expiresAt || new Date(coupon.expiresAt) > new Date()) &&
        (!coupon.maxUses || coupon.usedCount < coupon.maxUses)
      ) {
        discountApplied = totalAmount * (coupon.discountPercentage / 100);
        totalAmount -= discountApplied;
        finalCouponCode = coupon.code;
        coupon.usedCount += 1;
        await coupon.save({ session });
      }
    }

    totalAmount += shippingCost || 0;

    const newOrder = new Order({
      tenantId: req.tenant._id,
      user: userId,
      products: orderProducts,
      shippingAddress,
      shippingCost: shippingCost || 0,
      totalAmount,
      couponCode: finalCouponCode,
      discountApplied,
    });

    const savedOrder = await newOrder.save({ session });

    await User.updateOne(
      { _id: userId },
      { $inc: { points: totalEarnedPoints } },
    ).session(session);

    await session.commitTransaction();

    res.status(201).json({
      message:
        "Order created successfully! Your package will be prepared soon.",
      order: savedOrder,
      pointsEarned: totalEarnedPoints,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error creating order:", error.message);
    res.status(500).json({ message: "Error processing purchase." });
  } finally {
    session.endSession();
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const orders = await Order.find({
      tenantId: req.tenant._id,
      user: req.user.id,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments({
      tenantId: req.tenant._id,
      user: req.user.id,
    });

    res.status(200).json({
      info: {
        total,
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
      },
      results: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    res.status(500).json({ message: "Error fetching your orders." });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    let query = { tenantId: req.tenant._id };
    if (status && VALID_ORDER_STATUSES.includes(status)) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      info: {
        total,
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
      },
      results: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    res.status(500).json({ message: "Error fetching all orders." });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingCode } = req.body;

    if (!status || !VALID_ORDER_STATUSES.includes(status)) {
      return res
        .status(400)
        .json({
          message: `Invalid status. Must be one of: ${VALID_ORDER_STATUSES.join(", ")}`,
        });
    }

    const order = await Order.findOne({ _id: id, tenantId: req.tenant._id });
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (status === "Cancelado" && order.status !== "Cancelado") {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        for (let item of order.products) {
          await Product.updateOne(
            { _id: item.product },
            { $inc: { stock: item.quantity } },
          ).session(session);
        }
        order.status = status;
        order.trackingCode = trackingCode || order.trackingCode;
        await order.save({ session });
        await session.commitTransaction();
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } else {
      order.status = status;
      order.trackingCode = trackingCode || order.trackingCode;
      await order.save();
    }

    res
      .status(200)
      .json({ message: "Order status updated successfully.", order });
  } catch (error) {
    console.error("Error updating status:", error.message);
    res.status(500).json({ message: "Error updating status." });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, tenantId: req.tenant._id });
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (order.status !== "Cancelado") {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        for (let item of order.products) {
          await Product.updateOne(
            { _id: item.product },
            { $inc: { stock: item.quantity } },
          ).session(session);
        }
        order.status = "Cancelado";
        await order.save({ session });
        await session.commitTransaction();
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    }

    res.status(200).json({ message: "Order cancelled successfully." });
  } catch (error) {
    console.error("Error deleting order:", error.message);
    res.status(500).json({ message: "Error deleting order." });
  }
};

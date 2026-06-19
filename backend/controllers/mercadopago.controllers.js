import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import WebhookEvent from "../models/WebhookEvent.js";
import Coupon from "../models/Coupon.js";
import { MercadoPagoConfig, Preference } from "mercadopago";

export const createMercadoPagoPreference = async (req, res) => {
  try {
    const { products, shippingAddress, couponCode } = req.body;
    const userId = req.user.id;
    const tenant = req.tenant;

    const mpConfig = tenant.settings.paymentMethods.find(
      (m) => m.type === "mercadopago" && m.enabled,
    );

    if (!mpConfig || !mpConfig.config?.accessToken) {
      return res
        .status(400)
        .json({ message: "MercadoPago is not configured for this store." });
    }

    const client = new MercadoPagoConfig({
      accessToken: mpConfig.config.accessToken,
    });
    const preference = new Preference(client);

    let totalAmount = 0;
    const items = [];
    const orderProducts = [];

    for (let item of products) {
      const productFound = await Product.findOne({
        _id: item.product,
        tenantId: tenant._id,
        isDeleted: false,
      });
      if (!productFound) {
        return res
          .status(404)
          .json({ message: `Product ${item.product} not found` });
      }
      if (productFound.stock < item.quantity) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for ${productFound.model}` });
      }

      const unitPrice =
        productFound.discount > 0
          ? productFound.price -
            productFound.price * (productFound.discount / 100)
          : productFound.price;

      totalAmount += unitPrice * item.quantity;

      items.push({
        id: productFound._id.toString(),
        title: productFound.model,
        unit_price: unitPrice,
        quantity: item.quantity,
        currency_id: tenant.settings.currency === "ARS" ? "ARS" : "USD",
      });

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
        tenantId: tenant._id,
      });
      if (
        coupon &&
        coupon.isActive &&
        (!coupon.expiresAt || new Date(coupon.expiresAt) > new Date()) &&
        (!coupon.maxUses || coupon.usedCount < coupon.maxUses)
      ) {
        discountApplied = totalAmount * (coupon.discountPercentage / 100);

        const discountFactor = 1 - coupon.discountPercentage / 100;

        items.forEach((item) => {
          item.unit_price = Number(
            (item.unit_price * discountFactor).toFixed(2),
          );
        });

        totalAmount -= discountApplied;
        finalCouponCode = coupon.code;
      }
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const orderId = `temp_mp_${Date.now()}_${userId}`;

    const result = await preference.create({
      body: {
        items,
        external_reference: orderId,
        back_urls: {
          success: `${frontendUrl}/payment/success`,
          failure: `${frontendUrl}/payment/failure`,
          pending: `${frontendUrl}/payment/pending`,
        },
        auto_return: "approved",
        notification_url: `${process.env.BACKEND_URL || "http://localhost:3001"}/api/payments/webhook/mercadopago`,
        metadata: {
          userId,
          tenantId: tenant._id.toString(),
          shippingAddress: JSON.stringify(shippingAddress),
          orderProducts: JSON.stringify(orderProducts),
          totalAmount,
          couponCode: finalCouponCode || "",
          discountApplied: discountApplied || 0,
          orderId,
        },
      },
    });

    res.json({ preferenceId: result.id, initPoint: result.init_point });
  } catch (error) {
    console.error("Error creating MercadoPago preference:", error.message);
    res.status(500).json({ message: "Error creating payment preference." });
  }
};

export const handleMercadoPagoWebhook = async (req, res) => {
  try {
    const { type, data } = req.query;

    if (type === "payment" && data?.id) {
      const paymentId = data.id;
      const existingEvent = await WebhookEvent.findOne({
        eventId: `mp_${paymentId}`,
      });
      if (existingEvent) {
        return res.status(200).json({ message: "OK" });
      }

      const tenant = await Tenant.findOne({
        "settings.paymentMethods.type": "mercadopago",
      });
      if (!tenant) return res.status(200).json({ message: "OK" });

      const mpConfig = tenant.settings.paymentMethods.find(
        (m) => m.type === "mercadopago" && m.enabled,
      );
      if (!mpConfig) return res.status(200).json({ message: "OK" });

      const client = new MercadoPagoConfig({
        accessToken: mpConfig.config.accessToken,
      });
      const paymentUrl = `https://api.mercadopago.com/v1/payments/${paymentId}`;
      const paymentResponse = await fetch(paymentUrl, {
        headers: { Authorization: `Bearer ${mpConfig.config.accessToken}` },
      });
      const payment = await paymentResponse.json();

      if (payment.status === "approved") {
        const metadata = payment.metadata;

        if (metadata.tenantId && metadata.tenantId !== tenant._id.toString()) {
          return res.status(200).json({ message: "OK" });
        }

        await WebhookEvent.create({
          eventId: `mp_${paymentId}`,
          provider: "mercadopago",
          tenantId: tenant._id,
        });

        const orderProducts = JSON.parse(metadata.orderProducts || "[]");
        const shippingAddress = JSON.parse(metadata.shippingAddress || "{}");

        const existingOrder = await Order.findOne({
          externalReference: metadata.orderId,
        });
        if (existingOrder) {
          return res.status(200).json({ message: "OK" });
        }

        const session = await mongoose.startSession();
        session.startTransaction();
        try {
          for (let item of orderProducts) {
            const product = await Product.findOneAndUpdate(
              { _id: item.product, stock: { $gte: item.quantity } },
              { $inc: { stock: -item.quantity } },
            ).session(session);

            if (!product) {
              throw new Error(`Insufficient stock for product ${item.product}`);
            }
          }

          if (metadata.couponCode) {
            const coupon = await Coupon.findOne({
              code: metadata.couponCode,
              tenantId: metadata.tenantId,
            }).session(session);
            if (coupon) {
              coupon.usedCount += 1;
              await coupon.save({ session });
            }
          }

          const newOrder = new Order({
            tenantId: metadata.tenantId,
            user: metadata.userId,
            products: orderProducts,
            shippingAddress,
            shippingCost: 0,
            totalAmount: metadata.totalAmount,
            couponCode: metadata.couponCode || null,
            discountApplied: metadata.discountApplied || 0,
            paymentMethod: "mercadopago",
            paymentStatus: "confirmed",
            externalReference: metadata.orderId,
          });

          const savedOrder = await newOrder.save({ session });

          const userFound = await User.findById(metadata.userId);
          if (userFound) {
            let totalEarnedPoints = 0;
            for (let item of orderProducts) {
              const product = await Product.findById(item.product);
              totalEarnedPoints += (product?.earnedPoints || 0) * item.quantity;
            }
            await User.updateOne(
              { _id: metadata.userId },
              { $inc: { points: totalEarnedPoints } },
            ).session(session);
          }

          await session.commitTransaction();
          console.log(`Order created from MercadoPago: ${savedOrder._id}`);
        } catch (error) {
          await session.abortTransaction();
          throw error;
        } finally {
          session.endSession();
        }
      }
    }

    res.status(200).json({ message: "OK" });
  } catch (error) {
    console.error("Error in MercadoPago webhook:", error.message);
    res.status(200).json({ message: "OK" });
  }
};

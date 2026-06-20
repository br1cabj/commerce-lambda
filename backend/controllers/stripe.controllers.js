import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import WebhookEvent from "../models/WebhookEvent.js";
import Coupon from "../models/Coupon.js";
import Stripe from "stripe";

export const createStripeSession = async (req, res) => {
  try {
    const { products, shippingAddress, couponCode } = req.body;
    const userId = req.user.id;
    const tenant = req.tenant;

    const stripeConfig = tenant.settings.paymentMethods.find(
      (m) => m.type === "stripe" && m.enabled,
    );

    if (!stripeConfig || !stripeConfig.config?.secretKey) {
      return res
        .status(400)
        .json({ message: "Stripe is not configured for this store." });
    }

    const stripe = new Stripe(stripeConfig.config.secretKey);

    let totalAmount = 0;
    const lineItems = [];
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

      lineItems.push({
        price_data: {
          currency: tenant.settings.currency === "ARS" ? "ars" : "usd",
          product_data: {
            name: productFound.model,
            description: productFound.brand,
          },
          unit_amount: Math.round(unitPrice * 100),
        },
        quantity: item.quantity,
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
        const user = await User.findById(userId);
        if (coupon.pointsRequired > 0 && user.points < coupon.pointsRequired) {
          return res.status(400).json({ message: "Not enough points for this coupon." });
        }

        discountApplied = totalAmount * (coupon.discountPercentage / 100);

        const discountFactor = 1 - coupon.discountPercentage / 100;

        lineItems.forEach((item) => {
          item.price_data.unit_amount = Math.round(
            item.price_data.unit_amount * discountFactor,
          );
        });

        totalAmount -= discountApplied;
        finalCouponCode = coupon.code;
      }
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const orderId = `temp_stripe_${Date.now()}_${userId}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      customer_email: req.user.email,
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
      success_url: `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/payment/failure`,
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Error creating Stripe session:", error.message);
    res.status(500).json({ message: "Error creating payment session." });
  }
};

export const handleStripeWebhook = async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    const tenantId = req.body?.metadata?.tenantId || req.tenant?._id;

    let tenant;
    if (tenantId) {
      tenant = await Tenant.findById(tenantId);
    } else {
      tenant = await Tenant.findOne({
        "settings.paymentMethods.type": "stripe",
      });
    }

    if (!tenant)
      return res.status(400).json({ message: "No Stripe tenant found" });

    const stripeConfig = tenant.settings.paymentMethods.find(
      (m) => m.type === "stripe" && m.enabled,
    );
    if (!stripeConfig)
      return res.status(400).json({ message: "Stripe not configured" });

    const stripe = new Stripe(stripeConfig.config.secretKey);
    const webhookSecret = stripeConfig.config.webhookSecret;

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      return res.status(400).json({ message: `Webhook Error: ${err.message}` });
    }

    const existingEvent = await WebhookEvent.findOne({ eventId: event.id });
    if (existingEvent) {
      return res
        .status(200)
        .json({ received: true, message: "Event already processed" });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const metadata = session.metadata;

      if (metadata.tenantId !== tenant._id.toString()) {
        return res.status(403).json({ message: "Tenant mismatch." });
      }

      await WebhookEvent.create({
        eventId: event.id,
        provider: "stripe",
        tenantId: tenant._id,
      });

      const orderProducts = JSON.parse(metadata.orderProducts || "[]");
      const shippingAddress = JSON.parse(metadata.shippingAddress || "{}");

      const existingOrder = await Order.findOne({
        externalReference: metadata.orderId,
      });
      if (existingOrder) {
        return res
          .status(200)
          .json({ received: true, message: "Order already created" });
      }

      const sessionDb = await mongoose.startSession();
      sessionDb.startTransaction();
      try {
        for (let item of orderProducts) {
          const product = await Product.findOneAndUpdate(
            { _id: item.product, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } },
          ).session(sessionDb);

          if (!product) {
            throw new Error(`Insufficient stock for product ${item.product}`);
          }
        }

        if (metadata.couponCode) {
          const coupon = await Coupon.findOne({
            code: metadata.couponCode,
            tenantId: metadata.tenantId,
          }).session(sessionDb);
          if (coupon) {
            coupon.usedCount += 1;
            await coupon.save({ session: sessionDb });
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
          paymentMethod: "stripe",
          paymentStatus: "confirmed",
          externalReference: metadata.orderId,
        });

        const savedOrder = await newOrder.save({ session: sessionDb });

        const userFound = await User.findById(metadata.userId);
        if (userFound) {
          let totalEarnedPoints = 0;
          for (let item of orderProducts) {
            const product = await Product.findById(item.product);
            totalEarnedPoints += (product?.earnedPoints || 0) * item.quantity;
          }
          let pointsToDeduct = 0;
          if (metadata.couponCode) {
            const c = await Coupon.findOne({ code: metadata.couponCode, tenantId: metadata.tenantId }).session(sessionDb);
            if (c) pointsToDeduct = c.pointsRequired || 0;
          }
          await User.updateOne(
            { _id: metadata.userId },
            { $inc: { points: totalEarnedPoints - pointsToDeduct } },
          ).session(sessionDb);
        }

        await sessionDb.commitTransaction();
        console.log(`Order created from Stripe: ${savedOrder._id}`);
      } catch (error) {
        await sessionDb.abortTransaction();
        throw error;
      } finally {
        sessionDb.endSession();
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Error in Stripe webhook:", error.message);
    res.status(400).json({ message: `Webhook Error: ${error.message}` });
  }
};

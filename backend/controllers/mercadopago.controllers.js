import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import WebhookEvent from "../models/WebhookEvent.js";
import Coupon from "../models/Coupon.js";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { sendOrderConfirmationEmail } from "../utils/emailService.js";

export const createMercadoPagoPreference = async (req, res) => {
  try {
    const { products, shippingAddress, couponCode, shippingCost } = req.body;
    const userId = req.user.id;
    const tenant = req.tenant;

    if (
      shippingCost !== undefined &&
      (typeof shippingCost !== "number" || shippingCost < 0)
    ) {
      return res.status(400).json({ message: "Invalid shipping cost." });
    }

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
          ? Math.round(
              (productFound.price -
                productFound.price * (productFound.discount / 100)) *
                100,
            ) / 100
          : productFound.price;

      totalAmount = Math.round((totalAmount + unitPrice * item.quantity) * 100) / 100;

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
        const user = await User.findById(userId);
        if (coupon.pointsRequired > 0 && user.points < coupon.pointsRequired) {
          return res
            .status(400)
            .json({ message: "Not enough points for this coupon." });
        }

        discountApplied = Math.round((totalAmount * (coupon.discountPercentage / 100)) * 100) / 100;

        const discountFactor = 1 - coupon.discountPercentage / 100;

        items.forEach((item) => {
          item.unit_price = Number(
            (item.unit_price * discountFactor).toFixed(2),
          );
        });

        totalAmount = Math.round((totalAmount - discountApplied) * 100) / 100;
        finalCouponCode = coupon.code;
      }
    }

    if (shippingCost > 0) {
      totalAmount += shippingCost;
      items.push({
        id: "shipping",
        title: "Shipping Cost",
        unit_price: shippingCost,
        quantity: 1,
        currency_id: tenant.settings.currency === "ARS" ? "ARS" : "USD",
      });
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
        notification_url: `${process.env.BACKEND_URL || "http://localhost:3001"}/api/payments/webhook/mercadopago?tenantId=${tenant._id.toString()}`,
        metadata: {
          userId,
          tenantId: tenant._id.toString(),
          shippingAddress: JSON.stringify(shippingAddress),
          orderProducts: JSON.stringify(orderProducts),
          totalAmount,
          shippingCost: shippingCost || 0,
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

      const tenantIdFromQuery = req.query.tenantId;

      let tenant;
      if (tenantIdFromQuery) {
        tenant = await Tenant.findById(tenantIdFromQuery);
      }
      
      if (!tenant) {
        tenant = await Tenant.findOne({
          "settings.paymentMethods": {
            $elemMatch: { type: "mercadopago", enabled: true },
          },
        });
      }

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

      // Now we have the payment, let's verify if the tenant matches the metadata
      if (payment.metadata?.tenant_id) { // MP lowercases metadata keys
        const correctTenant = await Tenant.findById(payment.metadata.tenant_id);
        if (correctTenant && correctTenant._id.toString() !== tenant._id.toString()) {
           // We used the wrong token to fetch! We must fetch again with the correct token.
           tenant = correctTenant;
           const correctMpConfig = tenant.settings.paymentMethods.find((m) => m.type === "mercadopago" && m.enabled);
           if (correctMpConfig) {
             const retryResponse = await fetch(paymentUrl, { headers: { Authorization: `Bearer ${correctMpConfig.config.accessToken}` } });
             Object.assign(payment, await retryResponse.json());
           }
        }
      }

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
              { $inc: { stock: -item.quantity, salesCount: item.quantity } },
            ).session(session);

            if (!product) {
              throw new Error(`Insufficient stock for product ${item.product}`);
            }
          }

          if (metadata.couponCode) {
            const coupon = await Coupon.findOneAndUpdate(
              {
                code: metadata.couponCode,
                tenantId: metadata.tenantId,
              },
              { $inc: { usedCount: 1 } },
              { session, new: true }
            );
          }

          const newOrder = new Order({
            tenantId: metadata.tenantId,
            user: metadata.userId,
            products: orderProducts,
            shippingAddress,
            shippingCost: metadata.shippingCost || 0,
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
            const productIds = orderProducts.map(i => i.product);
            const productsInfo = await Product.find({ _id: { $in: productIds } }).session(session);
            for (let item of orderProducts) {
              const product = productsInfo.find(p => p._id.toString() === item.product.toString());
              totalEarnedPoints += (product?.earnedPoints || 0) * item.quantity;
            }
            let pointsToDeduct = 0;
            if (metadata.couponCode) {
              const c = await Coupon.findOne({
                code: metadata.couponCode,
                tenantId: metadata.tenantId,
              }).session(session);
              if (c) pointsToDeduct = c.pointsRequired || 0;
            }
            const pointsDelta = totalEarnedPoints - pointsToDeduct;
            await User.updateOne(
              { _id: metadata.userId },
              pointsDelta >= 0
                ? { $inc: { points: pointsDelta } }
                : [ { $set: { points: { $max: [0, { $add: ["$points", pointsDelta] }] } } } ]
            ).session(session);
          }

          await session.commitTransaction();
          console.log(`Order created from MercadoPago: ${savedOrder._id}`);
          if (userFound) {
            sendOrderConfirmationEmail(tenant, userFound, savedOrder);
          }
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

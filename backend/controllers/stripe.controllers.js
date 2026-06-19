import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import Stripe from "stripe";

export const createStripeSession = async (req, res) => {
    try {
        const { products, shippingAddress } = req.body;
        const userId = req.user.id;
        const tenant = req.tenant;

        const stripeConfig = tenant.settings.paymentMethods.find(
            m => m.type === "stripe" && m.enabled
        );

        if (!stripeConfig || !stripeConfig.config?.secretKey) {
            return res.status(400).json({ message: "Stripe is not configured for this store." });
        }

        const stripe = new Stripe(stripeConfig.config.secretKey);

        let totalAmount = 0;
        const lineItems = [];
        const orderProducts = [];

        for (let item of products) {
            const productFound = await Product.findOne({ _id: item.product, tenantId: tenant._id });
            if (!productFound) {
                return res.status(404).json({ message: `Product ${item.product} not found` });
            }
            if (productFound.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${productFound.model}` });
            }

            const unitPrice = productFound.discount > 0
                ? productFound.price - productFound.price * (productFound.discount / 100)
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
                orderId,
            },
            success_url: `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${frontendUrl}/payment/failure`,
        });

        res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.log("Error creating Stripe session:", error.message);
        res.status(500).json({ message: "Error creating payment session." });
    }
};

export const handleStripeWebhook = async (req, res) => {
    try {
        const sig = req.headers["stripe-signature"];
        const tenant = await Tenant.findOne({ "settings.paymentMethods.type": "stripe" });
        if (!tenant) return res.status(400).json({ message: "No Stripe tenant found" });

        const stripeConfig = tenant.settings.paymentMethods.find(
            m => m.type === "stripe" && m.enabled
        );
        if (!stripeConfig) return res.status(400).json({ message: "Stripe not configured" });

        const stripe = new Stripe(stripeConfig.config.secretKey);
        const webhookSecret = stripeConfig.config.webhookSecret;

        let event;
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } catch (err) {
            return res.status(400).json({ message: `Webhook Error: ${err.message}` });
        }

        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const metadata = session.metadata;

            const orderProducts = JSON.parse(metadata.orderProducts || "[]");
            const shippingAddress = JSON.parse(metadata.shippingAddress || "{}");

            for (let item of orderProducts) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.stock -= item.quantity;
                    await product.save();
                }
            }

            const newOrder = new Order({
                tenantId: metadata.tenantId,
                user: metadata.userId,
                products: orderProducts,
                shippingAddress,
                shippingCost: 0,
                totalAmount: metadata.totalAmount,
                paymentMethod: "stripe",
                paymentStatus: "confirmed",
            });

            const savedOrder = await newOrder.save();

            const userFound = await User.findById(metadata.userId);
            if (userFound) {
                let totalEarnedPoints = 0;
                for (let item of orderProducts) {
                    const product = await Product.findById(item.product);
                    totalEarnedPoints += (product?.earnedPoints || 0) * item.quantity;
                }
                userFound.points += totalEarnedPoints;
                await userFound.save();
            }

            console.log(`Order created from Stripe: ${savedOrder._id}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.log("Error in Stripe webhook:", error.message);
        res.status(400).json({ message: `Webhook Error: ${error.message}` });
    }
};

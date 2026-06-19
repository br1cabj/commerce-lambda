import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

export const createOrder = async (req, res) => {
    try {
        const { products, shippingAddress, shippingCost } = req.body;
        const userId = req.user.id;

        let totalAmount = 0;
        let totalEarnedPoints = 0;
        const orderProducts = [];

        for (let item of products) {
            const productFound = await Product.findOne({ _id: item.product, tenantId: req.tenant._id });

            if(!productFound){
                return res.status(404).json({ message: "A product in your cart does not exist" });
            }

            if(productFound.stock < item.quantity){
                return res.status(400).json({ message: `Insufficient stock for ${productFound.name}.` });
            }

            totalAmount += productFound.price * item.quantity;
            totalEarnedPoints += (productFound.earnedPoints || 0) * item.quantity;

            productFound.stock -= item.quantity;
            await productFound.save();

            orderProducts.push({
                product: productFound._id,
                quantity: item.quantity,
                price: productFound.price
            });
        }

        totalAmount += (shippingCost || 0);

        const newOrder = new Order({
            tenantId: req.tenant._id,
            user: userId,
            products: orderProducts,
            shippingAddress,
            shippingCost: shippingCost || 0,
            totalAmount
        });

        const savedOrder = await newOrder.save();

        const userFound = await User.findById(userId);
        userFound.points += totalEarnedPoints;
        await userFound.save();

        res.status(201).json({
            message: "Order created successfully! Your package will be prepared soon.",
            order: savedOrder,
            pointsEarned: totalEarnedPoints
        });
    } catch (error) {
        console.log("Error creating order:", error.message);
        res.status(500).json({ message: "Error processing purchase." });
    }
};

export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ tenantId: req.tenant._id, user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Error fetching your orders." });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({ tenantId: req.tenant._id }).populate("user", "name email").sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Error fetching all orders." });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, trackingCode } = req.body;

        const order = await Order.findOne({ _id: id, tenantId: req.tenant._id });
        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }

        if (status === "Cancelled" && order.status !== "Cancelled") {
            for (let item of order.products) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.stock += item.quantity;
                    await product.save();
                }
            }
        }

        order.status = status;
        order.trackingCode = trackingCode;
        const updatedOrder = await order.save();

        res.status(200).json({ message: "Order status updated successfully.", order: updatedOrder });
    } catch (error) {
        console.log("Error updating status:", error.message);
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

        if (order.status !== "Cancelled") {
            for (let item of order.products) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.stock += item.quantity;
                    await product.save();
                }
            }
        }

        await Order.findByIdAndDelete(id);
        
        res.status(200).json({ message: "Order deleted permanently." });
    } catch (error) {
        console.log("Error deleting order:", error.message);
        res.status(500).json({ message: "Error deleting order." });
    }
};

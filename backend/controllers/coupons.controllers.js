import Coupon from "../models/Coupon.js";
import User from "../models/User.js";
import { transporter } from "../config/mailer.js";

export const createCoupon = async (req, res) => {
    try {
        const { code, discountPercentage, pointsRequired, expiresAt, maxUses } = req.body;

        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase(), tenantId: req.tenant._id });
        if (existingCoupon) {
            return res.status(400).json({ message: "This coupon code already exists." });
        }

        const newCoupon = new Coupon({
            tenantId: req.tenant._id,
            code,
            discountPercentage,
            pointsRequired,
            expiresAt: expiresAt || null,
            maxUses: maxUses || null
        });

        const savedCoupon = await newCoupon.save();

        res.status(201).json({ message: "Coupon created successfully!", coupon: savedCoupon });
    } catch (error) {
        console.error("Error creating coupon:", error.message);
        res.status(500).json({ message: "Error creating coupon." });
    }
};

export const toggleCoupon = async (req, res) => {
    try {
        const { id } = req.params;

        const couponFound = await Coupon.findOne({ _id: id, tenantId: req.tenant._id });
        if (!couponFound) {
            return res.status(404).json({ message: "Coupon not found." });
        }

        couponFound.isActive = !couponFound.isActive;
        await couponFound.save();

        res.status(200).json({ message: `Coupon is now ${couponFound.isActive ? 'ACTIVE' : 'INACTIVE'}`, coupon: couponFound });
    } catch (error) {
        console.error("Error updating coupon:", error.message);
        res.status(500).json({ message: "Error updating coupon." });
    }
};

export const sendPromoEmail = async (req, res) => {
    try {
        const { title, message, discountCode } = req.body;

        const allUsers = await User.find({ tenantId: req.tenant._id }).select("email name");
        const totalUsers = allUsers.length;

        if (totalUsers === 0) {
            return res.status(400).json({ message: "No users found to send emails." });
        }

        const BATCH_SIZE = 10;
        const BATCH_DELAY = 2000;
        let sentCount = 0;
        let failedCount = 0;

        for (let i = 0; i < totalUsers; i += BATCH_SIZE) {
            const batch = allUsers.slice(i, i + BATCH_SIZE);
            const promises = batch.map(async (user) => {
                try {
                    await transporter.sendMail({
                        from: `"${req.tenant.name}" <${process.env.EMAIL_USER}>`,
                        to: user.email,
                        subject: title,
                        html: `
                            <div style="font-family: Arial, sans-serif; text-align: center; color: #333;">
                                <h2>Hello ${user.name}!</h2>
                                <p>${message}</p>
                                <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px; margin: 20px 0;">
                                    <p style="margin: 0; font-size: 16px;">Your gift code is:</p>
                                    <h1 style="color: #fca311; letter-spacing: 2px; margin: 10px 0;">${discountCode}</h1>
                                </div>
                                <p>We look forward to seeing you in the store!</p>
                            </div>
                        `
                    });
                    sentCount++;
                } catch (err) {
                    console.error(`Failed to send email to ${user.email}:`, err.message);
                    failedCount++;
                }
            });

            await Promise.allSettled(promises);

            if (i + BATCH_SIZE < totalUsers) {
                await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
            }
        }

        res.status(200).json({
            message: "Promotional email campaign completed.",
            totalUsers,
            sent: sentCount,
            failed: failedCount
        });
    } catch (error) {
        console.error("Error sending promotions:", error.message);
        res.status(500).json({ message: "Server error sending emails." });
    }
};

export const validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;

        const couponFound = await Coupon.findOne({ code: code.toUpperCase(), tenantId: req.tenant._id });

        if (!couponFound) {
            return res.status(404).json({ message: "Coupon does not exist or is misspelled." });
        }

        if (!couponFound.isActive) {
            return res.status(400).json({ message: "This coupon has been deactivated." });
        }

        if (couponFound.expiresAt && new Date(couponFound.expiresAt) < new Date()) {
            return res.status(400).json({ message: "This coupon has expired." });
        }

        if (couponFound.maxUses && couponFound.usedCount >= couponFound.maxUses) {
            return res.status(400).json({ message: "This coupon has reached its maximum uses." });
        }

        res.status(200).json(couponFound);
    } catch (error) {
        console.error("Error validating coupon:", error.message);
        res.status(500).json({ message: "Error validating coupon." });
    }
};

export const getAllCoupons = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const coupons = await Coupon.find({ tenantId: req.tenant._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Coupon.countDocuments({ tenantId: req.tenant._id });

        res.status(200).json({
            info: { total, currentPage: Number(page), totalPages: Math.ceil(total / limit) },
            results: coupons
        });
    } catch (error) {
        console.error("Error fetching coupons:", error.message);
        res.status(500).json({ message: "Error fetching coupons." });
    }
};

export const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCoupon = await Coupon.findOneAndDelete({ _id: id, tenantId: req.tenant._id });

        if (!deletedCoupon) {
            return res.status(404).json({ message: "Coupon not found." });
        }
        res.status(200).json({ message: "Coupon deleted successfully." });
    } catch (error) {
        console.error("Error deleting coupon:", error.message);
        res.status(500).json({ message: "Error deleting coupon." });
    }
};

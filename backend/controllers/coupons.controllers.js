import Coupon from "../models/Coupon.js";
import User from "../models/User.js";
import { transporter } from "../config/mailer.js";

export const createCoupon = async (req, res) => {
    try{
        const { code, discountPercentage, pointsRequired } = req.body;

        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase(), tenantId: req.tenant._id });
        if(existingCoupon){
            return res.status(400).json({ message: "This coupon code already exists!" });
        }

        const newCoupon = new Coupon({
            tenantId: req.tenant._id,
            code,
            discountPercentage,
            pointsRequired
        });

        const savedCoupon = await newCoupon.save();

        res.status(201).json({ message: "Coupon created successfully!", coupon: savedCoupon });
    }catch (error){
        console.log("Error creating coupon", error.message);
        res.status(500).json({ message: "Error creating coupon." });
    }
};

export const toggleCoupon = async (req, res) => {
    try {
        const { id } = req.params;

        const couponFound = await Coupon.findOne({ _id: id, tenantId: req.tenant._id });
        if(!couponFound){
            return res.status(404).json({ message: "Coupon not found." });
        }

        couponFound.isActive = !couponFound.isActive;
        await couponFound.save();

        res.status(200).json({ message: `Coupon is now ${couponFound.isActive ? 'ACTIVE' : 'INACTIVE'}`, coupon: couponFound });
    } catch (error) {
        console.log("Error updating coupon:", error.message);
        res.status(500).json({ message: "Error updating coupon." });
    }
};

export const sendPromoEmail = async (req, res) => {
    try {
        const { title, message, discountCode } = req.body;

        const allUsers = await User.find({ tenantId: req.tenant._id });

        for (let user of allUsers) {
            await transporter.sendMail({
                from: `"${req.tenant.name}" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: `${title}`,
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
        };

        res.status(200).json({ message: "Promotional emails sent to all customers successfully!" });
    } catch (error) {
        console.log("Error sending promotions:", error.message);
        res.status(500).json({ message: "Server error sending emails."});
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
            return res.status(400).json({ message: "This coupon has expired or is deactivated." });
        }

        res.status(200).json(couponFound);
    } catch (error) {
        console.log("Error validating coupon:", error.message);
        res.status(500).json({ message: "Error validating coupon." });
    }
};

export const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({ tenantId: req.tenant._id }).sort({ createdAt: -1 });
        res.status(200).json(coupons);
    } catch (error) {
        console.log("Error fetching coupons:", error.message);
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
        console.log("Error deleting coupon:", error.message);
        res.status(500).json({ message: "Error deleting coupon." });
    }
};

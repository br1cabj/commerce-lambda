import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

router.get("/", (req, res) => {
    res.json({ message: "Welcome to the Store API!" });
});

router.get("/health", async (req, res) => {
    try {
        const dbState = mongoose.connection.readyState;
        const dbStatus = dbState === 1 ? "connected" : "disconnected";
        res.status(200).json({
            status: "ok",
            database: dbStatus,
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

export default router;

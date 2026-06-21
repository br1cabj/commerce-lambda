import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdminForTenant } from "../middleware/tenantAuth.js";
import { identifyTenant } from "../middleware/identifyTenant.js";
import EmailTemplate from "../models/EmailTemplate.js";

const router = express.Router();

router.use(identifyTenant);

router.get("/", verifyToken, isAdminForTenant, async (req, res) => {
  try {
    const templates = await EmailTemplate.find({ tenantId: req.tenant._id });
    res.json(templates);
  } catch (error) {
    console.error("Error fetching email templates:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.put("/", verifyToken, isAdminForTenant, async (req, res) => {
  try {
    const { trigger, subject, bodyHtml, isActive } = req.body;

    let template = await EmailTemplate.findOne({
      tenantId: req.tenant._id,
      trigger,
    });

    if (template) {
      template.subject = subject;
      template.bodyHtml = bodyHtml;
      template.isActive = isActive;
      await template.save();
    } else {
      template = await EmailTemplate.create({
        tenantId: req.tenant._id,
        trigger,
        subject,
        bodyHtml,
        isActive,
      });
    }

    res.json(template);
  } catch (error) {
    console.error("Error updating email template:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;

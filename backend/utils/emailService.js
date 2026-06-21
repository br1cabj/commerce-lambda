import { transporter } from "../config/mailer.js";

export const sendOrderConfirmationEmail = async (tenant, user, order) => {
  if (!process.env.EMAIL_USER) return;

  try {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const orderLink = `${frontendUrl}/profile`;

    await transporter.sendMail({
      from: `"${tenant.name}" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Order Confirmation - #${order._id.toString().substring(0, 8)}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
          <h2 style="color: ${tenant.theme?.primaryColor || "#000"};">Thank you for your purchase, ${user.name}!</h2>
          <p>We've received your order and we are getting it ready for you.</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Total Amount:</strong> $${order.totalAmount}</p>
            <p><strong>Status:</strong> ${order.status}</p>
          </div>
          <p>You can check the status of your order at any time from your profile.</p>
          <a href="${orderLink}" style="background-color: ${tenant.theme?.accentColor || "#fca311"}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0;">View My Orders</a>
          <p style="font-size: 12px; color: #999;">If you have any questions, please reply to this email or contact our support.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending order confirmation email:", error.message);
  }
};

export const sendOrderStatusEmail = async (tenant, user, order) => {
  if (!process.env.EMAIL_USER) return;

  try {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const orderLink = `${frontendUrl}/profile`;

    await transporter.sendMail({
      from: `"${tenant.name}" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Order Update - #${order._id.toString().substring(0, 8)}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
          <h2 style="color: ${tenant.theme?.primaryColor || "#000"};">Your order status has changed</h2>
          <p>Hello ${user.name}, your order <strong>#${order._id.toString().substring(0, 8)}</strong> has been updated to:</p>
          <h3 style="background-color: #f4f4f4; padding: 10px; border-radius: 5px; text-align: center;">${order.status}</h3>
          
          ${order.trackingCode ? `<p><strong>Tracking Code:</strong> ${order.trackingCode}</p>` : ""}
          
          <a href="${orderLink}" style="background-color: ${tenant.theme?.accentColor || "#fca311"}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0;">View Details</a>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending order status email:", error.message);
  }
};

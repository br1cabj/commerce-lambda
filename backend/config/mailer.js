import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE !== "false",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter
    .verify()
    .then(() => {
      console.log("Email service is ready to send messages!");
    })
    .catch((error) => {
      console.error("Error connecting to email service:", error.message);
    });
} else {
  console.warn(
    "Email service is disabled. Please provide EMAIL_USER and EMAIL_PASS in your .env file.",
  );
}

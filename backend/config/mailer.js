import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
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
      console.log("Error connecting to email service:", error.message);
    });
} else {
  console.log("Email service is disabled. Please provide EMAIL_USER and EMAIL_PASS in your .env file.");
}

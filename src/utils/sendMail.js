const nodemailer = require("nodemailer");
// const config = require('../config');

const sendEmail = async (to, subject, htmlContent, attachments) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // TLS for port 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: htmlContent,
    attachments:
      Array.isArray(attachments) && attachments.length
        ? attachments
        : undefined,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// Exporting as an object so destructuring works
module.exports = sendEmail;

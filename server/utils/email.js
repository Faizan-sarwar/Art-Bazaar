const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send OTP Email
const sendOTPEmail = async (email, otp, fullName) => {
  try {
    const mailOptions = {
      from: `"ArtBazaar" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Email Verification - ArtBazaar',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Welcome to ArtBazaar!</h2>
          <p>Hi ${fullName},</p>
          <p>Your verification code is:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #7c3aed;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>Best regards,<br>ArtBazaar Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully');
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    throw error;
  }
};

// Send Password Reset Email
const sendResetPasswordEmail = async (email, resetToken, fullName) => {
  try {
    const resetURL = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"ArtBazaar" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset - ArtBazaar',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Password Reset Request</h2>
          <p>Hi ${fullName},</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetURL}" style="background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy this link: ${resetURL}</p>
          <p>This link expires in 1 hour.</p>
          <p>Best regards,<br>ArtBazaar Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent');
  } catch (error) {
    console.error('❌ Error sending reset email:', error);
    throw error;
  }
};

module.exports = { sendOTPEmail, sendResetPasswordEmail };
import nodemailer from "nodemailer";

export const emailForgotPassword = async (to: string, otp: string) => {
  const { SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_USER || !SMTP_PASS) {
    console.error(
      "SMTP_USER and SMTP_PASS must be defined in environment variables"
    );
    return;
  }
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  try {
    await transport.verify();
  } catch (error) {
    console.error("SMTP connection failed:", error);
    return;
  }

  const emailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Forgot Password</title>
  <style>
    body {
      font-family: Helvetica, Arial, sans-serif;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }

    .container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
    }

    .heading {
      font-size: 24px;
      font-weight: bold;
      margin: 1rem 0;
    }

    .text {
      font-size: 16px;
      line-height: 24px;
      margin: 16px 0;
    }

    .otp {
      font-size: 24px;
      font-weight: bold;
      margin: 16px 0;
    }

    .footer {
      padding-top: 20px;
      text-align: center;
    }

    .footer-text {
      font-size: 14px;
      color: #999999;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1 class="heading">Reset Your Password</h1>
    <p class="text">
      Please use the verification code below to reset your password
      for your YUM QUICK App.
    </p>
    <p class="otp">${otp}</p>
    <p class="text">
      If you didn’t request a password reset, you can ignore this
      email.
    </p>
    <p class="text">
      Thanks,
      <br />
      The YUM QUICK Team
    </p>
    <hr>
    <div class="footer">
      <p class="footer-text">
        Made with ♥ by the YUM QUICK Team
      </p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    await transport.sendMail({
      from: `YUM QUICK <${SMTP_USER}>`,
      to,
      subject: "Forgot Password",
      html: emailTemplate,
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

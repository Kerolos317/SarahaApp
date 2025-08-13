export const verifyEmailTemplate = ({otp , title = "Email Confirmation"}={}) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Email Template</title>
<style>
    body {
        font-family: Arial, sans-serif;
        background-color: #f4f6f8;
        margin: 0;
        padding: 0;
    }
    .container {
        max-width: 600px;
        margin: auto;
        background: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0px 4px 8px rgba(0,0,0,0.1);
    }
    .header {
        background-color: #630E2B;
        color: white;
        padding: 20px;
        text-align: center;
    }
    .header img {
        max-width: 80px;
        margin-bottom: 10px;
    }
    .content {
        padding: 30px;
        text-align: center;
    }
    .content h1 {
        color: #630E2B;
        margin-bottom: 20px;
    }
    .otp-box {
        display: inline-block;
        background: #630E2B;
        color: #fff;
        font-size: 24px;
        padding: 10px 25px;
        border-radius: 6px;
        margin-top: 15px;
    }
    .footer {
        background-color: #f4f6f8;
        padding: 20px;
        text-align: center;
        font-size: 14px;
        color: #555;
    }
    .social-icons a {
        display: inline-block;
        margin: 0 8px;
    }
    .social-icons img {
        width: 32px;
        height: 32px;
    }
    a.button {
        background-color: #630E2B;
        color: white;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 4px;
        display: inline-block;
        margin-top: 20px;
    }
</style>
</head>
<body>

<div class="container">
    <!-- Header -->
    <div class="header">
        <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670702280/Group_35052_icaysu.png" alt="Logo">
        <h2>${title}</h2>
    </div>

    <!-- Content -->
    <div class="content">
        <p>We have received your request. Please use the OTP below to continue:</p>
        <div class="otp-box">${otp}</div>
        <br>
        <a href="http://localhost:4200/#/" class="button" target="_blank">View in Website</a>
    </div>

    <!-- Footer -->
    <div class="footer">
        <p>Stay connected with us</p>
        <div class="social-icons">
            <a href="${process.env.facebookLink}"><img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png" alt="Facebook"></a>
            <a href="${process.env.instegram}"><img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png" alt="Instagram"></a>
            <a href="${process.env.twitterLink}"><img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png" alt="Twitter"></a>
        </div>
        <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
    </div>
</div>

</body>
</html>
`
}
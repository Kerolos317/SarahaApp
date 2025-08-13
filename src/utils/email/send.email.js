import nodemailer from "nodemailer";

export async function sendEmail({
    from = process.env.APP_EMAIL,
    to = "",
    cc = "",
    bcc = "",
    subject = "Saraha APP",
    html = "",
    attachments = "",
} = {}) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.APP_EMAIL,
            pass: process.env.APP_PASSWORD,
        },
    });

    (async () => {
        const info = await transporter.sendMail({
            from: `"Saraha APP" <${process.env.APP_EMAIL}>`,
            to,
            cc,
            bcc,
            subject,
            html,
            attachments,
        });

        console.log("Message sent:", info.messageId);
    })();
}

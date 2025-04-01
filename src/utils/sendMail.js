import nodemailer from "nodemailer";
import dotenv from "dotenv";


dotenv.config({
    path: "./.env",
  });

// create transport
// mailOptions
// send mail

const sendVerificationEmail = async (email, token) =>{
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_SECURE === "true",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });

        // verification URL
        const verificationURL = `${process.env.BASE_URL}/api/v1/users/verify/${token}`;

        //email content
        const mailOptions = {
            from: `"Authentication App" <${process.env.SENDER_EMAIL}>`,
            to: email,
            subject: "Please verify your email address",
            text: `
            Thank you for registering! Please verify your email address to complete your resistration,
            ${verificationURL}
            This verifycation link will expire in 10 mins,
            If you not create an account please igore this email.`,
          };

        // send email
        const info = await transporter.sendMail(mailOptions);
        console.log("verification email sent:", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending verification email: ",error);
        return false;
    }
};

export default sendVerificationEmail;


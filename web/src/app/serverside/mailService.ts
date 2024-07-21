import nodemailer from "nodemailer";
import winston from "winston";
import dotenv from "dotenv";
dotenv.config();

const logger = winston.createLogger({
    level: "debug",
    format: winston.format.json(),
    transports: [new winston.transports.Console()],
});

const from: string = "<from email ID>";
const to: string = "<to email id>";
const subject: string = "<subject>";
const mailTemplate: string =
    "<html string either defined, or loaded from a html file>";

export const sendMail = async (to: string, verifyCode: string) => {
    const transporter = nodemailer.createTransport({
        service: process.env.MAIL_HOST,
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
        },
    });

    var html =
        "<div style='margin-top:50px;font-size:20px;'>" +
        "<p>Welcome to web3easyaccess,</p>" +
        "<p>Your verify code is: </p>" +
        "<div style='margin-left:50px;margin-top:50px;font-size:40px;'>" +
        verifyCode +
        "</div>";

    const mailOptions = {
        from: process.env.MAIL_USERNAME + "@gmail.com",
        to: to,
        subject: "web3easyaccess verify code: " + verifyCode,
        html: html,
    };

    console.log("send email-xxxx-----:", to, "::", verifyCode);
    const rtn = await transporter.sendMail(mailOptions);
};

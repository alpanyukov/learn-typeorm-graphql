import * as nodeMailer from 'nodemailer';

export const sendEmail = (email: string, subject: string, body: string) => {
    const transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.SEND_FROM_EMAIL,
            pass: process.env.SEND_FROM_PASS
        }
    });
    const mailOptions = {
        from: `"Alexander" <${process.env.SEND_FROM_EMAIL}>`, // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        text: body, // plain text body
        html: body // html body
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(info);
        });
    });
};

export const sendConfirmEmail = (email: string, confirmLink: string) =>
    sendEmail(
        email,
        'Confirm Email',
        `
        <center><a href="${confirmLink}">Подтверждение</a></center>
        `
    );

export const sendForgotEmail = (email: string, forgotLink: string) =>
    sendEmail(
        email,
        'Forgot Password',
        `
        <center><a href="${forgotLink}">Сменить пароль</a></center>
        `
    );

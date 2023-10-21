import nodemailer from "nodemailer";

// const { SMTP_MAIL, SMTP_PASSWORD } = process.env;

const sendMail = async (email, mailSubject, content) => {
  try {
    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: mailSubject,
      html: content,
    };

    transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Mail sent successfully:-", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

export default sendMail;

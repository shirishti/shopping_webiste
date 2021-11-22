const { SchemaTypeOptions } = require('mongoose');
const nodemailer=require('nodemailer');

const sendEmail=async options=>{
    const transporter = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "cccb423f38b15f",
          pass: "087e79689f3930"
        }
      });

      const message={
          from:"shopIt <noreply@shopIt.com>",
          to:options.email,
          subject:options.subject,
          text:options.message
      }

      await transporter.sendMail(message)
}

module.exports=sendEmail;
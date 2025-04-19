const nodemailer=require('nodemailer');



    const transporter=nodemailer.createTransport({
        service : process.env.SERVICE,
        port: process.env.SMTP_PORT,
        secure:true,
        auth:{
            user:process.env.SMTP_MAIL,
            pass:process.env.SMTP_PASS
            }
    })


    module.exports=transporter;
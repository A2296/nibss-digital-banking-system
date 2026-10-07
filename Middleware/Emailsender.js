const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',  //Use gmail as the email service provider
    auth: {
        user: process.env.EMAIL_USER, //Email address of the sender
        pass: process.env.EMAIL_USER_PASS //password of the sender email address
    }
});

const sendEmail = async (to, subect, text) => {
    const mailOptions = {
        from: process.env.EMAIL_USER, //Sender email address
        to: to, //Recipient email address
        subject: subect, //Subject of the email
        text: text //Body of the email
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = sendEmail; //Export the sendEmail function for use 
                           //in other parts of the application
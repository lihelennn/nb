const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'helen.nbv2@gmail.com',
      pass: 'iloveboba123'
    }
});

module.exports = transporter;
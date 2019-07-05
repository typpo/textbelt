module.exports = {
  transport: {
    // This is a Nodemailer transport. It can either be an SMTP server or a
    // well-known service such as Sengrid, Mailgun, Gmail, etc.
    // See https://nodemailer.com/transports/ and https://nodemailer.com/smtp/well-known/
    host: 'smtp.example.com',
    port: 587,
    auth: {
      user: 'user@example.com',
      pass: 'example password 1',
    },
    secureConnection: 'false',
    tls: {
      ciphers: 'SSLv3',
    },
  },
  mailOptions: {
    from: '"Jane Doe" <jane.doe@example.com>',
  },
  debugEnabled: false,
};

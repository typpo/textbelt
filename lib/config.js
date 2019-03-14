module.exports = {
  transport: {
    host: "smtp.example.com",
    port: 587,
    auth: {
      user: "user@example.com",
      pass: "example password 1"
    },
    secureConnection: 'false',
    tls: {
      ciphers: 'SSLv3'
    }
  },
  mailOptions: {
    from: '"Jane Doe" <jane.doe@example.com>'
  },
  debugEnabled: false,
};

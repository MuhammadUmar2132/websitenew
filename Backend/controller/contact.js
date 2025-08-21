const Contact = require('../models/Contact');
const ContactDTO = require('../dto/contact.dto');
const nodemailer = require('nodemailer');
require('dotenv').config();

exports.sendMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Save message to MongoDB
    const newContact = new Contact({ name, email, message });
    const savedContact = await newContact.save();

    let transporter;
    let recipient;

    if (process.env.EMAIL_MODE === 'gmail') {
      // Gmail SMTP
      transporter = nodemailer.createTransport({
        service: process.env.CONTACT_EMAIL_SERVICE,
        port: process.env.CONTACT_EMAIL_PORT,
        secure: false,
        auth: {
          user: process.env.CONTACT_EMAIL_USER,
          pass: process.env.CONTACT_EMAIL_PASS,
        },
      });
      recipient = process.env.CONTACT_EMAIL_USER;
    } else {
      // Ethereal SMTP (test mode)
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: process.env.ETHEREAL_USER,
          pass: process.env.ETHEREAL_PASS,
        },
      });
      recipient = process.env.ETHEREAL_USER;
    }

    // Email content
    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: recipient,
      subject: `New Contact Message from ${name}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    // For Ethereal, show preview URL
    const previewUrl =
      process.env.EMAIL_MODE === 'ethereal'
        ? nodemailer.getTestMessageUrl(info)
        : null;

    res.status(201).json({
      message: 'Message sent successfully',
      contact: new ContactDTO(savedContact),
      previewUrl: previewUrl || undefined,
    });

  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({
      message: 'Internal server error while sending message',
      error: err.message,
    });
  }
};

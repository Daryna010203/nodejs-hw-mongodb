import nodemailer from 'nodemailer';
import { getEnvVar } from './getEnvVar.js';
import createHttpError from 'http-errors';

const transport = nodemailer.createTransport({
  host: getEnvVar('SMTP_HOST'),
  port: getEnvVar('SMTP_PORT'),
  secure: false,
  auth: {
    user: getEnvVar('SMTP_USER'),
    pass: getEnvVar('SMTP_PASS'),
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transport.verify((error, success) => {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to take messages');
  }
});

export const sendEmail = async (options) => {
  try {
    console.log('Sending email to:', options.to);
    console.log('Email subject:', options.subject);
    console.log('SMTP_FROM:', options.from);

    const result = await transport.sendMail({
      to: options.to,
      subject: options.subject,
      from: options.from,
      html: options.html,
    });
    console.log('Email sent successfully:', result);
    return result;
  } catch (err) {
    console.error('Email sending error:', err);
    throw createHttpError(500, err.message || err);
  }
};

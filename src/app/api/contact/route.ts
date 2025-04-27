// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, message } = body;

    // 1. Validate Form Data (basic check)
    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // 2. Create a Nodemailer Transporter (Configure your Gmail SMTP)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // Use environment variable
        pass: process.env.GMAIL_APP_PASSWORD, // Use environment variable
      },
    });

    // 3. Define the Email Message
    const mailOptions = {
      from: process.env.GMAIL_USER, // Must match your Gmail address
      to: 'raghuganta777@gmail.com', // Your target Gmail address
      subject: 'New Contact Form Submission from EchoVerse',
      html: `
        <h1>New Contact Form Submission</h1>
        <p><strong>First Name:</strong> ${firstName}</p>
        <p><strong>Last Name:</strong> ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    // 4. Send the Email
    await transporter.sendMail(mailOptions);

    // 5. Return a Success Response
    return NextResponse.json({ message: 'Email sent successfully!' }, { status: 200 });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 });
  }
}

import { NextResponse, NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import nodemailer, { Transporter } from 'nodemailer';

// Configure Nodemailer transporter (replace with your email settings)
const transporter: Transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODE_MAILER_EMAIL,
    pass: process.env.NODE_MAILER_GMAIL_APP_PASSWORD,
  },
});

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if the user is authorized (admin, moderator, or member)
  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user || !['ADMIN', 'MODERATOR', 'MEMBER'].includes(user.role)) {
    return NextResponse.json(
      { error: 'Unauthorized to perform this action' },
      { status: 403 },
    );
  }

  try {
    const { invoiceIds } = await req.json();

    console.log("Invoice IDs:", invoiceIds);

    const invoices = await prisma.invoiceTable.findMany({
      where: {
        id: { in: invoiceIds },
      },
      include: {
        client: true,
      },
    });

    console.log("Invoices:", invoices);

    for (const invoice of invoices) {
      const mailOptions = {
        from: process.env.NODE_MAILER_EMAIL,
        to: invoice.client.email,
        subject: 'Payment Reminder for Invoice #' + invoice.id,
        html: `
          <p>Dear ${invoice.client.name},</p>
          <p>This is a reminder that your invoice #${invoice.id} is unpaid.</p>
          <p>Please make the payment as soon as possible.</p>
          <p>Thank you.</p>
        `,
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.response);
      } catch (emailError) {
        console.error(
          'Error sending email to:',
          invoice.client.email,
          emailError,
        );
        // Handle individual email sending errors (e.g., log, retry, etc.)
      }
    }

    return NextResponse.json(
      { message: 'Bulk reminder sent successfully' },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error sending bulk reminder:', error);

      // Check for specific Nodemailer error properties:
      if ('response' in error) {
        console.error('Nodemailer Response Error:', error.response);
      }
      if ('code' in error) {
        console.error('Nodemailer Error Code:', error.code);
      }
    }

    return NextResponse.json(
      { error: 'Failed to send bulk reminder' },
      { status: 500 },
    );
  }
}
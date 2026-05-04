import nodemailer from 'nodemailer';

interface MailOptions {
	email: string;
	subject: string;
	text: string;
}

const sendMail = async ({ email, subject, text }: MailOptions): Promise<void> => {
const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: parseInt(process.env.SMTP_PORT || '587'),
	secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
	auth: {
		user: process.env.SMTP_EMAIL,
		pass: process.env.SMTP_PASSWORD
	},
	tls: {
		// Do not fail on invalid certs (common in shared hosting/cPanel)
		rejectUnauthorized: false
	}
});

	await transporter.sendMail({
		from: `"BST" <info@babtechrp.com>`,
		to: email,
		subject: subject,
		html: text
	});
};



export default sendMail;

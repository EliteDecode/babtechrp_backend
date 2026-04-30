import nodemailer from 'nodemailer';

interface MailOptions {
	email: string;
	subject: string;
	text: string;
}

const sendMail = async ({ email, subject, text }: MailOptions): Promise<void> => {
	const transporter = nodemailer.createTransport({
		host: 'smtp.spacemail.com',
		port: 465,
		secure: true,
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASS
		}
	});

	await transporter.sendMail({
		from: `"BST" <${process.env.SMTP_USER}>`,
		to: email,
		subject: subject,
		html: text
	});
};

export default sendMail;

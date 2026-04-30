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
			user: 'info@babtechrp.com',
			pass: '123@Jkmdaj'
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

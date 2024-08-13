import nodemailer from 'nodemailer';

interface MailOptions {
	email: string;
	subject: string;
	text: string;
}

const sendMail = async ({ email, subject, text }: MailOptions): Promise<void> => {
	const transporter = nodemailer.createTransport({
		host: 'premium283.web-hosting.com',
		port: 465,
		secure: true, // true for 465, false for other ports
		auth: {
			user: 'testing@purplebeetech.com', // your cPanel email address
			pass: 'In[d$I~R-;2}' // your cPanel email password
		}
	});

	await transporter.sendMail({
		from: 'testing@purplebeetech.com',
		to: email,
		subject: subject,
		html: text
	});
};

export default sendMail;

import { IMessage } from '../interfaces/IMessage';
import sendMail from '../utils/emailUtils';
import User from '../models/userModel';
import { stat } from 'fs';

export const send_Message = async (params: { data: IMessage; user: { id: string } }) => {
	try {
		const fetchUser = await User.findById(params.user.id).select('-password');
		if (!fetchUser) throw new Error('User not found');

		await sendMail({
			email: 'gospyjo@gmail.com',
			subject: params.data.title,
			text: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f9f9f9;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                    }
                    .header {
                        font-size: 20px;
                        margin-bottom: 20px;
                    }
                    .content {
                        font-size: 16px;
                    }
                    .footer {
                        margin-top: 20px;
                        font-size: 14px;
                        color: #777;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                   
                    <div class="content">
                     <h2> Hello Admin, </h2> 
                      <p>  A user filled a support form. Please find the user details and message below: </p> 
                        <p><strong>Message:</strong></p>
                           ${params.data.message}
                        <p><strong>User Details:</strong></p>
                        <ul>
                            <li><strong>First Name:</strong> ${fetchUser.fullname}</li>
                            <li><strong>Email:</strong> ${fetchUser.email}</li>
                            <li><strong>Phone:</strong> ${fetchUser.phone}</li>
                        </ul>
                    </div>
                    <div class="footer">
                        <p>Best regards,</p>
                        <p>BST Support</p>
                    </div>
                </div>
            </body>
            </html>
            `
		});

		return {
			success: true,
			message: 'Message sent successfully',
			data: null
		};
	} catch (error: any) {
		throw new Error(error.message);
	}
};

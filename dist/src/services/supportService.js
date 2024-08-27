"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.send_Message = void 0;
const emailUtils_1 = __importDefault(require("../utils/emailUtils"));
const userModel_1 = __importDefault(require("../models/userModel"));
const send_Message = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fetchUser = yield userModel_1.default.findById(params.user.id).select('-password');
        if (!fetchUser)
            throw new Error('User not found');
        yield (0, emailUtils_1.default)({
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
    }
    catch (error) {
        throw new Error(error.message);
    }
});
exports.send_Message = send_Message;

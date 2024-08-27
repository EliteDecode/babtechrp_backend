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
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendMail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email, subject, text }) {
    const transporter = nodemailer_1.default.createTransport({
        host: 'premium283.web-hosting.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: 'testing@purplebeetech.com', // your cPanel email address
            pass: 'In[d$I~R-;2}' // your cPanel email password
        }
    });
    yield transporter.sendMail({
        from: 'testing@purplebeetech.com',
        to: email,
        subject: subject,
        html: text
    });
});
exports.default = sendMail;

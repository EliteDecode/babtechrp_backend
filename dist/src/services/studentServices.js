"use strict";
//1. Add Students
//2. Get Students
//3. Get Student by Id
//4. Update Student
//5. Delete Student
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
exports.delete_single_student = exports.update_single_student = exports.get_single_student = exports.get_students = exports.add_Student = void 0;
const referralModel_1 = __importDefault(require("../models/referralModel"));
const studentModel_1 = __importDefault(require("../models/studentModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const walletModel_1 = __importDefault(require("../models/walletModel"));
const emailUtils_1 = __importDefault(require("../utils/emailUtils"));
const add_Student = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const StudentData = params.data;
        const checkIfStudentExists = yield studentModel_1.default.findOne({ phone: StudentData.phone });
        if (checkIfStudentExists)
            throw new Error('Student already exists');
        const AllReferrals = yield referralModel_1.default.find();
        let student;
        let matched = false;
        for (const referral of AllReferrals) {
            if (referral.phone == StudentData.phone) {
                referral.isMatched = true;
                yield referral.save();
                const fetchReferredByWallet = yield walletModel_1.default.findOne({ userId: referral.referredBy });
                const fetchreferredBy = yield userModel_1.default.findById(referral.referredBy);
                if (fetchReferredByWallet && fetchreferredBy) {
                    fetchReferredByWallet.total += 10000;
                    fetchReferredByWallet.balance += 10000;
                    fetchReferredByWallet.transactions.push({
                        referralName: referral.fullname,
                        referralPhone: referral.phone,
                        amount: 10000,
                        date: new Date(),
                        type: 'credit'
                    });
                    yield fetchReferredByWallet.save();
                    yield (0, emailUtils_1.default)({
                        email: fetchreferredBy === null || fetchreferredBy === void 0 ? void 0 : fetchreferredBy.email,
                        subject: 'Referral Bonus',
                        text: `
					<div style="font-family: Arial, sans-serif; color: #333;">
						<p>Dear ${fetchreferredBy === null || fetchreferredBy === void 0 ? void 0 : fetchreferredBy.fullname},</p>
						<p>You have been credited with <strong>10,000 Naira</strong> as a referral bonus. Thank you for your referral.</p>
						<p>Please log in to your account to view your wallet balance.</p>
						<br/>
						<p>Best regards,</p>
						<p><strong>BST</strong></p>
					</div>
				`
                    });
                }
                else {
                    const newWallet = new walletModel_1.default({
                        userId: referral.referredBy,
                        total: 10000,
                        withdrawn: 0,
                        balance: 10000,
                        transactions: [
                            {
                                referralName: referral.fullname,
                                referralPhone: referral.phone,
                                amount: 10000,
                                date: new Date(),
                                type: 'credit'
                            }
                        ]
                    });
                    yield newWallet.save();
                }
                student = yield studentModel_1.default.create(Object.assign(Object.assign({}, StudentData), { referralCode: referral.referralCode, isMatched: true }));
                matched = true;
                break; // Exit loop after finding a match
            }
        }
        // If no referral was matched, create the student without referral code
        if (!matched) {
            student = yield studentModel_1.default.create(Object.assign(Object.assign({}, StudentData), { referralCode: null }));
        }
        return {
            success: true,
            message: 'Student added successfully',
            data: student
        };
    }
    catch (error) {
        throw new Error('Error adding student: ' + error.message);
    }
});
exports.add_Student = add_Student;
const get_students = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const students = yield studentModel_1.default.find();
        return {
            success: true,
            message: 'Students fetched successfully',
            data: students
        };
    }
    catch (error) {
        throw new Error('Error fetching students: ' + error.message);
    }
});
exports.get_students = get_students;
const get_single_student = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentId } = params.query;
        const student = yield studentModel_1.default.findById(studentId);
        if (!student)
            throw new Error('Student not found');
        return {
            success: true,
            message: 'Student fetched successfully',
            data: student
        };
    }
    catch (error) {
        throw new Error('Error fetching student: ' + error.message);
    }
});
exports.get_single_student = get_single_student;
const update_single_student = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentId } = params.query;
        const studentData = params.data;
        const student = yield studentModel_1.default.findByIdAndUpdate(studentId, studentData, { new: true });
        if (!student)
            throw new Error('Student not found');
        return {
            success: true,
            message: 'Student updated successfully',
            data: student
        };
    }
    catch (error) {
        throw new Error('Error updating student: ' + error.message);
    }
});
exports.update_single_student = update_single_student;
const delete_single_student = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentId } = params.query;
        const fetchStudent = yield studentModel_1.default.findById(studentId);
        if (!fetchStudent)
            throw new Error('Student not found');
        yield studentModel_1.default.findOneAndDelete(studentId);
        return {
            success: true,
            message: 'Student deleted successfully',
            data: null
        };
    }
    catch (error) {
        throw new Error('Error deleting student');
    }
});
exports.delete_single_student = delete_single_student;

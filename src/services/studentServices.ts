//1. Add Students
//2. Get Students
//3. Get Student by Id
//4. Update Student
//5. Delete Student

import { IParams } from '../interfaces/IParams';
import { IStudent } from '../interfaces/IStudent';
import Referral from '../models/referralModel';
import Student from '../models/studentModel';
import User from '../models/userModel';
import Wallet from '../models/walletModel';

export const add_Student = async (params: { data: IStudent; admin: { id: string }; query: any }) => {
	try {
		const StudentData = params.data;
		const checkIfStudentExists = await Student.findOne({ phone: StudentData.phone });
		if (checkIfStudentExists) throw new Error('Student already exists');

		const AllReferrals = await Referral.find();

		let student;
		let matched = false;

		for (const referral of AllReferrals) {
			if (referral.phone == StudentData.phone) {
				referral.isMatched = true;
				await referral.save();

				const fetchReferredByWallet = await Wallet.findOne({ userId: referral.referredBy });
				if (fetchReferredByWallet) {
					fetchReferredByWallet.total += 10000;
					fetchReferredByWallet.transactions.push({
						referral: referral._id as string,
						amount: 10000,
						date: new Date(),
						type: 'credit'
					});
					await fetchReferredByWallet.save();
				} else {
					const newWallet = new Wallet({
						userId: referral.referredBy,
						total: 10000,
						withdrawn: 0,
						transactions: [
							{
								referral: referral._id,
								amount: 10000,
								date: new Date(),
								type: 'credit'
							}
						]
					});
					await newWallet.save();
				}

				student = await Student.create({ ...StudentData, referralCode: referral.referralCode, isMatched: true });
				matched = true;
				break; // Exit loop after finding a match
			}
		}

		// If no referral was matched, create the student without referral code
		if (!matched) {
			student = await Student.create({ ...StudentData, referralCode: null });
		}

		return {
			success: true,
			message: 'Student added successfully',
			data: student
		};
	} catch (error: any) {
		throw new Error('Error adding student: ' + error.message);
	}
};

export const get_students = async (params: IParams) => {
	try {
		const students = await Student.find();
		return {
			success: true,
			message: 'Students fetched successfully',
			data: students
		};
	} catch (error: any) {
		throw new Error('Error fetching students: ' + error.message);
	}
};

export const get_single_student = async (params: IParams) => {
	try {
		const { studentId } = params.query;
		const student = await Student.findById(studentId);

		return {
			success: true,
			message: 'Student fetched successfully',
			data: student
		};
	} catch (error: any) {
		throw new Error('Error fetching student: ' + error.message);
	}
};

export const update_single_student = async (params: IParams) => {
	try {
		const { studentId } = params.query;
		const studentData = params.data;

		const student = await Student.findByIdAndUpdate(studentId, studentData, { new: true });

		return {
			success: true,
			message: 'Student updated successfully',
			data: student
		};
	} catch (error: any) {
		throw new Error('Error updating student: ' + error.message);
	}
};

export const delete_single_student = async (params: IParams) => {
	try {
		const { studentId } = params.query;

		await Student.findOneAndDelete(studentId);

		return {
			success: true,
			message: 'Student deleted successfully',
			data: null
		};
	} catch (error: any) {
		throw new Error('Error deleting student');
	}
};

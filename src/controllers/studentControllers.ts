import { handleRequest } from '../helpers/handleRequest';
import { add_Student, delete_single_student, get_students, get_single_student, update_single_student } from '../services/studentServices';

export const addStudent = handleRequest(add_Student);
export const getStudent = handleRequest(get_students);
export const geSingleStudent = handleRequest(get_single_student);
export const updateStudent = handleRequest(update_single_student);
export const deleteStudent = handleRequest(delete_single_student);

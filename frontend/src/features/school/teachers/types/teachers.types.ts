export interface TeacherUser {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  status: string;
  role: string;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface TeacherSubject {
  id: string;
  name: string;
  code: string;
}

export interface Teacher {
  id: string;
  schoolId: string;
  userId: string;
  employeeId: string;
  qualification: string | null;
  experienceYears: number | null;
  designation: string | null;
  address: string | null;
  joiningDate: string | null;
  createdAt: string;
  updatedAt: string;
  user: TeacherUser;
  subjects: TeacherSubject[];
  _count?: {
    timetables: number;
  };
}

export interface TeacherListResponse {
  success: boolean;
  message: string;
  data: Teacher[];
}

export interface TeacherResponse {
  success: boolean;
  message: string;
  data: Teacher;
}

export interface CreateTeacherInput {
  fullName: string;
  email: string;
  password?: string;
  phone?: string | null;
  employeeId: string;
  qualification?: string | null;
  experienceYears?: number | null;
  designation?: string | null;
  address?: string | null;
  joiningDate?: string | null;
  subjectIds?: string[];
}

export interface UpdateTeacherInput {
  fullName?: string;
  email?: string;
  phone?: string | null;
  employeeId?: string;
  qualification?: string | null;
  experienceYears?: number | null;
  designation?: string | null;
  address?: string | null;
  joiningDate?: string | null;
  subjectIds?: string[];
}

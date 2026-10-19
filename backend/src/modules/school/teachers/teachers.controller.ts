import { Request, Response } from "express";

import {
  createTeacherService,
  deleteTeacherService,
  getTeacherByIdService,
  getTeachersService,
  updateTeacherService,
} from "./teachers.service";

const getSchoolId = (req: Request): string => {
  const schoolId = req.tenant?.schoolId;

  if (!schoolId) {
    throw new Error("School context is required");
  }

  return schoolId;
};

const getParam = (value: string | string[] | undefined): string => {
  if (typeof value !== "string") {
    throw new Error("Invalid route parameter");
  }

  return value;
};


export const getTeachers = async (req: Request, res: Response) => {
  const schoolId = getSchoolId(req);
  const data = await getTeachersService(schoolId);

  return res.status(200).json({
    success: true,
    message: "Teachers fetched successfully",
    data,
  });
};



export const getTeacherById = async (req: Request, res: Response) => {
  const schoolId = getSchoolId(req);
  const teacherId = getParam(req.params.id);

  const data = await getTeacherByIdService(schoolId, teacherId);

  return res.status(200).json({
    success: true,
    message: "Teacher fetched successfully",
    data,
  });
};

export const createTeacher = async (req: Request, res: Response) => {
  const schoolId = getSchoolId(req);

  const data = await createTeacherService(schoolId, req.body);

  return res.status(201).json({
    success: true,
    message: "Teacher created successfully",
    data,
  });
};

export const updateTeacher = async (req: Request, res: Response) => {
  const schoolId = getSchoolId(req);
  const teacherId = getParam(req.params.id);

  const data = await updateTeacherService(schoolId, teacherId, req.body);

  return res.status(200).json({
    success: true,
    message: "Teacher updated successfully",
    data,
  });
};

export const deleteTeacher = async (req: Request, res: Response) => {
  const schoolId = getSchoolId(req);
  const teacherId = getParam(req.params.id);

  await deleteTeacherService(schoolId, teacherId);

  return res.status(200).json({
    success: true,
    message: "Teacher deleted successfully",
  });
};

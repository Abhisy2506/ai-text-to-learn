import { Module } from '../models/module.model.js';
import { Course } from '../models/course.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

//crrating a module function
export const createModule = asyncHandler(async (req, res) => {
  const { title, courseId } = req.body;
  
  if (!title || !courseId) {
    throw new ApiError(400, 'Title and Course ID are required');
  }

  const newModule = await Module.create({
    title,
    course: courseId
  });
  
  await Course.findByIdAndUpdate(
    courseId,
    { $push: { modules: newModule._id } },
    { new: true } 
  );

  return res.status(201).json(
    new ApiResponse(201, newModule, 'Module created and linked to course successfully')
  );
});


//fetching module by its ID
export const getModuleById = asyncHandler(async (req, res) => {
  const fetchedModule = await Module.findById(req.params.id);
  
  if (!fetchedModule) {
    throw new ApiError(404, 'Module not found');
  }

  return res.status(200).json(
    new ApiResponse(200, fetchedModule, 'Module fetched successfully')
  );
});
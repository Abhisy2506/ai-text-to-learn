import { User } from '../models/user.model.js';
import { Course } from '../models/course.model.js';
import { Module } from '../models/module.model.js';
import { Lesson } from '../models/lesson.module.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateCourseOutline } from '../services/aiService.js';

// generating a course from AI service
export const generateCourse = asyncHandler(async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    throw new ApiError(400, 'Topic is required to generate a course');
  }

  const outline = await generateCourseOutline(topic);

  const creatorId = req.user?._id || req.body.creator || 'mock-user-123';

  const course = await Course.create({
    title: outline.title,
    description: outline.description || '',
    tags: outline.tags || [],
    creator: creatorId,
    modules: [],
  });

  const moduleIds = [];

  for (const modData of outline.modules || []) {
    const newModule = await Module.create({
      title: modData.title,
      course: course._id,
      lessons: [],
    });

    const lessonIds = [];

    for (const lesData of modData.lessons || []) {
      const newLesson = await Lesson.create({
        title: lesData.title,
        module: newModule._id,
        objectives: lesData.objectives || [],
        content: [],
        isEnriched: false,
      });
      lessonIds.push(newLesson._id);
    }

    newModule.lessons = lessonIds;
    await newModule.save();

    moduleIds.push(newModule._id);
  }

  course.modules = moduleIds;
  await course.save();

  if (req.user?._id) {
    await User.findByIdAndUpdate(req.user._id, {
      $push: { createdCourses: course._id },
    });
  }

  const populatedCourse = await Course.findById(course._id).populate({
    path: 'modules',
    populate: {
      path: 'lessons'
    }
  });

  return res.status(201).json(
    new ApiResponse(201, populatedCourse, 'Course and modules generated successfully')
  );
});

/* I have already tried this template based approach sent by me from POSTMAN.... 
export const createCourse = asyncHandler(async (req, res) => {
  const { title, description, tags, modules } = req.body;

  if (!title) {
    throw new ApiError(400, ' corse title is required');
  }

  const creatorId = req.user?._id || req.body.creator || 'mock-user-123';

  const course = await Course.create({
    title,
    description,
    tags,
    creator: creatorId,
    modules: modules || [],
  });

  if (req.user?._id) {
    await User.findByIdAndUpdate(req.user._id, {
      $push: { createdCourses: course._id },
    });
  }

  return res.status(201).json(
    new ApiResponse(201, course, 'Course creatd successfuly')
  );
});
*/

// fetching all courses
export const getCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find();
  return res.status(200).json(
    new ApiResponse(200, courses, 'Courses fetched successfuly')
  );
});

// fetching course by ID
export const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'modules',
    populate: {
      path: 'lessons'
    }
  });
  if (!course) {
    throw new ApiError(404, 'Course not found');
  }

  return res.status(200).json(
    new ApiResponse(200, course, 'Course fetched successfully')
  );
});


// deleting a single course
export const deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const course = await Course.findById(id);

  if (!course) {
    throw new ApiError(404, 'Course not found');
  }

  for (const moduleId of course.modules) {
    await Lesson.deleteMany({ module: moduleId });
  }

  await Module.deleteMany({ course: id });

  if (course.creator) {
    await User.findByIdAndUpdate(course.creator, {
      $pull: { createdCourses: id },
    });
  }

  await Course.findByIdAndDelete(id);

  return res.status(200).json(
    new ApiResponse(200, {}, 'Course and asociated content deleted successfully')
  );
});
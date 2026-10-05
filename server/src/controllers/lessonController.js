import { Lesson } from '../models/lesson.module.js';
import { generateLessonContent } from '../services/aiService.js';
import { fetchRelatedVideo } from "../services/youtubeService.js"
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';


// creating a lesson
export const createLesson = asyncHandler(async (req, res) => {

  const { title, module, objectives, content, isEnriched } = req.body;
  
  if (!title || !module) {
    throw new ApiError(400, 'Title and Module ID are required');
  }

  const lesson = await Lesson.create({
    title,
    module,
    objectives: objectives || [],
    content: content || [],
    isEnriched: isEnriched || false
  });

  return res.status(201).json(
    new ApiResponse(201, lesson, 'Lesson created successfully')
  );
});

//fetching single lesson by its ID
export const getLessonById = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  
  if (!lesson) {
    throw new ApiError(404, 'Lesson not found');
  }

  return res.status(200).json(
    new ApiResponse(200, lesson, 'Lesson fetched successfully')
  );
});

//fetching all lessons by its module Id

export const getLessonsByModule = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;

  if (!moduleId) {
    throw new ApiError(400, 'Module ID is required');
  }

  const lessons = await Lesson.find({ module: moduleId }).select('-content');

  return res.status(200).json(
    new ApiResponse(200, lessons, 'Module lessons fetched successfully')
  );
});

// creating lesson 1 by 1 so that it doesnt load the backend AI api and also let user start reading
// as ssoon as 1 lesson get created
export const enrichLesson = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const lesson = await Lesson.findById(id).populate({
    path: 'module',
    populate: { path: 'course', select: 'title' },
  });

  if (!lesson) {
    throw new ApiError(404, 'Lesson not found');
  }

  if (lesson.isEnriched && lesson.content.length > 0) {
    return res.status(200).json(
      new ApiResponse(200, lesson, 'Lesson already enriched')
    );
  }

  const courseTitle = lesson.module?.course?.title || 'General Course';

  const contentBlocks = await generateLessonContent(
    courseTitle,
    lesson.title,
    lesson.objectives
  );

  for (const block of contentBlocks) {
    if (block.type === 'video' && block.query) {
      const videoId = await fetchRelatedVideo(block.query);
      if (videoId) {
        block.videoId = videoId;
      }
    }
  }

  lesson.content = contentBlocks;
  lesson.isEnriched = true;
  await lesson.save();

  return res.status(200).json(
    new ApiResponse(200, lesson, 'Lesson enriched with content and media successfully')
  );
});
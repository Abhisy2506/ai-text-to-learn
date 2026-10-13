import { Lesson } from '../models/lesson.module.js';
import { Module } from '../models/module.model.js';
import { generateLessonContent } from '../services/aiService.js';
import { fetchRelatedVideo } from '../services/youtubeService.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Creating a lesson
export const createLesson = asyncHandler(async (req, res) => {
  const { title, module, objectives, content, isEnriched, isGenerationStopped } = req.body;

  if (!title || !module) {
    throw new ApiError(400, 'Title and Module ID are required');
  }

  const lesson = await Lesson.create({
    title,
    module,
    objectives: objectives || [],
    content: content || [],
    isEnriched: isEnriched || false,
    isGenerationStopped: isGenerationStopped || false,
  });

  return res.status(201).json(
    new ApiResponse(201, lesson, 'Lesson created successfully')
  );
});

// Fetching single lesson by its ID
export const getLessonById = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    throw new ApiError(404, 'Lesson not found');
  }

  return res.status(200).json(
    new ApiResponse(200, lesson, 'Lesson fetched successfully')
  );
});

// Fetching all lessons by its module Id
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

// Enriching lesson 1 by 1
export const enrichLesson = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const lesson = await Lesson.findById(id).populate({
    path: 'module',
    populate: { path: 'course', select: 'title' },
  });

  if (!lesson) {
    throw new ApiError(404, 'Lesson not found');
  }

  if (lesson.isEnriched && lesson.content?.length > 0) {
    return res.status(200).json(
      new ApiResponse(200, lesson, 'Lesson already enriched')
    );
  }

  const courseTitle = lesson.module?.course?.title || 'General Course';

  // Mark status as currently generating
  lesson.status = 'generating';
  lesson.isGenerationStopped = false;
  await lesson.save();

  // Track if the client disconnected (e.g. page reload or tab closed)
  let clientDisconnected = false;
  req.on('close', async () => {
    if (!res.writableEnded) {
      clientDisconnected = true;
      console.warn(`[Client Disconnect] User aborted/reloaded during enrichment of lesson ${id}`);
      await Lesson.findByIdAndUpdate(id, {
        isGenerationStopped: true,
        status: 'stopped',
      }).catch(() => {});
    }
  });

  try {
    const contentBlocks = await generateLessonContent(
      courseTitle,
      lesson.title,
      lesson.objectives
    );

    if (clientDisconnected) return;

    for (const block of contentBlocks) {
      if (block.type === 'video' && block.query) {
        const videoId = await fetchRelatedVideo(block.query);
        if (videoId) {
          block.videoId = videoId;
        }
      }
    }

    if (clientDisconnected) return;

    lesson.content = contentBlocks;
    lesson.isEnriched = true;
    lesson.isGenerationStopped = false;
    lesson.status = 'completed';
    await lesson.save();

    return res.status(200).json(
      new ApiResponse(200, lesson, 'Lesson enriched with content and media successfully')
    );
  } catch (error) {
    if (!clientDisconnected) {
      // If generation crashes (e.g. Groq daily token limit hit or network timeout)
      lesson.isGenerationStopped = true;
      lesson.status = 'failed';
      await lesson.save().catch(() => {});
    }
    throw error;
  }
});

// Explicitly mark lesson(s) as stopped when client aborts or cancels
export const markLessonStopped = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const lesson = await Lesson.findByIdAndUpdate(
    id,
    { isGenerationStopped: true, status: 'stopped' },
    { new: true }
  );

  if (!lesson) {
    throw new ApiError(404, 'Lesson not found');
  }

  return res.status(200).json(
    new ApiResponse(200, lesson, 'Lesson marked as stopped successfully')
  );
});

// Mark all remaining un-enriched lessons in a course as stopped (batch cancellation)
export const stopRemainingLessonsInCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const modules = await Module.find({ course: courseId }).select('_id');
  const moduleIds = modules.map((m) => m._id);

  const result = await Lesson.updateMany(
    { module: { $in: moduleIds }, isEnriched: false },
    { $set: { isGenerationStopped: true, status: 'stopped' } }
  );

  return res.status(200).json(
    new ApiResponse(200, result, 'Remaining lessons marked as stopped')
  );
});
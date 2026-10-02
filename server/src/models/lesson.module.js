import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
    },
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: [true, 'Parent module reference is required'],
      index: true,
    },
    objectives: [
      {
        type: String,
        trim: true,
      },
    ],
    // Flexible block-based schema to store heterogeneous content (heading, paragraph, code, video, mcq)
    content: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    isEnriched: {
      type: Boolean,
      default: false, // Tracks if AI has generated detailed content/audio for this lesson
    },
    audioUrl: {
      type: String, // Optional URL/Buffer path for Milestone 10 (Hinglish narration)
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Lesson = mongoose.model('Lesson', lessonSchema);
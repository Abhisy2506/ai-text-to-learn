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
    content: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    status: {
      type: String,
      enum: ['pending', 'generating', 'completed', 'stopped', 'failed'],
      default: 'pending',
      index: true,
    },
    isEnriched: {
      type: Boolean,
      default: false,
    },
    isGenerationStopped: {
      type: Boolean,
      default: false,
      index: true,
    },
    audioUrl: {
      type: String,
      default: null,
    },
    hinglishContent: {
      type: String,
      default: ""
    },
    audioData: {
      type: String, // Base64 audio string
      default: null
    }
  },
  {
    timestamps: true,
  }
);

export const Lesson = mongoose.model('Lesson', lessonSchema);
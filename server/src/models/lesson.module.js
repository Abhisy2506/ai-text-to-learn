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
    isEnriched: {
      type: Boolean,
      default: false, // Tracks if AI has generated detailed content/audio for this lesson
    },
    audioUrl: {
      type: String, // Optional (Hinglish narration)
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Lesson = mongoose.model('Lesson', lessonSchema);
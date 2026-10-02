import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    auth0Id: {
      type: String,
      required: [true, 'Auth0 ID (sub) is required'],
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    picture: {
      type: String,
      default: '',
    },

    // References to courses created buy this user
    createdCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    // Optional preferences (useful for Milestone 10: Hinglish/language preferences)
    preferences: {
      preferredLanguage: {
        type: String,
        default: 'en', // 'en', 'hinglish', etc.
      },
      autoTranslate: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model('User', userSchema);
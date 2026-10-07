import mongoose, { Schema } from 'mongoose';

const workoutSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    activityType: {
      type: String,
      enum: ['running', 'cycling', 'walking', 'strength'],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
    },
    durationMinutes: { type: Number, required: true, min: 1 },
    exercises: [
      {
        name: { type: String, required: true, trim: true },
        sets: { type: Number, min: 1 },
        reps: { type: Number, min: 1 },
        durationMinutes: { type: Number, min: 1 },
      },
    ],
  },
  { timestamps: true },
);

export const workout = mongoose.model('Workout', workoutSchema);

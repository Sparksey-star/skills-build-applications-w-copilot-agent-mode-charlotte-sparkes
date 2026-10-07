import mongoose, { Schema } from 'mongoose';

const leaderboardSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    points: { type: Number, required: true, min: 0 },
    rank: { type: Number, required: true, min: 1 },
    period: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

leaderboardSchema.index({ userId: 1, period: 1 }, { unique: true });

export const leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

import mongoose from 'mongoose';
import { activity } from '../models/activity.js';
import { leaderboard } from '../models/leaderboard.js';
import { team } from '../models/team.js';
import { user } from '../models/user.js';
import { workout } from '../models/workout.js';

const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/octofit_db';
const leaderboardPeriod = '2026-10';

/**
 * Seed the octofit_db database with test data
 */
async function seedDatabase(): Promise<void> {
  try {
    await mongoose.connect(connectionString);
    console.log('Connected to octofit_db');

    const userData = [
      {
        username: 'alex-rivera',
        email: 'alex.rivera@example.com',
        displayName: 'Alex Rivera',
        bio: 'Weekend runner training for a half marathon.',
        fitnessLevel: 'intermediate' as const,
      },
      {
        username: 'jordan-lee',
        email: 'jordan.lee@example.com',
        displayName: 'Jordan Lee',
        bio: 'Enjoys cycling and exploring new routes.',
        fitnessLevel: 'advanced' as const,
      },
      {
        username: 'sam-patel',
        email: 'sam.patel@example.com',
        displayName: 'Sam Patel',
        bio: 'Building a consistent strength routine.',
        fitnessLevel: 'beginner' as const,
      },
    ];
    const existingUsers = await user
      .find({ username: { $in: userData.map(({ username }) => username) } })
      .select('username')
      .lean();
    const existingUsernames = new Set(existingUsers.map(({ username }) => username));
    const missingUsers = userData.filter(({ username }) => !existingUsernames.has(username));
    if (missingUsers.length > 0) {
      await user.insertMany(missingUsers);
    }

    const [alex, jordan, sam] = await Promise.all(
      userData.map(({ username }) => user.findOne({ username })),
    );
    if (!alex || !jordan || !sam) {
      throw new Error('Unable to load sample users after seeding');
    }

    const teamData = [
      {
        name: 'Trailblazers',
        description: 'A friendly team that loves running outdoors.',
        captainId: alex._id,
        memberIds: [alex._id, sam._id],
      },
      {
        name: 'Pedal Power',
        description: 'Cyclists motivating each other to go farther.',
        captainId: jordan._id,
        memberIds: [jordan._id, sam._id],
      },
    ];
    const existingTeams = await team
      .find({ name: { $in: teamData.map(({ name }) => name) } })
      .select('name')
      .lean();
    const existingTeamNames = new Set(existingTeams.map(({ name }) => name));
    const missingTeams = teamData.filter(({ name }) => !existingTeamNames.has(name));
    if (missingTeams.length > 0) {
      await team.insertMany(missingTeams);
    }

    const [trailblazers, pedalPower] = await Promise.all(
      teamData.map(({ name }) => team.findOne({ name })),
    );
    if (!trailblazers || !pedalPower) {
      throw new Error('Unable to load sample teams after seeding');
    }

    const activityData = [
      {
        userId: alex._id,
        teamId: trailblazers._id,
        activityType: 'running' as const,
        durationMinutes: 36,
        distanceKm: 5.2,
        caloriesBurned: 390,
        completedAt: new Date('2026-10-06T07:30:00Z'),
      },
      {
        userId: jordan._id,
        teamId: pedalPower._id,
        activityType: 'cycling' as const,
        durationMinutes: 58,
        distanceKm: 22.4,
        caloriesBurned: 510,
        completedAt: new Date('2026-10-05T16:15:00Z'),
      },
      {
        userId: sam._id,
        teamId: trailblazers._id,
        activityType: 'strength' as const,
        durationMinutes: 30,
        distanceKm: 0,
        caloriesBurned: 180,
        completedAt: new Date('2026-10-05T08:00:00Z'),
      },
      {
        userId: sam._id,
        teamId: pedalPower._id,
        activityType: 'walking' as const,
        durationMinutes: 42,
        distanceKm: 3.1,
        caloriesBurned: 165,
        completedAt: new Date('2026-10-04T10:00:00Z'),
      },
    ];
    const existingActivities = await activity
      .find({
        $or: activityData.map(({ userId, completedAt }) => ({ userId, completedAt })),
      })
      .select('userId completedAt')
      .lean();
    const existingActivityKeys = new Set(
      existingActivities.map(({ userId, completedAt }) => `${userId}:${completedAt.toISOString()}`),
    );
    const missingActivities = activityData.filter(
      ({ userId, completedAt }) => !existingActivityKeys.has(`${userId}:${completedAt.toISOString()}`),
    );
    if (missingActivities.length > 0) {
      await activity.insertMany(missingActivities);
    }

    const leaderboardData = [
      { userId: jordan._id, teamId: pedalPower._id, points: 820, rank: 1, period: leaderboardPeriod },
      { userId: alex._id, teamId: trailblazers._id, points: 690, rank: 2, period: leaderboardPeriod },
      { userId: sam._id, teamId: trailblazers._id, points: 430, rank: 3, period: leaderboardPeriod },
    ];
    const existingLeaderboardEntries = await leaderboard
      .find({
        userId: { $in: leaderboardData.map(({ userId }) => userId) },
        period: leaderboardPeriod,
      })
      .select('userId')
      .lean();
    const existingLeaderboardUserIds = new Set(
      existingLeaderboardEntries.map(({ userId }) => userId.toString()),
    );
    const missingLeaderboardEntries = leaderboardData.filter(
      ({ userId }) => !existingLeaderboardUserIds.has(userId.toString()),
    );
    if (missingLeaderboardEntries.length > 0) {
      await leaderboard.insertMany(missingLeaderboardEntries);
    }

    const workoutData = [
      {
        title: 'Easy 5K Builder',
        description: 'A steady session to build comfortable running endurance.',
        activityType: 'running' as const,
        difficulty: 'beginner' as const,
        durationMinutes: 30,
        exercises: [
          { name: 'Brisk warm-up walk', durationMinutes: 5 },
          { name: 'Easy pace run', durationMinutes: 20 },
          { name: 'Cool-down walk', durationMinutes: 5 },
        ],
      },
      {
        title: 'Hill Strength Ride',
        description: 'A cycling workout with short, controlled hill efforts.',
        activityType: 'cycling' as const,
        difficulty: 'intermediate' as const,
        durationMinutes: 45,
        exercises: [
          { name: 'Easy spin', durationMinutes: 10 },
          { name: 'Hill effort', sets: 5, durationMinutes: 3 },
          { name: 'Recovery spin', durationMinutes: 20 },
        ],
      },
      {
        title: 'Full Body Foundations',
        description: 'A simple strength circuit focused on good form.',
        activityType: 'strength' as const,
        difficulty: 'beginner' as const,
        durationMinutes: 25,
        exercises: [
          { name: 'Bodyweight squats', sets: 3, reps: 10 },
          { name: 'Incline push-ups', sets: 3, reps: 8 },
          { name: 'Glute bridges', sets: 3, reps: 12 },
        ],
      },
    ];
    const existingWorkouts = await workout
      .find({ title: { $in: workoutData.map(({ title }) => title) } })
      .select('title')
      .lean();
    const existingWorkoutTitles = new Set(existingWorkouts.map(({ title }) => title));
    const missingWorkouts = workoutData.filter(({ title }) => !existingWorkoutTitles.has(title));
    if (missingWorkouts.length > 0) {
      await workout.insertMany(missingWorkouts);
    }

    console.log('Database seeding complete');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

void seedDatabase();

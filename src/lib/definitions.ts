import { Timestamp } from 'firebase/firestore';

export type Student = {
  id: string;
  classId: string;
  name: string;
  normalizedName: string;
  schoolId: string;
  avatar: string;
  robloxUsername: string;
  robloxUserId: string;
  timePlayed: number;
  progress: number;
  activitiesCompleted: number;
  experimentsCompleted: number;
  currentActivityScore: number;
  experimentProgress: number;
  lastUpdated: Timestamp;
};

export type Class = {
  id: string;
  name: string;
  description: string;
  teacherId: string; // The missing field
  students: string[];
  normalizedName: string;
};

export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female';
  height: number; // cm
  weight: number; // kg
  targetWeight: number; // kg - the weight you want to reach
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose' | 'maintain' | 'gain';
  experience: 'beginner' | 'intermediate' | 'advanced';
  daysPerWeek: number; // training days available
  bodyFat?: number;
}

export interface BodyMetric {
  id: string;
  date: string;
  weight: number;
  bodyFat?: number;
  waist?: number;
  chest?: number;
  arms?: number;
  thighs?: number;
}

export interface Exercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
  category: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio';
}

export interface ExerciseSet {
  reps: number;
  weight: number; // kg
  duration?: number; // seconds for cardio
}

export interface Workout {
  id: string;
  date: string;
  name: string;
  exercises: Exercise[];
  duration: number; // minutes
  caloriesBurned: number;
  notes?: string;
}

export interface NutritionEntry {
  id: string;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
}

export interface DailyLog {
  date: string;
  steps: number;
  waterGlasses: number;
  sleepHours: number;
  mood: 1 | 2 | 3 | 4 | 5;
}

export type TabType = 'dashboard' | 'workouts' | 'nutrition' | 'body' | 'calculator';

export interface ProSubscription {
  isActive: boolean;
  planId: string | null;
  startDate: string | null;
  expiryDate: string | null;
  paymentMethod: string | null;
  trialEnds: string | null;
}

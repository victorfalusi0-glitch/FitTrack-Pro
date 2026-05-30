import { UserProfile } from '../types';

// Mifflin-St Jeor Equation (most accurate for BMR)
export function calculateBMR(profile: UserProfile): number {
  const { weight, height, age, gender } = profile;
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  }
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

// TDEE based on activity level
export function calculateTDEE(profile: UserProfile): number {
  const bmr = calculateBMR(profile);
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  return Math.round(bmr * multipliers[profile.activityLevel]);
}

// Determine effective goal based on current vs target weight
export function getEffectiveGoal(profile: UserProfile): 'lose' | 'maintain' | 'gain' {
  if (!profile.targetWeight) return profile.goal;
  const diff = profile.targetWeight - profile.weight;
  if (diff <= -1) return 'lose';
  if (diff >= 1) return 'gain';
  return 'maintain';
}

// Target calories based on the weight you want to reach
export function calculateTargetCalories(profile: UserProfile): number {
  const tdee = calculateTDEE(profile);
  const effGoal = getEffectiveGoal(profile);
  switch (effGoal) {
    case 'lose': return Math.round(tdee - 500); // ~0.45kg/week loss
    case 'gain': return Math.round(tdee + 350); // lean gain
    default: return tdee;
  }
}

// Estimate weeks & date to reach target weight (safe rate)
export function estimateGoalTimeline(profile: UserProfile): {
  weeks: number;
  weeklyChange: number; // kg per week (signed)
  totalChange: number; // kg
  targetDate: string;
  dailyDeficit: number;
} {
  const totalChange = profile.targetWeight - profile.weight;
  const effGoal = getEffectiveGoal(profile);
  // Safe rate: 0.45 kg/week loss, 0.25 kg/week gain
  let weeklyChange = 0;
  let dailyDeficit = 0;
  if (effGoal === 'lose') {
    weeklyChange = -0.45;
    dailyDeficit = -500;
  } else if (effGoal === 'gain') {
    weeklyChange = 0.25;
    dailyDeficit = 350;
  }
  const weeks = weeklyChange !== 0 ? Math.ceil(Math.abs(totalChange / weeklyChange)) : 0;
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + weeks * 7);
  return {
    weeks,
    weeklyChange,
    totalChange,
    targetDate: targetDate.toISOString().split('T')[0],
    dailyDeficit,
  };
}

// Recommend a workout split / program based on goal & availability
export interface WorkoutDay {
  day: string;
  focus: string;
  emoji: string;
  exercises: string[];
  description: string;
}

export interface WorkoutPlan {
  name: string;
  description: string;
  type: string;
  cardioGuidance: string;
  schedule: WorkoutDay[];
}

export function recommendWorkoutPlan(profile: UserProfile): WorkoutPlan {
  const effGoal = getEffectiveGoal(profile);
  const days = profile.daysPerWeek || 3;

  // Workout building blocks
  const fullBody: WorkoutDay = {
    day: 'Full Body',
    focus: 'Full Body Strength',
    emoji: '🏋️',
    exercises: ['Squat 3×8', 'Bench Press 3×8', 'Barbell Row 3×8', 'Overhead Press 3×10', 'Plank 3×45s'],
    description: 'Compound lifts hitting every major muscle group',
  };
  const push: WorkoutDay = {
    day: 'Push',
    focus: 'Chest, Shoulders & Triceps',
    emoji: '💪',
    exercises: ['Bench Press 4×8', 'Overhead Press 3×10', 'Incline Dumbbell Press 3×10', 'Lateral Raise 3×15', 'Tricep Pushdown 3×12'],
    description: 'All pushing movements for upper body',
  };
  const pull: WorkoutDay = {
    day: 'Pull',
    focus: 'Back & Biceps',
    emoji: '🔙',
    exercises: ['Deadlift 4×6', 'Pull-ups 3×8', 'Barbell Row 3×10', 'Face Pull 3×15', 'Barbell Curl 3×12'],
    description: 'All pulling movements for back and biceps',
  };
  const legs: WorkoutDay = {
    day: 'Legs',
    focus: 'Quads, Hamstrings & Glutes',
    emoji: '🦵',
    exercises: ['Squat 4×8', 'Romanian Deadlift 3×10', 'Leg Press 3×12', 'Leg Curl 3×12', 'Calf Raises 4×15'],
    description: 'Complete lower body development',
  };
  const upper: WorkoutDay = {
    day: 'Upper',
    focus: 'Upper Body',
    emoji: '💪',
    exercises: ['Bench Press 4×8', 'Barbell Row 4×8', 'Overhead Press 3×10', 'Lat Pulldown 3×12', 'Bicep Curl 3×12'],
    description: 'Full upper body in one session',
  };
  const lower: WorkoutDay = {
    day: 'Lower',
    focus: 'Lower Body',
    emoji: '🦵',
    exercises: ['Squat 4×8', 'Romanian Deadlift 4×8', 'Lunges 3×12', 'Leg Curl 3×12', 'Calf Raises 4×20'],
    description: 'Full lower body in one session',
  };
  const hiit: WorkoutDay = {
    day: 'HIIT / Cardio',
    focus: 'Fat Burning Conditioning',
    emoji: '🏃',
    exercises: ['Jump Rope 5min warmup', '30s sprint / 90s walk ×8', 'Burpees 3×15', 'Mountain Climbers 3×30s', 'Cool down 5min'],
    description: 'High intensity intervals to maximize calorie burn',
  };
  const conditioning: WorkoutDay = {
    day: 'Conditioning',
    focus: 'Cardio & Core',
    emoji: '🔥',
    exercises: ['Incline Walk 20min', 'Kettlebell Swings 4×15', 'Hanging Leg Raise 3×12', 'Russian Twist 3×20', 'Plank 3×60s'],
    description: 'Steady-state cardio plus core work',
  };

  let schedule: WorkoutDay[] = [];
  let name = '';
  let description = '';
  let cardioGuidance = '';

  if (effGoal === 'lose') {
    name = 'Fat Loss Program';
    description = 'Strength training to preserve muscle + cardio to maximize fat loss while in a calorie deficit.';
    cardioGuidance = '150-250 min moderate cardio per week (or 75-150 min vigorous). Aim for 8,000-10,000+ steps daily.';
    const fatLossPool = [fullBody, hiit, upper, conditioning, lower, hiit];
    if (days <= 3) schedule = [fullBody, hiit, fullBody].slice(0, days);
    else if (days === 4) schedule = [upper, hiit, lower, conditioning];
    else schedule = fatLossPool.slice(0, days);
  } else if (effGoal === 'gain') {
    name = 'Muscle Building Program';
    description = 'Progressive overload focused hypertrophy training to build lean muscle in a calorie surplus.';
    cardioGuidance = 'Keep cardio light: 2-3 short sessions (15-20 min) per week to stay healthy without burning your surplus.';
    if (days <= 3) schedule = [push, pull, legs].slice(0, days);
    else if (days === 4) schedule = [upper, lower, push, pull];
    else if (days === 5) schedule = [push, pull, legs, upper, lower];
    else schedule = [push, pull, legs, push, pull, legs].slice(0, days);
  } else {
    name = 'Maintenance & Recomposition';
    description = 'Balanced training to maintain muscle, stay lean, and improve overall fitness at maintenance calories.';
    cardioGuidance = '120-150 min moderate cardio per week for heart health. 7,000-10,000 steps daily.';
    if (days <= 3) schedule = [fullBody, conditioning, fullBody].slice(0, days);
    else if (days === 4) schedule = [upper, lower, push, conditioning];
    else schedule = [push, pull, legs, upper, conditioning].slice(0, days);
  }

  // Adjust intensity note for experience
  let type = profile.experience === 'beginner'
    ? 'Beginner-friendly — focus on form & gradual progression'
    : profile.experience === 'advanced'
    ? 'Advanced — push intensity, add progressive overload weekly'
    : 'Intermediate — steady progressive overload';

  // Label day numbers
  schedule = schedule.map((d, i) => ({ ...d, day: `Day ${i + 1}: ${d.day}` }));

  return { name, description, type, cardioGuidance, schedule };
}

// BMI calculation
export function calculateBMI(weight: number, height: number): number {
  const heightM = height / 100;
  return Math.round((weight / (heightM * heightM)) * 10) / 10;
}

export function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: '#f59e0b' };
  if (bmi < 25) return { label: 'Normal', color: '#10b981' };
  if (bmi < 30) return { label: 'Overweight', color: '#f59e0b' };
  return { label: 'Obese', color: '#ef4444' };
}

// Body Fat % estimation using Navy method
export function estimateBodyFat(
  gender: 'male' | 'female',
  waist: number,  // cm
  neck: number,   // cm
  height: number, // cm
  hip?: number    // cm (required for female)
): number {
  if (gender === 'male') {
    return Math.round(
      (495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450) * 10
    ) / 10;
  }
  const hipVal = hip || 0;
  return Math.round(
    (495 / (1.29579 - 0.35004 * Math.log10(waist + hipVal - neck) + 0.22100 * Math.log10(height)) - 450) * 10
  ) / 10;
}

// Macro recommendations
export function calculateMacros(targetCalories: number, goal: 'lose' | 'maintain' | 'gain') {
  let proteinRatio: number, fatRatio: number, carbRatio: number;
  
  switch (goal) {
    case 'lose':
      proteinRatio = 0.35;
      fatRatio = 0.30;
      carbRatio = 0.35;
      break;
    case 'gain':
      proteinRatio = 0.30;
      fatRatio = 0.25;
      carbRatio = 0.45;
      break;
    default:
      proteinRatio = 0.30;
      fatRatio = 0.25;
      carbRatio = 0.45;
  }

  return {
    protein: Math.round((targetCalories * proteinRatio) / 4),
    fat: Math.round((targetCalories * fatRatio) / 9),
    carbs: Math.round((targetCalories * carbRatio) / 4),
  };
}

// Estimate calories burned per exercise
export function estimateCaloriesBurned(
  exerciseCategory: string,
  durationMinutes: number,
  weightKg: number,
  intensity: 'low' | 'moderate' | 'high' = 'moderate'
): number {
  // MET values for different exercise categories and intensities
  const metValues: Record<string, Record<string, number>> = {
    chest:     { low: 3.5, moderate: 5.0, high: 8.0 },
    back:      { low: 3.5, moderate: 5.0, high: 8.0 },
    legs:      { low: 4.0, moderate: 6.0, high: 9.0 },
    shoulders: { low: 3.5, moderate: 5.0, high: 7.0 },
    arms:      { low: 3.0, moderate: 4.5, high: 6.5 },
    core:      { low: 3.0, moderate: 4.0, high: 6.0 },
    cardio:    { low: 5.0, moderate: 8.0, high: 12.0 },
  };

  const met = metValues[exerciseCategory]?.[intensity] || 5.0;
  // Calories = MET × weight(kg) × duration(hours)
  return Math.round(met * weightKg * (durationMinutes / 60));
}

// One Rep Max estimation (Brzycki formula)
export function calculateOneRepMax(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps > 12) return Math.round(weight * (1 + reps / 30));
  return Math.round(weight * (36 / (37 - reps)));
}

// Ideal body weight (Devine formula)
export function idealBodyWeight(gender: 'male' | 'female', heightCm: number): number {
  const heightInches = heightCm / 2.54;
  const inchesOver5Feet = heightInches - 60;
  if (gender === 'male') {
    return Math.round((50 + 2.3 * inchesOver5Feet) * 10) / 10;
  }
  return Math.round((45.5 + 2.3 * inchesOver5Feet) * 10) / 10;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

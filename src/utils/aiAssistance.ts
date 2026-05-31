import { UserProfile, Workout, NutritionEntry, BodyMetric } from '../types';

// AI-powered workout suggestions based on user profile
export function generateWorkoutSuggestions(profile: UserProfile): string[] {
  const goal = profile.goal;
  const experience = profile.experience || 'beginner';

  const workoutTemplates: Record<string, Record<string, string[]>> = {
    lose: {
      beginner: [
        'Full Body Cardio + Light Weights (25-30 min)',
        'Bodyweight Circuit (Push-ups, Squats, Plank) (20 min)',
        'Walking + Core (20 min walk, 15 min core)',
      ],
      intermediate: [
        'HIIT + Compound Lifts (30 min)',
        'Circuit Training (3 rounds) (30 min)',
        'Tabata Intervals (20 min)',
      ],
      advanced: [
        'Metabolic Conditioning WOD (25 min)',
        'Plyometric Power Circuit (30 min)',
        'Endurance Run + Core Finisher (40 min)',
      ],
    },
    gain: {
      beginner: [
        'Full Body Strength (Squat, Push, Row) (35 min)',
        'Upper/Lower Split (35 min)',
        'Compound Focus (Deadlift, Bench, Overhead) (40 min)',
      ],
      intermediate: [
        'Push/Pull/Legs (45 min)',
        'Volume Builder (4 sets, 8-12 reps) (50 min)',
        'Strength + Hypertrophy (40 min)',
      ],
      advanced: [
        'Power & Size Hybrid (50 min)',
        'Peak Week Deload (35 min)',
        'Maximum Volume Day (55 min)',
      ],
    },
    maintain: {
      beginner: [
        'Balanced Full Body (30 min)',
        'Functional Fitness Circuit (25 min)',
        'Active Recovery + Mobility (30 min)',
      ],
      intermediate: [
        '4-Day Upper/Lower (45 min)',
        'Conditioning + Strength (40 min)',
        'Mobility + Light Weights (35 min)',
      ],
      advanced: [
        'Maintenance Strength (40 min)',
        'Conditioning + Core (35 min)',
        'Skill Work + Light Volume (45 min)',
      ],
    },
  };

  const templates = workoutTemplates[goal]?.[experience] || workoutTemplates.maintain.beginner;
  return templates.slice(0, 3);
}

// AI-powered meal suggestions based on macros
export function generateMealSuggestions(
  targetCalories: number,
  _protein: number,
  _carbs: number,
  _fat: number
): { name: string; calories: number; protein: number; carbs: number; fat: number; portions: string }[] {
  const meals: ReturnType<typeof generateMealSuggestions> = [];

  // Break macros into 3 meals + 2 snacks
  const mealCalories = Math.floor(targetCalories / 3);
  const snackCalories = Math.floor(targetCalories / 5);

  // Sample meals (scaled to calories)
  const mealOptions = [
    { base: 'Grilled Chicken Bowl', protein: 35, carbs: 40, fat: 12 },
    { base: 'Salmon & Quinoa', protein: 30, carbs: 35, fat: 18 },
    { base: 'Turkey & Avocado Wrap', protein: 32, carbs: 38, fat: 14 },
    { base: 'Tofu Stir Fry', protein: 25, carbs: 45, fat: 12 },
    { base: 'Greek Yogurt Parfait', protein: 20, carbs: 30, fat: 5 },
  ];

  const snackOptions = [
    { base: 'Apple + Peanut Butter', protein: 8, carbs: 20, fat: 8 },
    { base: 'Protein Shake', protein: 25, carbs: 30, fat: 3 },
    { base: 'Greek Yogurt', protein: 15, carbs: 12, fat: 0 },
  ];

  // Scale function
  const scaleMeal = (meal: { base: string; protein: number; carbs: number; fat: number }, targetCal: number) => {
    const baseCal = meal.protein * 4 + meal.carbs * 4 + meal.fat * 9;
    const scale = targetCal / baseCal;
    return {
      name: meal.base,
      calories: Math.round(targetCal),
      protein: Math.round(meal.protein * scale),
      carbs: Math.round(meal.carbs * scale),
      fat: Math.round(meal.fat * scale),
      portions: '1 serving',
    };
  };

  // Generate 3 meals
  for (let i = 0; i < 3; i++) {
    const option = mealOptions[(i + Math.floor(Math.random() * mealOptions.length)) % mealOptions.length];
    meals.push(scaleMeal(option, mealCalories));
  }

  // Generate 2 snacks
  for (let i = 0; i < 2; i++) {
    const option = snackOptions[Math.floor(Math.random() * snackOptions.length)];
    meals.push(scaleMeal(option, snackCalories));
  }

  return meals;
}

// AI progress insights
export interface ProgressInsight {
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info';
  action?: string;
}

export function generateProgressInsights(
  profile: UserProfile,
  workouts: Workout[],
  nutrition: NutritionEntry[],
  bodyMetrics: BodyMetric[]
): ProgressInsight[] {
  const insights: ProgressInsight[] = [];

  // Workout consistency
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentWorkouts = workouts.filter(w => new Date(w.date) >= weekAgo);

  if (recentWorkouts.length >= 4) {
    insights.push({
      title: '🔥 Great Consistency!',
      description: `You've trained ${recentWorkouts.length} times this week. Keep it up!`,
      type: 'success',
    });
  } else if (recentWorkouts.length === 0) {
    insights.push({
      title: '🚀 Start Your Week',
      description: 'No workouts logged this week. Pick one of your recommended workouts.',
      type: 'warning',
      action: 'View Recommended Workouts',
    });
  }

  // Nutrition tracking
  const recentNutrition = nutrition.filter(n => new Date(n.date) >= weekAgo);

  if (recentNutrition.length < 7) {
    insights.push({
      title: '🍎 Track Your Meals',
      description: `Only ${recentNutrition.length} days of nutrition logged this week. Consistency builds results.`,
      type: 'info',
      action: 'Log Today\'s Meals',
    });
  }

  // Weight trend
  if (bodyMetrics.length >= 2) {
    const latest = bodyMetrics[bodyMetrics.length - 1];
    const prev = bodyMetrics[bodyMetrics.length - 2];
    const change = latest.weight - prev.weight;
    const goal = profile.targetWeight;

    if (Math.abs(change) > 0.5) {
      const direction = change > 0 ? 'up' : 'down';
      const isGood = (goal < latest.weight && direction === 'down') || (goal > latest.weight && direction === 'up');
      insights.push({
        title: isGood ? '✅ On Track!' : '⚠️ Watch Your Weight',
        description: `Weight changed by ${Math.abs(change).toFixed(1)}kg ${direction} this week.`,
        type: isGood ? 'success' : 'warning',
      });
    }
  }

  // Goal progress
  const goalDiff = profile.targetWeight - profile.weight;
  if (Math.abs(goalDiff) > 0) {
    const direction = goalDiff > 0 ? 'gain' : 'lose';
    const latestWeight = bodyMetrics[bodyMetrics.length - 1]?.weight || profile.weight;
    const progressPct = Math.min(Math.abs(profile.weight - latestWeight) / Math.abs(goalDiff) * 100, 100);
    insights.push({
      title: `🎯 ${direction === 'lose' ? 'Fat Loss' : 'Muscle Gain'} Plan`,
      description: `${progressPct.toFixed(0)}% toward your goal of ${Math.abs(goalDiff).toFixed(1)}kg ${direction}`,
      type: 'info',
    });
  }

  return insights.slice(0, 3);
}

// AI Q&A helper (mock responses — could be swapped for OpenAI/Gemini API)
export function getAIAnswer(question: string, profile: UserProfile): string {
  const q = question.toLowerCase();

  if (q.includes('calorie') || q.includes('how many')) {
    const multipliers: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
    const tdee = Math.round((profile.weight * 10 + profile.height * 6.25 - profile.age * 5) * (multipliers[profile.activityLevel] || 1.55));
    return `Your TDEE (maintenance calories) is approximately **${tdee} calories/day**. For ${profile.goal} weight, aim for ${profile.goal === 'lose' ? tdee - 500 : profile.goal === 'gain' ? tdee + 350 : tdee} calories/day.`;
  }

  if (q.includes('workout') || q.includes('exercise')) {
    const workouts = generateWorkoutSuggestions(profile);
    return `Based on your ${profile.goal} goal, try: **${workouts[0]}** or **${workouts[1]}**. These match your ${profile.experience} level and ${profile.daysPerWeek} training days/week.`;
  }

  if (q.includes('protein') || q.includes('macro')) {
    const protein = Math.round(profile.weight * 2.2);
    return `Aim for **${protein}g of protein daily**. That's ${Math.round(protein * 4)} calories, or about 30-40% of your daily intake for muscle preservation/growth.`;
  }

  if (q.includes('sleep') || q.includes('rest')) {
    return 'Aim for **7-9 hours of quality sleep**. Growth hormone peaks during deep sleep, and recovery is impaired with <7 hours. Try consistent bedtimes!';
  }

  if (q.includes('supplement') || q.includes('creatine') || q.includes('pre')) {
    return 'While whole foods should be your foundation, common evidence-based supplements include: **Creatine Monohydrate** (5g/day for strength), **Whey Protein** (if you struggle to hit protein), and **Omega-3s** (1-2g for heart health).';
  }

  return "I'm still learning! For now, focus on: **1) Eating protein at every meal**, **2) Training with progressive overload**, **3) Sleeping 7+ hours**, and **4) Consistency over perfection**. Your personalized dashboard has all the science-backed numbers you need.";
}
import { UserProfile, Workout, NutritionEntry, BodyMetric, DailyLog } from '../types';
import {
  calculateBMI,
  getBMICategory,
  calculateTDEE,
  calculateTargetCalories,
  calculateMacros,
  getToday,
  idealBodyWeight,
  getEffectiveGoal,
  estimateGoalTimeline,
  recommendWorkoutPlan,
  formatDate,
} from '../utils/fitness';
import {
  Flame,
  Droplets,
  Moon,
  Footprints,
  TrendingUp,
  TrendingDown,
  Target,
  Dumbbell,
  Scale,
  Heart,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Props {
  profile: UserProfile;
  workouts: Workout[];
  nutrition: NutritionEntry[];
  bodyMetrics: BodyMetric[];
  dailyLog: DailyLog | null;
  onUpdateDailyLog: (log: DailyLog) => void;
}

export default function Dashboard({ profile, workouts, nutrition, bodyMetrics, dailyLog, onUpdateDailyLog }: Props) {
  const bmi = calculateBMI(profile.weight, profile.height);
  const bmiInfo = getBMICategory(bmi);
  const tdee = calculateTDEE(profile);
  const targetCals = calculateTargetCalories(profile);
  const effGoal = getEffectiveGoal(profile);
  const macros = calculateMacros(targetCals, effGoal);
  const ibw = idealBodyWeight(profile.gender, profile.height);
  const timeline = estimateGoalTimeline(profile);
  const plan = recommendWorkoutPlan(profile);
  const weightToGo = profile.targetWeight - profile.weight;

  const today = getToday();
  const todayNutrition = nutrition.filter(n => n.date === today);
  const todayCalories = todayNutrition.reduce((sum, n) => sum + n.calories, 0);
  const todayProtein = todayNutrition.reduce((sum, n) => sum + n.protein, 0);
  const todayCarbs = todayNutrition.reduce((sum, n) => sum + n.carbs, 0);
  const todayFat = todayNutrition.reduce((sum, n) => sum + n.fat, 0);

  const thisWeekWorkouts = workouts.filter(w => {
    const d = new Date(w.date);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });

  const totalCalsBurned = thisWeekWorkouts.reduce((sum, w) => sum + w.caloriesBurned, 0);

  const currentLog: DailyLog = dailyLog || { date: today, steps: 0, waterGlasses: 0, sleepHours: 0, mood: 3 };

  const updateLog = (updates: Partial<DailyLog>) => {
    onUpdateDailyLog({ ...currentLog, ...updates, date: today });
  };

  // Weight trend data
  const weightData = bodyMetrics
    .slice(-14)
    .map(m => ({
      date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: m.weight,
      bodyFat: m.bodyFat,
    }));

  // Calorie ring progress
  const calProgress = Math.min(todayCalories / targetCals, 1.5);
  const caloriesPieData = [
    { name: 'consumed', value: Math.min(todayCalories, targetCals) },
    { name: 'remaining', value: Math.max(targetCals - todayCalories, 0) },
  ];

  // macro colors used in the pie chart
  const _macroColors = ['#6366f1', '#06b6d4', '#f59e0b'];
  void _macroColors;

  return (
    <div className="space-y-6 fade-in">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hey, {profile.name}! 👋</h1>
          <p className="text-dark-text">Let's crush your goals today</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-dark-text">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Goal Progress Banner */}
      <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 gradient-bg opacity-10 rounded-full blur-3xl" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-5 h-5 text-success" />
              <h3 className="font-semibold">
                {effGoal === 'lose' ? '🔥 Fat Loss Journey' : effGoal === 'gain' ? '💪 Muscle Building Journey' : '⚖️ Maintenance & Recomp'}
              </h3>
            </div>
            <p className="text-sm text-dark-text">
              {effGoal === 'maintain'
                ? `Maintaining around ${profile.targetWeight} kg`
                : `${Math.abs(weightToGo).toFixed(1)} kg to ${effGoal === 'lose' ? 'lose' : 'gain'} — from ${profile.weight} kg to ${profile.targetWeight} kg`}
            </p>
          </div>
          {effGoal !== 'maintain' && (
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-light">{timeline.weeks}</p>
                <p className="text-xs text-dark-text">weeks</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">{Math.abs(timeline.weeklyChange)}</p>
                <p className="text-xs text-dark-text">kg/week</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-success mt-1">{formatDate(timeline.targetDate)}</p>
                <p className="text-xs text-dark-text">est. goal date</p>
              </div>
            </div>
          )}
        </div>
        {/* Progress bar from start weight to target */}
        {effGoal !== 'maintain' && bodyMetrics.length > 0 && (() => {
          const start = bodyMetrics[0].weight;
          const current = bodyMetrics[bodyMetrics.length - 1].weight;
          const totalSpan = Math.abs(profile.targetWeight - start) || 1;
          const done = Math.abs(current - start);
          const pct = Math.min((done / totalSpan) * 100, 100);
          return (
            <div className="mt-4 relative">
              <div className="h-2.5 bg-dark rounded-full overflow-hidden">
                <div className="h-full gradient-bg rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between text-xs text-dark-text mt-1">
                <span>Start: {start} kg</span>
                <span className="text-primary-light font-medium">{pct.toFixed(0)}% there</span>
                <span>Goal: {profile.targetWeight} kg</span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<Scale className="w-5 h-5" />}
          label="BMI"
          value={bmi.toString()}
          subtitle={bmiInfo.label}
          color={bmiInfo.color}
        />
        <StatCard
          icon={<Flame className="w-5 h-5" />}
          label="TDEE"
          value={tdee.toString()}
          subtitle="cal/day"
          color="#f59e0b"
        />
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Target"
          value={targetCals.toString()}
          subtitle="cal/day"
          color="#6366f1"
        />
        <StatCard
          icon={<Dumbbell className="w-5 h-5" />}
          label="This Week"
          value={thisWeekWorkouts.length.toString()}
          subtitle="workouts"
          color="#06b6d4"
        />
      </div>

      {/* Calorie & Macro Tracking */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" /> Today's Calories
          </h3>
          <div className="flex items-center gap-6">
            <div className="w-36 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={caloriesPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    strokeWidth={0}
                  >
                    <Cell fill={calProgress > 1 ? '#ef4444' : '#6366f1'} />
                    <Cell fill="#1e293b" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="relative -mt-[94px] text-center">
                <p className="text-2xl font-bold">{todayCalories}</p>
                <p className="text-xs text-dark-text">/ {targetCals}</p>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <MacroBar label="Protein" current={todayProtein} target={macros.protein} color="#6366f1" unit="g" />
              <MacroBar label="Carbs" current={todayCarbs} target={macros.carbs} color="#06b6d4" unit="g" />
              <MacroBar label="Fat" current={todayFat} target={macros.fat} color="#f59e0b" unit="g" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-dark-border flex justify-between text-sm text-dark-text">
            <span>🔥 Burned this week: {totalCalsBurned} cal</span>
            <span>{todayCalories > targetCals ? '⚠️ Over target' : `${targetCals - todayCalories} cal left`}</span>
          </div>
        </div>

        {/* Daily Habits */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400" /> Daily Habits
          </h3>
          <div className="space-y-4">
            <HabitTracker
              icon={<Footprints className="w-5 h-5 text-green-400" />}
              label="Steps"
              value={currentLog.steps}
              target={10000}
              unit=""
              onChange={v => updateLog({ steps: v })}
              step={500}
            />
            <HabitTracker
              icon={<Droplets className="w-5 h-5 text-blue-400" />}
              label="Water"
              value={currentLog.waterGlasses}
              target={8}
              unit="glasses"
              onChange={v => updateLog({ waterGlasses: v })}
              step={1}
            />
            <HabitTracker
              icon={<Moon className="w-5 h-5 text-purple-400" />}
              label="Sleep"
              value={currentLog.sleepHours}
              target={8}
              unit="hrs"
              onChange={v => updateLog({ sleepHours: v })}
              step={0.5}
            />
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-dark-text">Mood</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(m => (
                    <button
                      key={m}
                      onClick={() => updateLog({ mood: m as 1|2|3|4|5 })}
                      className={`text-lg transition-transform ${currentLog.mood >= m ? 'scale-110' : 'opacity-30 scale-90'}`}
                    >
                      {m <= 2 ? '😟' : m === 3 ? '😐' : m === 4 ? '😊' : '🤩'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weight Trend Chart */}
      {weightData.length > 1 && (
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" /> Weight Trend
            </h3>
            <div className="flex items-center gap-2 text-sm">
              {bodyMetrics.length >= 2 && (
                <span className={`flex items-center gap-1 ${
                  bodyMetrics[bodyMetrics.length - 1].weight < bodyMetrics[bodyMetrics.length - 2].weight
                    ? 'text-green-400' : 'text-red-400'
                }`}>
                  {bodyMetrics[bodyMetrics.length - 1].weight < bodyMetrics[bodyMetrics.length - 2].weight
                    ? <TrendingDown className="w-4 h-4" />
                    : <TrendingUp className="w-4 h-4" />
                  }
                  {Math.abs(bodyMetrics[bodyMetrics.length - 1].weight - bodyMetrics[bodyMetrics.length - 2].weight).toFixed(1)} kg
                </span>
              )}
              <span className="text-dark-text">Ideal: {ibw} kg</span>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weightData}>
                <defs>
                  <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="weight" stroke="#6366f1" fill="url(#weightGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recommended Workout Plan */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <Dumbbell className="w-5 h-5 text-primary-light" />
          <h3 className="font-semibold">Your Recommended Plan: {plan.name}</h3>
        </div>
        <p className="text-sm text-dark-text mb-1">{plan.description}</p>
        <p className="text-xs text-primary-light mb-4">{plan.type}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {plan.schedule.map((d, i) => (
            <div key={i} className="bg-dark/40 rounded-xl p-4 border border-dark-border/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{d.emoji}</span>
                <div>
                  <p className="text-sm font-medium leading-tight">{d.day}</p>
                  <p className="text-xs text-dark-text">{d.focus}</p>
                </div>
              </div>
              <ul className="space-y-1">
                {d.exercises.map((ex, j) => (
                  <li key={j} className="text-xs text-dark-text flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-primary-light" /> {ex}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-4 bg-accent/10 border border-accent/20 rounded-xl p-3 flex items-start gap-2">
          <Flame className="w-4 h-4 text-accent mt-0.5 shrink-0" />
          <p className="text-xs text-dark-text"><span className="text-accent font-medium">Cardio guidance:</span> {plan.cardioGuidance}</p>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm bg-dark/40 rounded-xl p-3">
          <span className="text-dark-text">🍽️ Daily calorie target for your goal</span>
          <span className="font-bold text-primary-light text-lg">{targetCals} <span className="text-xs text-dark-text font-normal">cal/day</span></span>
        </div>
      </div>

      {/* Formula Info */}
      <div className="glass-card rounded-2xl p-5 text-sm text-dark-text">
        <p className="font-medium text-dark-text-light mb-2">📊 How we calculate your numbers:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li><strong>BMR:</strong> Mifflin-St Jeor equation (most accurate clinically validated formula)</li>
          <li><strong>TDEE:</strong> BMR × Activity Multiplier (Katch-McArdle compatible)</li>
          <li><strong>Calories Burned:</strong> MET-based calculation using your body weight</li>
          <li><strong>1RM Estimation:</strong> Brzycki formula for strength predictions</li>
          <li><strong>Body Fat %:</strong> U.S. Navy circumference method</li>
        </ul>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subtitle, color }: {
  icon: React.ReactNode; label: string; value: string; subtitle: string; color: string;
}) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color }}>{icon}</span>
        <span className="text-xs text-dark-text uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="text-xs text-dark-text">{subtitle}</p>
    </div>
  );
}

function MacroBar({ label, current, target, color, unit }: {
  label: string; current: number; target: number; color: string; unit: string;
}) {
  const pct = Math.min((current / target) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-dark-text">{label}</span>
        <span className="text-dark-text-light">{current}/{target}{unit}</span>
      </div>
      <div className="h-2 bg-dark rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function HabitTracker({ icon, label, value, target, unit, onChange, step }: {
  icon: React.ReactNode; label: string; value: number; target: number; unit: string;
  onChange: (v: number) => void; step: number;
}) {
  const pct = Math.min((value / target) * 100, 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm text-dark-text">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChange(Math.max(0, value - step))}
            className="w-7 h-7 rounded-lg bg-dark border border-dark-border text-dark-text hover:text-dark-text-light flex items-center justify-center text-sm"
          >-</button>
          <span className="text-sm font-medium w-16 text-center">{value} {unit}</span>
          <button
            onClick={() => onChange(value + step)}
            className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 text-primary-light flex items-center justify-center text-sm"
          >+</button>
        </div>
      </div>
      <div className="h-1.5 bg-dark rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, background: pct >= 100 ? '#10b981' : '#6366f1' }}
        />
      </div>
    </div>
  );
}

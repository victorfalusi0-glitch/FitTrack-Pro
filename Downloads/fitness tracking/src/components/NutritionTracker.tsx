import { useState } from 'react';
import { NutritionEntry, UserProfile } from '../types';
import { generateId, getToday, calculateTargetCalories, calculateMacros, getEffectiveGoal } from '../utils/fitness';
import { Plus, Trash2, Coffee, Sun, Sunset, Cookie, X, Apple } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Props {
  nutrition: NutritionEntry[];
  profile: UserProfile;
  onAddEntry: (entry: NutritionEntry) => void;
  onDeleteEntry: (id: string) => void;
}

const MEAL_ICONS: Record<string, React.ReactNode> = {
  breakfast: <Coffee className="w-4 h-4 text-yellow-400" />,
  lunch: <Sun className="w-4 h-4 text-orange-400" />,
  dinner: <Sunset className="w-4 h-4 text-purple-400" />,
  snack: <Cookie className="w-4 h-4 text-pink-400" />,
};

const QUICK_FOODS = [
  { name: 'Chicken Breast (150g)', calories: 248, protein: 46, carbs: 0, fat: 5 },
  { name: 'Rice (1 cup cooked)', calories: 206, protein: 4, carbs: 45, fat: 0 },
  { name: 'Eggs (2 large)', calories: 156, protein: 12, carbs: 1, fat: 11 },
  { name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0 },
  { name: 'Greek Yogurt (170g)', calories: 100, protein: 17, carbs: 6, fat: 1 },
  { name: 'Oatmeal (1 cup)', calories: 154, protein: 5, carbs: 27, fat: 3 },
  { name: 'Protein Shake', calories: 130, protein: 25, carbs: 3, fat: 2 },
  { name: 'Salmon (150g)', calories: 280, protein: 38, carbs: 0, fat: 13 },
  { name: 'Avocado (half)', calories: 161, protein: 2, carbs: 9, fat: 15 },
  { name: 'Sweet Potato (medium)', calories: 103, protein: 2, carbs: 24, fat: 0 },
  { name: 'Almonds (28g)', calories: 164, protein: 6, carbs: 6, fat: 14 },
  { name: 'Broccoli (1 cup)', calories: 55, protein: 4, carbs: 11, fat: 1 },
];

export default function NutritionTracker({ nutrition, profile, onAddEntry, onDeleteEntry }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [meal, setMeal] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);

  const today = getToday();
  const targetCals = calculateTargetCalories(profile);
  const macros = calculateMacros(targetCals, getEffectiveGoal(profile));

  const todayEntries = nutrition.filter(n => n.date === today);
  const todayTotals = todayEntries.reduce(
    (acc, n) => ({
      calories: acc.calories + n.calories,
      protein: acc.protein + n.protein,
      carbs: acc.carbs + n.carbs,
      fat: acc.fat + n.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Last 7 days chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayEntries = nutrition.filter(n => n.date === dateStr);
    const dayCals = dayEntries.reduce((sum, n) => sum + n.calories, 0);
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      calories: dayCals,
      target: targetCals,
    };
  });

  const quickAdd = (food: typeof QUICK_FOODS[0]) => {
    setDescription(food.name);
    setCalories(food.calories);
    setProtein(food.protein);
    setCarbs(food.carbs);
    setFat(food.fat);
  };

  const saveEntry = () => {
    if (!description.trim()) return;
    onAddEntry({
      id: generateId(),
      date: today,
      meal,
      description,
      calories,
      protein,
      carbs,
      fat,
    });
    setDescription('');
    setCalories(0);
    setProtein(0);
    setCarbs(0);
    setFat(0);
  };

  const mealGroups = (['breakfast', 'lunch', 'dinner', 'snack'] as const).map(m => ({
    meal: m,
    entries: todayEntries.filter(e => e.meal === m),
  }));

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Nutrition</h2>
          <p className="text-dark-text">Track your meals & macros</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-bg text-white font-medium hover:opacity-90 transition-opacity"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Log Food'}
        </button>
      </div>

      {/* Daily Summary */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-semibold mb-4">Today's Summary</h3>
        <div className="grid grid-cols-4 gap-3">
          <SummaryBox label="Calories" current={todayTotals.calories} target={targetCals} unit="cal" color="#f59e0b" />
          <SummaryBox label="Protein" current={todayTotals.protein} target={macros.protein} unit="g" color="#6366f1" />
          <SummaryBox label="Carbs" current={todayTotals.carbs} target={macros.carbs} unit="g" color="#06b6d4" />
          <SummaryBox label="Fat" current={todayTotals.fat} target={macros.fat} unit="g" color="#f59e0b" />
        </div>
      </div>

      {/* Add Food Form */}
      {showForm && (
        <div className="glass-card rounded-2xl p-5 space-y-4 fade-in">
          <h3 className="font-semibold">Add Food Entry</h3>
          
          {/* Meal type selector */}
          <div className="flex gap-2">
            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMeal(m)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm capitalize transition-all ${
                  meal === m
                    ? 'bg-primary/20 border-primary text-primary-light'
                    : 'border-dark-border text-dark-text hover:text-dark-text-light'
                }`}
              >
                {MEAL_ICONS[m]} {m}
              </button>
            ))}
          </div>

          {/* Quick add buttons */}
          <div>
            <label className="block text-sm text-dark-text mb-2">Quick Add</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {QUICK_FOODS.map(food => (
                <button
                  key={food.name}
                  onClick={() => quickAdd(food)}
                  className="px-3 py-1.5 rounded-lg bg-dark border border-dark-border text-xs text-dark-text hover:text-dark-text-light hover:border-primary transition-colors"
                >
                  {food.name} ({food.calories}cal)
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-dark-text mb-1">Food Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What did you eat?"
              className="w-full px-4 py-2.5 bg-dark border border-dark-border rounded-xl text-dark-text-light focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-dark-text mb-1">Calories</label>
              <input type="number" value={calories} onChange={e => setCalories(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm text-dark-text-light focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs text-dark-text mb-1">Protein (g)</label>
              <input type="number" value={protein} onChange={e => setProtein(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm text-dark-text-light focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs text-dark-text mb-1">Carbs (g)</label>
              <input type="number" value={carbs} onChange={e => setCarbs(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm text-dark-text-light focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs text-dark-text mb-1">Fat (g)</label>
              <input type="number" value={fat} onChange={e => setFat(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm text-dark-text-light focus:outline-none focus:border-primary" />
            </div>
          </div>

          {calories > 0 && (
            <p className="text-xs text-dark-text">
              Macro check: {protein * 4 + carbs * 4 + fat * 9} cal from macros vs {calories} cal entered
              {Math.abs((protein * 4 + carbs * 4 + fat * 9) - calories) > 20 && (
                <span className="text-warning ml-1">⚠️ Doesn't match</span>
              )}
            </p>
          )}

          <button
            onClick={saveEntry}
            disabled={!description.trim()}
            className="w-full py-2.5 rounded-xl gradient-bg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Add Entry
          </button>
        </div>
      )}

      {/* Meals breakdown */}
      <div className="space-y-4">
        {mealGroups.map(({ meal: m, entries }) => (
          entries.length > 0 && (
            <div key={m} className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                {MEAL_ICONS[m]}
                <h4 className="font-medium capitalize">{m}</h4>
                <span className="text-xs text-dark-text ml-auto">
                  {entries.reduce((s, e) => s + e.calories, 0)} cal
                </span>
              </div>
              <div className="space-y-2">
                {entries.map(entry => (
                  <div key={entry.id} className="flex items-center justify-between bg-dark/30 rounded-lg px-3 py-2">
                    <div>
                      <p className="text-sm">{entry.description}</p>
                      <p className="text-xs text-dark-text">
                        P: {entry.protein}g · C: {entry.carbs}g · F: {entry.fat}g
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-accent">{entry.calories} cal</span>
                      <button onClick={() => onDeleteEntry(entry.id)} className="text-dark-text hover:text-danger">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </div>

      {todayEntries.length === 0 && !showForm && (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Apple className="w-12 h-12 text-dark-text mx-auto mb-3" />
          <p className="text-dark-text">No food logged today. Start tracking your meals!</p>
        </div>
      )}

      {/* Weekly Chart */}
      {nutrition.length > 0 && (
        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-semibold mb-4">Weekly Calorie Intake</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }} />
                <Bar dataKey="calories" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="target" fill="#334155" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryBox({ label, current, target, unit, color }: {
  label: string; current: number; target: number; unit: string; color: string;
}) {
  const pct = Math.min((current / target) * 100, 100);
  return (
    <div className="text-center">
      <p className="text-xs text-dark-text mb-1">{label}</p>
      <p className="text-lg font-bold" style={{ color }}>{current}</p>
      <p className="text-xs text-dark-text">/ {target}{unit}</p>
      <div className="h-1 bg-dark rounded-full mt-2 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

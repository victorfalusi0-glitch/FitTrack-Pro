import { useState } from 'react';
import { Workout, Exercise, ExerciseSet, UserProfile } from '../types';
import { generateId, getToday, formatDate, estimateCaloriesBurned, calculateOneRepMax } from '../utils/fitness';
import { Plus, Trash2, Dumbbell, Clock, Flame, Trophy, ChevronDown, ChevronUp, X } from 'lucide-react';

interface Props {
  workouts: Workout[];
  profile: UserProfile;
  onAddWorkout: (workout: Workout) => void;
  onDeleteWorkout: (id: string) => void;
}

const EXERCISE_PRESETS: Record<string, string[]> = {
  chest: ['Bench Press', 'Incline Dumbbell Press', 'Cable Flyes', 'Push-ups', 'Dips'],
  back: ['Deadlift', 'Pull-ups', 'Barbell Row', 'Lat Pulldown', 'Cable Row'],
  legs: ['Squat', 'Leg Press', 'Romanian Deadlift', 'Lunges', 'Leg Curl', 'Calf Raises'],
  shoulders: ['Overhead Press', 'Lateral Raise', 'Face Pull', 'Front Raise', 'Shrugs'],
  arms: ['Barbell Curl', 'Tricep Pushdown', 'Hammer Curl', 'Skull Crushers', 'Preacher Curl'],
  core: ['Plank', 'Cable Crunch', 'Hanging Leg Raise', 'Ab Wheel', 'Russian Twist'],
  cardio: ['Running', 'Cycling', 'Jump Rope', 'Rowing', 'Swimming', 'HIIT'],
};

const CATEGORY_EMOJIS: Record<string, string> = {
  chest: '🏋️', back: '🔙', legs: '🦵', shoulders: '💪',
  arms: '💪', core: '🎯', cardio: '🏃',
};

export default function WorkoutTracker({ workouts, profile, onAddWorkout, onDeleteWorkout }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [workoutName, setWorkoutName] = useState('');
  const [duration, setDuration] = useState(45);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);

  const addExercise = (category: Exercise['category'], name: string) => {
    setExercises(prev => [...prev, {
      id: generateId(),
      name,
      category,
      sets: [{ reps: 10, weight: 0 }],
    }]);
  };

  const updateSet = (exerciseId: string, setIndex: number, updates: Partial<ExerciseSet>) => {
    setExercises(prev => prev.map(ex =>
      ex.id === exerciseId
        ? { ...ex, sets: ex.sets.map((s, i) => i === setIndex ? { ...s, ...updates } : s) }
        : ex
    ));
  };

  const addSet = (exerciseId: string) => {
    setExercises(prev => prev.map(ex =>
      ex.id === exerciseId
        ? { ...ex, sets: [...ex.sets, { reps: ex.sets[ex.sets.length - 1]?.reps || 10, weight: ex.sets[ex.sets.length - 1]?.weight || 0 }] }
        : ex
    ));
  };

  const removeExercise = (exerciseId: string) => {
    setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  };

  const removeSet = (exerciseId: string, setIndex: number) => {
    setExercises(prev => prev.map(ex =>
      ex.id === exerciseId
        ? { ...ex, sets: ex.sets.filter((_, i) => i !== setIndex) }
        : ex
    ));
  };

  const calculateTotalCalories = () => {
    return exercises.reduce((total, ex) => {
      const exDuration = duration / Math.max(exercises.length, 1);
      return total + estimateCaloriesBurned(ex.category, exDuration, profile.weight, 'moderate');
    }, 0);
  };

  const saveWorkout = () => {
    if (!workoutName.trim() || exercises.length === 0) return;
    const workout: Workout = {
      id: generateId(),
      date: getToday(),
      name: workoutName,
      exercises,
      duration,
      caloriesBurned: calculateTotalCalories(),
    };
    onAddWorkout(workout);
    setShowForm(false);
    setWorkoutName('');
    setDuration(45);
    setExercises([]);
  };

  const totalVolume = (workout: Workout) =>
    workout.exercises.reduce((sum, ex) =>
      sum + ex.sets.reduce((s, set) => s + set.reps * set.weight, 0), 0);

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workouts</h2>
          <p className="text-dark-text">Track your training sessions</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-bg text-white font-medium hover:opacity-90 transition-opacity"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Workout'}
        </button>
      </div>

      {/* Workout Form */}
      {showForm && (
        <div className="glass-card rounded-2xl p-5 space-y-5 fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-dark-text mb-1">Workout Name</label>
              <input
                type="text"
                value={workoutName}
                onChange={e => setWorkoutName(e.target.value)}
                placeholder="e.g., Upper Body Push"
                className="w-full px-4 py-2.5 bg-dark border border-dark-border rounded-xl text-dark-text-light focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-dark-text mb-1">Duration (min)</label>
              <input
                type="number"
                value={duration}
                onChange={e => setDuration(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 bg-dark border border-dark-border rounded-xl text-dark-text-light focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Exercise Selector */}
          <div>
            <label className="block text-sm text-dark-text mb-2">Add Exercises</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(EXERCISE_PRESETS).map(([cat, exs]) => (
                <div key={cat} className="relative group">
                  <button className="px-3 py-1.5 rounded-lg bg-dark border border-dark-border text-sm text-dark-text hover:text-dark-text-light hover:border-primary transition-colors capitalize">
                    {CATEGORY_EMOJIS[cat]} {cat}
                  </button>
                  <div className="absolute z-10 top-full left-0 mt-1 bg-dark-card border border-dark-border rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all min-w-[200px]">
                    {exs.map(name => (
                      <button
                        key={name}
                        onClick={() => addExercise(cat as Exercise['category'], name)}
                        className="w-full text-left px-4 py-2 text-sm text-dark-text hover:text-dark-text-light hover:bg-dark-border/30 first:rounded-t-xl last:rounded-b-xl"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Exercise List */}
          {exercises.map(ex => (
            <div key={ex.id} className="bg-dark/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{CATEGORY_EMOJIS[ex.category]}</span>
                  <span className="font-medium">{ex.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary-light capitalize">{ex.category}</span>
                </div>
                <button onClick={() => removeExercise(ex.id)} className="text-dark-text hover:text-danger">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-[40px_1fr_1fr_40px] gap-2 text-xs text-dark-text font-medium">
                  <span>Set</span>
                  <span>Weight (kg)</span>
                  <span>Reps</span>
                  <span></span>
                </div>
                {ex.sets.map((set, si) => (
                  <div key={si} className="grid grid-cols-[40px_1fr_1fr_40px] gap-2 items-center">
                    <span className="text-sm text-dark-text text-center">{si + 1}</span>
                    <input
                      type="number"
                      value={set.weight}
                      onChange={e => updateSet(ex.id, si, { weight: parseFloat(e.target.value) || 0 })}
                      className="px-3 py-1.5 bg-dark-card border border-dark-border rounded-lg text-sm text-dark-text-light focus:outline-none focus:border-primary"
                    />
                    <input
                      type="number"
                      value={set.reps}
                      onChange={e => updateSet(ex.id, si, { reps: parseInt(e.target.value) || 0 })}
                      className="px-3 py-1.5 bg-dark-card border border-dark-border rounded-lg text-sm text-dark-text-light focus:outline-none focus:border-primary"
                    />
                    <button
                      onClick={() => removeSet(ex.id, si)}
                      className="text-dark-text hover:text-danger"
                      disabled={ex.sets.length <= 1}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-3">
                <button
                  onClick={() => addSet(ex.id)}
                  className="text-xs text-primary-light hover:text-primary flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Set
                </button>
                {ex.sets.length > 0 && ex.sets[0].weight > 0 && (
                  <span className="text-xs text-dark-text">
                    Est. 1RM: <span className="text-accent font-medium">{calculateOneRepMax(ex.sets[0].weight, ex.sets[0].reps)} kg</span>
                  </span>
                )}
              </div>
            </div>
          ))}

          {exercises.length > 0 && (
            <div className="flex items-center justify-between pt-3 border-t border-dark-border">
              <div className="flex items-center gap-4 text-sm text-dark-text">
                <span className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-400" /> ~{calculateTotalCalories()} cal
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-blue-400" /> {duration} min
                </span>
              </div>
              <button
                onClick={saveWorkout}
                disabled={!workoutName.trim()}
                className="px-6 py-2.5 rounded-xl gradient-bg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Save Workout
              </button>
            </div>
          )}
        </div>
      )}

      {/* Workout History */}
      <div className="space-y-3">
        {workouts.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Dumbbell className="w-12 h-12 text-dark-text mx-auto mb-3" />
            <p className="text-dark-text">No workouts yet. Start your first session!</p>
          </div>
        ) : (
          [...workouts].reverse().map(w => (
            <div key={w.id} className="glass-card rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedWorkout(expandedWorkout === w.id ? null : w.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-dark-border/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{w.name}</p>
                    <p className="text-xs text-dark-text">{formatDate(w.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex items-center gap-3 text-sm text-dark-text">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {w.duration}m</span>
                    <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-orange-400" /> {w.caloriesBurned}cal</span>
                    <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-yellow-400" /> {totalVolume(w).toLocaleString()}kg</span>
                  </div>
                  {expandedWorkout === w.id ? <ChevronUp className="w-4 h-4 text-dark-text" /> : <ChevronDown className="w-4 h-4 text-dark-text" />}
                </div>
              </button>
              {expandedWorkout === w.id && (
                <div className="px-4 pb-4 space-y-2 fade-in">
                  <div className="md:hidden flex items-center gap-3 text-sm text-dark-text mb-2">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {w.duration}m</span>
                    <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-orange-400" /> {w.caloriesBurned}cal</span>
                    <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-yellow-400" /> {totalVolume(w).toLocaleString()}kg vol</span>
                  </div>
                  {w.exercises.map(ex => (
                    <div key={ex.id} className="bg-dark/30 rounded-lg p-3">
                      <p className="text-sm font-medium mb-1">{CATEGORY_EMOJIS[ex.category]} {ex.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {ex.sets.map((s, i) => (
                          <span key={i} className="text-xs px-2 py-1 rounded-md bg-dark-card border border-dark-border text-dark-text">
                            Set {i + 1}: {s.weight}kg × {s.reps}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => onDeleteWorkout(w.id)}
                    className="text-xs text-danger hover:text-red-400 flex items-center gap-1 mt-2"
                  >
                    <Trash2 className="w-3 h-3" /> Delete Workout
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

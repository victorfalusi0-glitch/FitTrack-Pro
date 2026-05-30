import { useState } from 'react';
import { UserProfile, Workout, NutritionEntry, BodyMetric, DailyLog, TabType } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { getToday } from './utils/fitness';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './components/Dashboard';
import WorkoutTracker from './components/WorkoutTracker';
import NutritionTracker from './components/NutritionTracker';
import BodyMetrics from './components/BodyMetrics';
import Calculator from './components/Calculator';
import {
  LayoutDashboard,
  Dumbbell,
  Apple,
  Ruler,
  Calculator as CalcIcon,
  Settings,
  RotateCcw,
} from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useLocalStorage<UserProfile | null>('ft_profile', null);
  const [workouts, setWorkouts] = useLocalStorage<Workout[]>('ft_workouts', []);
  const [nutrition, setNutrition] = useLocalStorage<NutritionEntry[]>('ft_nutrition', []);
  const [bodyMetrics, setBodyMetrics] = useLocalStorage<BodyMetric[]>('ft_bodyMetrics', []);
  const [dailyLogs, setDailyLogs] = useLocalStorage<DailyLog[]>('ft_dailyLogs', []);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showSettings, setShowSettings] = useState(false);

  const today = getToday();
  const todayLog = dailyLogs.find(l => l.date === today) || null;

  const updateDailyLog = (log: DailyLog) => {
    setDailyLogs(prev => {
      const existing = prev.findIndex(l => l.date === log.date);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = log;
        return updated;
      }
      return [...prev, log];
    });
  };

  const addWorkout = (workout: Workout) => setWorkouts(prev => [...prev, workout]);
  const deleteWorkout = (id: string) => setWorkouts(prev => prev.filter(w => w.id !== id));
  const addNutrition = (entry: NutritionEntry) => setNutrition(prev => [...prev, entry]);
  const deleteNutrition = (id: string) => setNutrition(prev => prev.filter(n => n.id !== id));
  const addBodyMetric = (metric: BodyMetric) => setBodyMetrics(prev => [...prev, metric]);
  const deleteBodyMetric = (id: string) => setBodyMetrics(prev => prev.filter(m => m.id !== id));

  const resetAll = () => {
    if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      setProfile(null);
      setWorkouts([]);
      setNutrition([]);
      setBodyMetrics([]);
      setDailyLogs([]);
      setShowSettings(false);
    }
  };

  // Onboarding
  if (!profile) {
    return <ProfileSetup onComplete={setProfile} />;
  }

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'workouts', label: 'Workouts', icon: <Dumbbell className="w-5 h-5" /> },
    { id: 'nutrition', label: 'Nutrition', icon: <Apple className="w-5 h-5" /> },
    { id: 'body', label: 'Body', icon: <Ruler className="w-5 h-5" /> },
    { id: 'calculator', label: 'Calculators', icon: <CalcIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-dark-border p-4 fixed h-full bg-dark/50 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
              FitTrack Pro
            </h1>
            <p className="text-xs text-dark-text">Science-based tracking</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-primary/20 text-primary-light font-medium'
                  : 'text-dark-text hover:text-dark-text-light hover:bg-dark-card'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-dark-border pt-4 space-y-1">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-dark-text hover:text-dark-text-light hover:bg-dark-card transition-all"
          >
            <Settings className="w-5 h-5" /> Settings
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pb-24 md:pb-8">
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          {showSettings && (
            <div className="glass-card rounded-2xl p-6 mb-6 fade-in">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" /> Settings
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-dark-text mb-1">Name</label>
                  <input type="text" value={profile.name}
                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs text-dark-text mb-1">Age</label>
                  <input type="number" value={profile.age}
                    onChange={e => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs text-dark-text mb-1">Weight (kg)</label>
                  <input type="number" value={profile.weight}
                    onChange={e => setProfile({ ...profile, weight: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs text-dark-text mb-1">Height (cm)</label>
                  <input type="number" value={profile.height}
                    onChange={e => setProfile({ ...profile, height: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs text-dark-text mb-1">Goal Weight (kg)</label>
                  <input type="number" value={profile.targetWeight}
                    onChange={e => setProfile({ ...profile, targetWeight: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs text-dark-text mb-1">Experience</label>
                  <select value={profile.experience}
                    onChange={e => setProfile({ ...profile, experience: e.target.value as UserProfile['experience'] })}
                    className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm focus:outline-none focus:border-primary">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-dark-text mb-1">Training Days/Week</label>
                  <select value={profile.daysPerWeek}
                    onChange={e => setProfile({ ...profile, daysPerWeek: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm focus:outline-none focus:border-primary">
                    {[2,3,4,5,6].map(d => <option key={d} value={d}>{d} days</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-dark-text mb-1">Gender</label>
                  <select value={profile.gender}
                    onChange={e => setProfile({ ...profile, gender: e.target.value as 'male' | 'female' })}
                    className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm focus:outline-none focus:border-primary">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-dark-text mb-1">Activity Level</label>
                  <select value={profile.activityLevel}
                    onChange={e => setProfile({ ...profile, activityLevel: e.target.value as UserProfile['activityLevel'] })}
                    className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm focus:outline-none focus:border-primary">
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Light</option>
                    <option value="moderate">Moderate</option>
                    <option value="active">Active</option>
                    <option value="very_active">Very Active</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-dark-text mb-1">Goal</label>
                  <select value={profile.goal}
                    onChange={e => setProfile({ ...profile, goal: e.target.value as UserProfile['goal'] })}
                    className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm focus:outline-none focus:border-primary">
                    <option value="lose">Lose Weight</option>
                    <option value="maintain">Maintain</option>
                    <option value="gain">Build Muscle</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-dark-border">
                <button onClick={resetAll}
                  className="flex items-center gap-2 text-sm text-danger hover:text-red-400">
                  <RotateCcw className="w-4 h-4" /> Reset All Data
                </button>
                <button onClick={() => setShowSettings(false)}
                  className="px-4 py-2 rounded-lg bg-primary/20 text-primary-light text-sm hover:bg-primary/30">
                  Close
                </button>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <Dashboard
              profile={profile}
              workouts={workouts}
              nutrition={nutrition}
              bodyMetrics={bodyMetrics}
              dailyLog={todayLog}
              onUpdateDailyLog={updateDailyLog}
            />
          )}
          {activeTab === 'workouts' && (
            <WorkoutTracker
              workouts={workouts}
              profile={profile}
              onAddWorkout={addWorkout}
              onDeleteWorkout={deleteWorkout}
            />
          )}
          {activeTab === 'nutrition' && (
            <NutritionTracker
              nutrition={nutrition}
              profile={profile}
              onAddEntry={addNutrition}
              onDeleteEntry={deleteNutrition}
            />
          )}
          {activeTab === 'body' && (
            <BodyMetrics
              bodyMetrics={bodyMetrics}
              profile={profile}
              onAddMetric={addBodyMetric}
              onDeleteMetric={deleteBodyMetric}
            />
          )}
          {activeTab === 'calculator' && (
            <Calculator profile={profile} />
          )}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark/90 backdrop-blur-xl border-t border-dark-border z-20">
        <div className="flex justify-around py-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'text-primary-light'
                  : 'text-dark-text'
              }`}
            >
              {tab.icon}
              <span className="text-[10px]">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

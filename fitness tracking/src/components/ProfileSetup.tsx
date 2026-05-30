import { useState } from 'react';
import { UserProfile } from '../types';
import { Dumbbell, ChevronRight, ChevronLeft, User, Activity, Target } from 'lucide-react';

interface Props {
  onComplete: (profile: UserProfile) => void;
}

export default function ProfileSetup({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    age: 25,
    gender: 'male',
    height: 175,
    weight: 75,
    targetWeight: 72,
    activityLevel: 'moderate',
    goal: 'maintain',
    experience: 'beginner',
    daysPerWeek: 3,
  });

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const steps = [
    // Step 0: Welcome + Name
    <div key="step0" className="fade-in space-y-8 text-center">
      <div className="w-24 h-24 mx-auto gradient-bg rounded-3xl flex items-center justify-center pulse-glow">
        <Dumbbell className="w-12 h-12 text-white" />
      </div>
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
          FitTrack Pro
        </h1>
        <p className="text-dark-text mt-2 text-lg">Accurate fitness tracking powered by science</p>
      </div>
      <div className="max-w-sm mx-auto">
        <label className="block text-sm text-dark-text mb-2 text-left">What's your name?</label>
        <input
          type="text"
          value={profile.name}
          onChange={e => updateProfile({ name: e.target.value })}
          placeholder="Enter your name"
          className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-xl text-dark-text-light focus:outline-none focus:border-primary transition-colors"
        />
      </div>
    </div>,

    // Step 1: Basic info
    <div key="step1" className="fade-in space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <User className="w-6 h-6 text-primary-light" />
        <h2 className="text-2xl font-bold">Basic Info</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-dark-text mb-2">Age</label>
          <input
            type="number"
            value={profile.age}
            onChange={e => updateProfile({ age: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-xl text-dark-text-light focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm text-dark-text mb-2">Gender</label>
          <div className="flex gap-2">
            {(['male', 'female'] as const).map(g => (
              <button
                key={g}
                onClick={() => updateProfile({ gender: g })}
                className={`flex-1 py-3 rounded-xl border transition-all ${
                  profile.gender === g
                    ? 'bg-primary/20 border-primary text-primary-light'
                    : 'border-dark-border text-dark-text hover:border-dark-text'
                }`}
              >
                {g === 'male' ? '♂ Male' : '♀ Female'}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-dark-text mb-2">Height (cm)</label>
          <input
            type="number"
            value={profile.height}
            onChange={e => updateProfile({ height: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-xl text-dark-text-light focus:outline-none focus:border-primary"
          />
          <p className="text-xs text-dark-text mt-1">{(profile.height / 2.54 / 12).toFixed(0)}'{Math.round((profile.height / 2.54) % 12)}"</p>
        </div>
        <div>
          <label className="block text-sm text-dark-text mb-2">Weight (kg)</label>
          <input
            type="number"
            value={profile.weight}
            onChange={e => updateProfile({ weight: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-xl text-dark-text-light focus:outline-none focus:border-primary"
          />
          <p className="text-xs text-dark-text mt-1">{(profile.weight * 2.205).toFixed(1)} lbs</p>
        </div>
      </div>
    </div>,

    // Step 2: Activity Level
    <div key="step2" className="fade-in space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="w-6 h-6 text-accent" />
        <h2 className="text-2xl font-bold">Activity Level</h2>
      </div>
      <div className="space-y-3">
        {([
          { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise, desk job' },
          { value: 'light', label: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
          { value: 'moderate', label: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
          { value: 'active', label: 'Very Active', desc: 'Hard exercise 6-7 days/week' },
          { value: 'very_active', label: 'Extra Active', desc: 'Very hard exercise, physical job' },
        ] as const).map(opt => (
          <button
            key={opt.value}
            onClick={() => updateProfile({ activityLevel: opt.value })}
            className={`w-full text-left p-4 rounded-xl border transition-all ${
              profile.activityLevel === opt.value
                ? 'bg-primary/20 border-primary'
                : 'border-dark-border hover:border-dark-text'
            }`}
          >
            <div className="font-medium text-dark-text-light">{opt.label}</div>
            <div className="text-sm text-dark-text">{opt.desc}</div>
          </button>
        ))}
      </div>
    </div>,

    // Step 3: Target Weight
    <div key="step3" className="fade-in space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Target className="w-6 h-6 text-success" />
        <h2 className="text-2xl font-bold">Goal Weight</h2>
      </div>
      <p className="text-dark-text -mt-2">What weight do you want to reach? We'll build your calorie & workout plan around it.</p>

      <div className="text-center py-4">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => updateProfile({ targetWeight: Math.max(30, profile.targetWeight - 0.5) })}
            className="w-12 h-12 rounded-xl bg-dark-card border border-dark-border text-2xl text-dark-text hover:text-dark-text-light"
          >-</button>
          <div>
            <input
              type="number"
              value={profile.targetWeight}
              onChange={e => updateProfile({ targetWeight: parseFloat(e.target.value) || 0 })}
              className="w-32 text-center text-5xl font-bold bg-transparent text-primary-light focus:outline-none"
            />
            <p className="text-sm text-dark-text">kg ({(profile.targetWeight * 2.205).toFixed(0)} lbs)</p>
          </div>
          <button
            onClick={() => updateProfile({ targetWeight: profile.targetWeight + 0.5 })}
            className="w-12 h-12 rounded-xl bg-dark-card border border-dark-border text-2xl text-dark-text hover:text-dark-text-light"
          >+</button>
        </div>
      </div>

      {/* Auto-detected goal feedback */}
      <div className="bg-dark-card/60 border border-dark-border rounded-xl p-4 text-center">
        {(() => {
          const diff = profile.targetWeight - profile.weight;
          if (diff <= -1) return (
            <div>
              <p className="text-lg font-semibold text-orange-400">🔥 Fat Loss Goal</p>
              <p className="text-sm text-dark-text mt-1">Lose {Math.abs(diff).toFixed(1)} kg from your current {profile.weight} kg</p>
            </div>
          );
          if (diff >= 1) return (
            <div>
              <p className="text-lg font-semibold text-success">💪 Muscle Building Goal</p>
              <p className="text-sm text-dark-text mt-1">Gain {diff.toFixed(1)} kg from your current {profile.weight} kg</p>
            </div>
          );
          return (
            <div>
              <p className="text-lg font-semibold text-accent">⚖️ Maintenance Goal</p>
              <p className="text-sm text-dark-text mt-1">Stay around your current {profile.weight} kg & recomp</p>
            </div>
          );
        })()}
      </div>
    </div>,

    // Step 4: Training preferences
    <div key="step4" className="fade-in space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Dumbbell className="w-6 h-6 text-primary-light" />
        <h2 className="text-2xl font-bold">Training Preferences</h2>
      </div>

      <div>
        <label className="block text-sm text-dark-text mb-2">Experience Level</label>
        <div className="space-y-2">
          {([
            { value: 'beginner', label: '🌱 Beginner', desc: 'New to training or returning after a long break' },
            { value: 'intermediate', label: '⚡ Intermediate', desc: '6+ months of consistent training' },
            { value: 'advanced', label: '🔥 Advanced', desc: '2+ years, comfortable with heavy compounds' },
          ] as const).map(opt => (
            <button
              key={opt.value}
              onClick={() => updateProfile({ experience: opt.value })}
              className={`w-full text-left p-3 rounded-xl border transition-all ${
                profile.experience === opt.value
                  ? 'bg-primary/20 border-primary'
                  : 'border-dark-border hover:border-dark-text'
              }`}
            >
              <div className="font-medium text-dark-text-light">{opt.label}</div>
              <div className="text-sm text-dark-text">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-dark-text mb-2">How many days per week can you train?</label>
        <div className="flex gap-2">
          {[2, 3, 4, 5, 6].map(d => (
            <button
              key={d}
              onClick={() => updateProfile({ daysPerWeek: d })}
              className={`flex-1 py-3 rounded-xl border font-medium transition-all ${
                profile.daysPerWeek === d
                  ? 'bg-primary/20 border-primary text-primary-light'
                  : 'border-dark-border text-dark-text hover:text-dark-text-light'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <p className="text-xs text-dark-text mt-2">We'll design a split optimized for {profile.daysPerWeek} days a week.</p>
      </div>
    </div>,
  ];

  const canNext = step === 0 ? profile.name.trim().length > 0 : true;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                i <= step ? 'gradient-bg' : 'bg-dark-border'
              }`}
            />
          ))}
        </div>

        {steps[step]}

        <div className="flex justify-between mt-8">
          {step > 0 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-dark-border text-dark-text hover:text-dark-text-light transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div />
          )}
          {step < steps.length - 1 ? (
            <button
              onClick={() => canNext && setStep(s => s + 1)}
              disabled={!canNext}
              className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-bg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => onComplete(profile)}
              className="flex items-center gap-2 px-8 py-3 rounded-xl gradient-bg text-white font-medium hover:opacity-90 transition-opacity"
            >
              Get Started 🚀
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

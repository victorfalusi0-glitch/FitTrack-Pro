import { useState } from 'react';
import {
  calculateBMI,
  getBMICategory,
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateMacros,
  estimateBodyFat,
  calculateOneRepMax,
  idealBodyWeight,
  getEffectiveGoal,
} from '../utils/fitness';
import { UserProfile } from '../types';
import { Scale, Flame, Target, Percent, Dumbbell, User } from 'lucide-react';

interface Props {
  profile: UserProfile;
}

type CalculatorType = 'bmi' | 'tdee' | 'bodyfat' | '1rm' | 'ideal';

export default function Calculator({ profile }: Props) {
  const [activeCalc, setActiveCalc] = useState<CalculatorType>('bmi');

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h2 className="text-2xl font-bold">Fitness Calculators</h2>
        <p className="text-dark-text">Scientifically validated formulas for accurate results</p>
      </div>

      {/* Calculator tabs */}
      <div className="flex flex-wrap gap-2">
        {([
          { id: 'bmi', label: 'BMI', icon: <Scale className="w-4 h-4" /> },
          { id: 'tdee', label: 'TDEE & Macros', icon: <Flame className="w-4 h-4" /> },
          { id: 'bodyfat', label: 'Body Fat %', icon: <Percent className="w-4 h-4" /> },
          { id: '1rm', label: '1 Rep Max', icon: <Dumbbell className="w-4 h-4" /> },
          { id: 'ideal', label: 'Ideal Weight', icon: <User className="w-4 h-4" /> },
        ] as { id: CalculatorType; label: string; icon: React.ReactNode }[]).map(calc => (
          <button
            key={calc.id}
            onClick={() => setActiveCalc(calc.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-all ${
              activeCalc === calc.id
                ? 'bg-primary/20 border-primary text-primary-light'
                : 'border-dark-border text-dark-text hover:text-dark-text-light'
            }`}
          >
            {calc.icon} {calc.label}
          </button>
        ))}
      </div>

      {activeCalc === 'bmi' && <BMICalculator profile={profile} />}
      {activeCalc === 'tdee' && <TDEECalculator profile={profile} />}
      {activeCalc === 'bodyfat' && <BodyFatCalculator profile={profile} />}
      {activeCalc === '1rm' && <OneRepMaxCalculator />}
      {activeCalc === 'ideal' && <IdealWeightCalculator profile={profile} />}
    </div>
  );
}

function BMICalculator({ profile }: { profile: UserProfile }) {
  const [weight, setWeight] = useState(profile.weight);
  const [height, setHeight] = useState(profile.height);

  const bmi = calculateBMI(weight, height);
  const category = getBMICategory(bmi);

  // BMI scale position
  const bmiPosition = Math.min(Math.max(((bmi - 15) / (40 - 15)) * 100, 0), 100);

  return (
    <div className="glass-card rounded-2xl p-6 space-y-6 fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Scale className="w-5 h-5 text-primary-light" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">BMI Calculator</h3>
          <p className="text-xs text-dark-text">Body Mass Index</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-dark-text mb-1">Weight (kg)</label>
          <input type="number" value={weight} onChange={e => setWeight(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2.5 bg-dark border border-dark-border rounded-xl text-dark-text-light focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm text-dark-text mb-1">Height (cm)</label>
          <input type="number" value={height} onChange={e => setHeight(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2.5 bg-dark border border-dark-border rounded-xl text-dark-text-light focus:outline-none focus:border-primary" />
        </div>
      </div>

      <div className="text-center">
        <p className="text-5xl font-bold" style={{ color: category.color }}>{bmi}</p>
        <p className="text-lg mt-1" style={{ color: category.color }}>{category.label}</p>
      </div>

      {/* BMI Scale */}
      <div>
        <div className="relative h-4 rounded-full overflow-hidden bg-gradient-to-r from-yellow-400 via-green-500 via-yellow-400 to-red-500">
          <div
            className="absolute top-0 w-3 h-full bg-white rounded-full shadow-lg border-2 border-dark transition-all"
            style={{ left: `calc(${bmiPosition}% - 6px)` }}
          />
        </div>
        <div className="flex justify-between text-xs text-dark-text mt-1">
          <span>15</span>
          <span>18.5</span>
          <span>25</span>
          <span>30</span>
          <span>40</span>
        </div>
        <div className="flex justify-between text-xs text-dark-text mt-0.5">
          <span>Under</span>
          <span>Normal</span>
          <span>Over</span>
          <span>Obese</span>
        </div>
      </div>

      <div className="bg-dark/50 rounded-xl p-4 text-sm text-dark-text">
        <p className="font-medium text-dark-text-light mb-1">📐 Formula: Mifflin-St Jeor BMI</p>
        <p>BMI = weight(kg) / height(m)²</p>
        <p className="mt-2">Your height: {(height / 100).toFixed(2)}m → {(height / 2.54 / 12).toFixed(0)}'{Math.round((height / 2.54) % 12)}"</p>
        <p>Your weight: {weight}kg → {(weight * 2.205).toFixed(1)} lbs</p>
      </div>
    </div>
  );
}

function TDEECalculator({ profile }: { profile: UserProfile }) {
  const [localProfile, setLocalProfile] = useState({ ...profile });

  const bmr = calculateBMR(localProfile);
  const tdee = calculateTDEE(localProfile);
  const targetCals = calculateTargetCalories(localProfile);
  const macros = calculateMacros(targetCals, getEffectiveGoal(localProfile));

  return (
    <div className="glass-card rounded-2xl p-6 space-y-6 fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
          <Flame className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">TDEE & Macro Calculator</h3>
          <p className="text-xs text-dark-text">Total Daily Energy Expenditure</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs text-dark-text mb-1">Age</label>
          <input type="number" value={localProfile.age}
            onChange={e => setLocalProfile(p => ({ ...p, age: parseInt(e.target.value) || 0 }))}
            className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-xs text-dark-text mb-1">Gender</label>
          <select value={localProfile.gender}
            onChange={e => setLocalProfile(p => ({ ...p, gender: e.target.value as 'male' | 'female' }))}
            className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm focus:outline-none focus:border-primary">
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-dark-text mb-1">Weight (kg)</label>
          <input type="number" value={localProfile.weight}
            onChange={e => setLocalProfile(p => ({ ...p, weight: parseFloat(e.target.value) || 0 }))}
            className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-xs text-dark-text mb-1">Height (cm)</label>
          <input type="number" value={localProfile.height}
            onChange={e => setLocalProfile(p => ({ ...p, height: parseInt(e.target.value) || 0 }))}
            className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm focus:outline-none focus:border-primary" />
        </div>
      </div>

      <div>
        <label className="block text-xs text-dark-text mb-2">Activity Level</label>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {([
            { value: 'sedentary', label: 'Sedentary', mult: '1.2' },
            { value: 'light', label: 'Light', mult: '1.375' },
            { value: 'moderate', label: 'Moderate', mult: '1.55' },
            { value: 'active', label: 'Active', mult: '1.725' },
            { value: 'very_active', label: 'Very Active', mult: '1.9' },
          ] as const).map(opt => (
            <button
              key={opt.value}
              onClick={() => setLocalProfile(p => ({ ...p, activityLevel: opt.value }))}
              className={`py-2 px-3 rounded-lg border text-xs text-center transition-all ${
                localProfile.activityLevel === opt.value
                  ? 'bg-primary/20 border-primary text-primary-light'
                  : 'border-dark-border text-dark-text'
              }`}
            >
              <div className="font-medium">{opt.label}</div>
              <div className="text-[10px] opacity-60">×{opt.mult}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-3 gap-4">
        <ResultBox label="BMR" value={Math.round(bmr)} unit="cal/day" color="#94a3b8" desc="Basal Metabolic Rate" />
        <ResultBox label="TDEE" value={tdee} unit="cal/day" color="#f59e0b" desc="Maintenance Calories" />
        <ResultBox label="Target" value={targetCals} unit="cal/day" color="#6366f1"
          desc={localProfile.goal === 'lose' ? 'Deficit (-500)' : localProfile.goal === 'gain' ? 'Surplus (+300)' : 'Maintenance'} />
      </div>

      {/* Macro breakdown */}
      <div className="bg-dark/50 rounded-xl p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-primary-light" /> Recommended Macros
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full border-4 border-primary flex items-center justify-center">
              <span className="text-lg font-bold">{macros.protein}g</span>
            </div>
            <p className="text-sm text-dark-text mt-2">Protein</p>
            <p className="text-xs text-dark-text">{macros.protein * 4} cal</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full border-4 border-accent flex items-center justify-center">
              <span className="text-lg font-bold">{macros.carbs}g</span>
            </div>
            <p className="text-sm text-dark-text mt-2">Carbs</p>
            <p className="text-xs text-dark-text">{macros.carbs * 4} cal</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full border-4 border-warning flex items-center justify-center">
              <span className="text-lg font-bold">{macros.fat}g</span>
            </div>
            <p className="text-sm text-dark-text mt-2">Fat</p>
            <p className="text-xs text-dark-text">{macros.fat * 9} cal</p>
          </div>
        </div>
      </div>

      <div className="bg-dark/50 rounded-xl p-4 text-sm text-dark-text">
        <p className="font-medium text-dark-text-light mb-1">📐 Mifflin-St Jeor Equation (Gold Standard)</p>
        <p>Male: BMR = 10×weight + 6.25×height - 5×age + 5</p>
        <p>Female: BMR = 10×weight + 6.25×height - 5×age - 161</p>
        <p className="mt-1">TDEE = BMR × Activity Multiplier</p>
      </div>
    </div>
  );
}

function BodyFatCalculator({ profile }: { profile: UserProfile }) {
  const [gender, setGender] = useState(profile.gender);
  const [height, setHeight] = useState(profile.height);
  const [waist, setWaist] = useState(85);
  const [neck, setNeck] = useState(38);
  const [hip, setHip] = useState(95);
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const bf = estimateBodyFat(gender, waist, neck, height, gender === 'female' ? hip : undefined);
    setResult(bf);
  };

  const getCategory = (bf: number, g: 'male' | 'female') => {
    if (g === 'male') {
      if (bf < 6) return { label: 'Essential', color: '#ef4444' };
      if (bf < 14) return { label: 'Athletic', color: '#10b981' };
      if (bf < 18) return { label: 'Fitness', color: '#06b6d4' };
      if (bf < 25) return { label: 'Average', color: '#f59e0b' };
      return { label: 'Above Average', color: '#ef4444' };
    }
    if (bf < 14) return { label: 'Essential', color: '#ef4444' };
    if (bf < 21) return { label: 'Athletic', color: '#10b981' };
    if (bf < 25) return { label: 'Fitness', color: '#06b6d4' };
    if (bf < 32) return { label: 'Average', color: '#f59e0b' };
    return { label: 'Above Average', color: '#ef4444' };
  };

  return (
    <div className="glass-card rounded-2xl p-6 space-y-6 fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
          <Percent className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Body Fat % Estimator</h3>
          <p className="text-xs text-dark-text">U.S. Navy Circumference Method</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-dark-text mb-1">Gender</label>
          <select value={gender} onChange={e => setGender(e.target.value as 'male' | 'female')}
            className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm focus:outline-none focus:border-primary">
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-dark-text mb-1">Height (cm)</label>
          <input type="number" value={height} onChange={e => setHeight(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-xs text-dark-text mb-1">Waist (cm)</label>
          <input type="number" value={waist} onChange={e => setWaist(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm focus:outline-none focus:border-primary" />
          <p className="text-[10px] text-dark-text mt-0.5">Measure at navel level</p>
        </div>
        <div>
          <label className="block text-xs text-dark-text mb-1">Neck (cm)</label>
          <input type="number" value={neck} onChange={e => setNeck(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm focus:outline-none focus:border-primary" />
          <p className="text-[10px] text-dark-text mt-0.5">Below the larynx</p>
        </div>
        {gender === 'female' && (
          <div className="col-span-2">
            <label className="block text-xs text-dark-text mb-1">Hip (cm)</label>
            <input type="number" value={hip} onChange={e => setHip(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm focus:outline-none focus:border-primary" />
            <p className="text-[10px] text-dark-text mt-0.5">At widest point</p>
          </div>
        )}
      </div>

      <button onClick={calculate}
        className="w-full py-2.5 rounded-xl gradient-bg text-white font-medium hover:opacity-90 transition-opacity">
        Calculate Body Fat %
      </button>

      {result !== null && (
        <div className="text-center py-4 fade-in">
          <p className="text-5xl font-bold" style={{ color: getCategory(result, gender).color }}>
            {result}%
          </p>
          <p className="text-lg mt-1" style={{ color: getCategory(result, gender).color }}>
            {getCategory(result, gender).label}
          </p>
          {profile.weight > 0 && (
            <div className="mt-3 flex justify-center gap-6 text-sm text-dark-text">
              <span>Fat Mass: <strong className="text-dark-text-light">{(profile.weight * result / 100).toFixed(1)} kg</strong></span>
              <span>Lean Mass: <strong className="text-dark-text-light">{(profile.weight * (1 - result / 100)).toFixed(1)} kg</strong></span>
            </div>
          )}
        </div>
      )}

      <div className="bg-dark/50 rounded-xl p-4 text-sm text-dark-text">
        <p className="font-medium text-dark-text-light mb-1">📐 U.S. Navy Method</p>
        <p>Male: BF% = 495/(1.0324 – 0.19077×log10(waist–neck) + 0.15456×log10(height)) – 450</p>
        <p>Female: BF% = 495/(1.29579 – 0.35004×log10(waist+hip–neck) + 0.22100×log10(height)) – 450</p>
        <p className="mt-1 text-xs">Accuracy: ±3-4% compared to DEXA scan</p>
      </div>
    </div>
  );
}

function OneRepMaxCalculator() {
  const [weight, setWeight] = useState(60);
  const [reps, setReps] = useState(8);

  const oneRM = calculateOneRepMax(weight, reps);

  const percentages = [100, 95, 90, 85, 80, 75, 70, 65, 60];
  const repRanges = ['1', '2', '3', '5', '6', '8', '10', '12', '15'];

  return (
    <div className="glass-card rounded-2xl p-6 space-y-6 fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
          <Dumbbell className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">1 Rep Max Calculator</h3>
          <p className="text-xs text-dark-text">Brzycki Formula</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-dark-text mb-1">Weight Lifted (kg)</label>
          <input type="number" value={weight} onChange={e => setWeight(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2.5 bg-dark border border-dark-border rounded-xl text-dark-text-light focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm text-dark-text mb-1">Reps Performed</label>
          <input type="number" value={reps} onChange={e => setReps(parseInt(e.target.value) || 0)}
            min={1} max={15}
            className="w-full px-4 py-2.5 bg-dark border border-dark-border rounded-xl text-dark-text-light focus:outline-none focus:border-primary" />
        </div>
      </div>

      <div className="text-center">
        <p className="text-dark-text text-sm">Estimated 1 Rep Max</p>
        <p className="text-5xl font-bold text-success">{oneRM} kg</p>
        <p className="text-sm text-dark-text mt-1">{(oneRM * 2.205).toFixed(1)} lbs</p>
      </div>

      {/* Percentage chart */}
      <div className="bg-dark/50 rounded-xl p-4">
        <h4 className="font-medium mb-3 text-sm">Training Load Chart</h4>
        <div className="space-y-1.5">
          {percentages.map((pct, i) => (
            <div key={pct} className="flex items-center gap-3 text-sm">
              <span className="w-10 text-dark-text text-right">{pct}%</span>
              <div className="flex-1 h-5 bg-dark rounded-full overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, #6366f1, #06b6d4)`,
                  }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                  {Math.round(oneRM * pct / 100)} kg
                </span>
              </div>
              <span className="w-12 text-dark-text text-xs">~{repRanges[i]} reps</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-dark/50 rounded-xl p-4 text-sm text-dark-text">
        <p className="font-medium text-dark-text-light mb-1">📐 Brzycki Formula</p>
        <p>1RM = weight × (36 / (37 - reps))</p>
        <p className="mt-1 text-xs">Most accurate for 1-10 rep ranges. For 10+ reps, use Epley formula.</p>
      </div>
    </div>
  );
}

function IdealWeightCalculator({ profile }: { profile: UserProfile }) {
  const [gender, setGender] = useState(profile.gender);
  const [height, setHeight] = useState(profile.height);

  const ibw = idealBodyWeight(gender, height);
  const bmiNormalLow = 18.5 * (height / 100) * (height / 100);
  const bmiNormalHigh = 24.9 * (height / 100) * (height / 100);

  return (
    <div className="glass-card rounded-2xl p-6 space-y-6 fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
          <User className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Ideal Body Weight</h3>
          <p className="text-xs text-dark-text">Devine Formula + BMI Range</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-dark-text mb-1">Gender</label>
          <select value={gender} onChange={e => setGender(e.target.value as 'male' | 'female')}
            className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm focus:outline-none focus:border-primary">
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-dark-text mb-1">Height (cm)</label>
          <input type="number" value={height} onChange={e => setHeight(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm focus:outline-none focus:border-primary" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-sm text-dark-text">Healthy Low</p>
          <p className="text-2xl font-bold text-cyan-400">{bmiNormalLow.toFixed(1)} kg</p>
          <p className="text-xs text-dark-text">BMI 18.5</p>
        </div>
        <div>
          <p className="text-sm text-dark-text">Ideal (Devine)</p>
          <p className="text-2xl font-bold text-success">{ibw} kg</p>
          <p className="text-xs text-dark-text">{(ibw * 2.205).toFixed(1)} lbs</p>
        </div>
        <div>
          <p className="text-sm text-dark-text">Healthy High</p>
          <p className="text-2xl font-bold text-yellow-400">{bmiNormalHigh.toFixed(1)} kg</p>
          <p className="text-xs text-dark-text">BMI 24.9</p>
        </div>
      </div>

      {profile.weight > 0 && (
        <div className="bg-dark/50 rounded-xl p-4 text-center">
          <p className="text-sm text-dark-text">Your current weight: <strong className="text-dark-text-light">{profile.weight} kg</strong></p>
          <p className="text-sm mt-1">
            {profile.weight < ibw
              ? <span className="text-yellow-400">You're {(ibw - profile.weight).toFixed(1)} kg below ideal weight</span>
              : profile.weight > ibw
              ? <span className="text-blue-400">You're {(profile.weight - ibw).toFixed(1)} kg above ideal weight</span>
              : <span className="text-green-400">You're at your ideal weight!</span>
            }
          </p>
        </div>
      )}

      <div className="bg-dark/50 rounded-xl p-4 text-sm text-dark-text">
        <p className="font-medium text-dark-text-light mb-1">📐 Devine Formula (1974)</p>
        <p>Male: IBW = 50 + 2.3 × (height in inches - 60)</p>
        <p>Female: IBW = 45.5 + 2.3 × (height in inches - 60)</p>
      </div>
    </div>
  );
}

function ResultBox({ label, value, unit, color, desc }: {
  label: string; value: number; unit: string; color: string; desc: string;
}) {
  return (
    <div className="text-center p-4 bg-dark/50 rounded-xl">
      <p className="text-xs text-dark-text">{label}</p>
      <p className="text-2xl font-bold mt-1" style={{ color }}>{value.toLocaleString()}</p>
      <p className="text-xs text-dark-text">{unit}</p>
      <p className="text-[10px] text-dark-text mt-1">{desc}</p>
    </div>
  );
}

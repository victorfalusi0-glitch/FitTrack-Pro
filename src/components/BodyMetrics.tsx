import { useState } from 'react';
import { BodyMetric, UserProfile } from '../types';
import { generateId, getToday, formatDate } from '../utils/fitness';
import { Plus, Trash2, TrendingUp, TrendingDown, Minus, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface Props {
  bodyMetrics: BodyMetric[];
  profile: UserProfile;
  onAddMetric: (metric: BodyMetric) => void;
  onDeleteMetric: (id: string) => void;
}

export default function BodyMetrics({ bodyMetrics, profile, onAddMetric, onDeleteMetric }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [weight, setWeight] = useState(profile.weight);
  const [bodyFat, setBodyFat] = useState<number | undefined>(undefined);
  const [waist, setWaist] = useState<number | undefined>(undefined);
  const [chest, setChest] = useState<number | undefined>(undefined);
  const [arms, setArms] = useState<number | undefined>(undefined);
  const [thighs, setThighs] = useState<number | undefined>(undefined);

  const saveMetric = () => {
    onAddMetric({
      id: generateId(),
      date: getToday(),
      weight,
      bodyFat,
      waist,
      chest,
      arms,
      thighs,
    });
    setShowForm(false);
  };

  const chartData = bodyMetrics.slice(-30).map(m => ({
    date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: m.weight,
    bodyFat: m.bodyFat,
    waist: m.waist,
  }));

  const latest = bodyMetrics[bodyMetrics.length - 1];
  const previous = bodyMetrics[bodyMetrics.length - 2];

  const getChange = (current?: number, prev?: number) => {
    if (current === undefined || prev === undefined) return null;
    const diff = current - prev;
    return {
      value: Math.abs(diff).toFixed(1),
      direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same',
    };
  };

  const weightChange = latest && previous ? getChange(latest.weight, previous.weight) : null;
  const bfChange = latest?.bodyFat && previous?.bodyFat ? getChange(latest.bodyFat, previous.bodyFat) : null;

  // Calculate lean mass and fat mass if body fat is available
  const leanMass = latest?.bodyFat ? latest.weight * (1 - latest.bodyFat / 100) : null;
  const _fatMass = latest?.bodyFat ? latest.weight * (latest.bodyFat / 100) : null;
  void _fatMass;

  // Starting stats
  const startWeight = bodyMetrics.length > 0 ? bodyMetrics[0].weight : profile.weight;
  const totalChange = latest ? latest.weight - startWeight : 0;

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Body Metrics</h2>
          <p className="text-dark-text">Track your body composition</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-bg text-white font-medium hover:opacity-90 transition-opacity"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Log Metrics'}
        </button>
      </div>

      {/* Current Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="Weight"
          value={latest ? `${latest.weight} kg` : `${profile.weight} kg`}
          change={weightChange}
          goalDirection={profile.goal === 'lose' ? 'down' : profile.goal === 'gain' ? 'up' : 'same'}
        />
        <MetricCard
          label="Body Fat"
          value={latest?.bodyFat ? `${latest.bodyFat}%` : '—'}
          change={bfChange}
          goalDirection="down"
        />
        <MetricCard
          label="Lean Mass"
          value={leanMass ? `${leanMass.toFixed(1)} kg` : '—'}
          change={null}
          goalDirection="up"
        />
        <MetricCard
          label="Total Change"
          value={`${totalChange > 0 ? '+' : ''}${totalChange.toFixed(1)} kg`}
          change={null}
          goalDirection={profile.goal === 'lose' ? 'down' : 'up'}
        />
      </div>

      {/* Add Metrics Form */}
      {showForm && (
        <div className="glass-card rounded-2xl p-5 space-y-4 fade-in">
          <h3 className="font-semibold">Log Body Measurements</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-dark-text mb-1">Weight (kg) *</label>
              <input type="number" value={weight} onChange={e => setWeight(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-dark-text-light focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs text-dark-text mb-1">Body Fat %</label>
              <input type="number" value={bodyFat || ''} onChange={e => setBodyFat(parseFloat(e.target.value) || undefined)}
                placeholder="Optional"
                className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-dark-text-light focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs text-dark-text mb-1">Waist (cm)</label>
              <input type="number" value={waist || ''} onChange={e => setWaist(parseFloat(e.target.value) || undefined)}
                placeholder="Optional"
                className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-dark-text-light focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs text-dark-text mb-1">Chest (cm)</label>
              <input type="number" value={chest || ''} onChange={e => setChest(parseFloat(e.target.value) || undefined)}
                placeholder="Optional"
                className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-dark-text-light focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs text-dark-text mb-1">Arms (cm)</label>
              <input type="number" value={arms || ''} onChange={e => setArms(parseFloat(e.target.value) || undefined)}
                placeholder="Optional"
                className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-dark-text-light focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs text-dark-text mb-1">Thighs (cm)</label>
              <input type="number" value={thighs || ''} onChange={e => setThighs(parseFloat(e.target.value) || undefined)}
                placeholder="Optional"
                className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-dark-text-light focus:outline-none focus:border-primary" />
            </div>
          </div>
          <button onClick={saveMetric} className="w-full py-2.5 rounded-xl gradient-bg text-white font-medium hover:opacity-90 transition-opacity">
            Save Measurements
          </button>
        </div>
      )}

      {/* Charts */}
      {chartData.length > 1 && (
        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-semibold mb-4">Progress Chart</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }} />
                <Legend />
                <Line type="monotone" dataKey="weight" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} name="Weight (kg)" />
                {chartData.some(d => d.bodyFat) && (
                  <Line type="monotone" dataKey="bodyFat" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} name="Body Fat %" />
                )}
                {chartData.some(d => d.waist) && (
                  <Line type="monotone" dataKey="waist" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} name="Waist (cm)" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* History */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-semibold mb-4">Measurement History</h3>
        {bodyMetrics.length === 0 ? (
          <p className="text-dark-text text-center py-8">No measurements recorded yet. Start tracking!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-dark-text text-left border-b border-dark-border">
                  <th className="pb-2 pr-4">Date</th>
                  <th className="pb-2 pr-4">Weight</th>
                  <th className="pb-2 pr-4">Body Fat</th>
                  <th className="pb-2 pr-4">Waist</th>
                  <th className="pb-2 pr-4">Chest</th>
                  <th className="pb-2 pr-4">Arms</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {[...bodyMetrics].reverse().map(m => (
                  <tr key={m.id} className="border-b border-dark-border/50">
                    <td className="py-2 pr-4 text-dark-text">{formatDate(m.date)}</td>
                    <td className="py-2 pr-4 font-medium">{m.weight} kg</td>
                    <td className="py-2 pr-4">{m.bodyFat ? `${m.bodyFat}%` : '—'}</td>
                    <td className="py-2 pr-4">{m.waist ? `${m.waist} cm` : '—'}</td>
                    <td className="py-2 pr-4">{m.chest ? `${m.chest} cm` : '—'}</td>
                    <td className="py-2 pr-4">{m.arms ? `${m.arms} cm` : '—'}</td>
                    <td className="py-2">
                      <button onClick={() => onDeleteMetric(m.id)} className="text-dark-text hover:text-danger">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Affiliate Products - Body Metrics (compact) */}
      <AffiliateProducts
        category="all"
        compact
        maxCount={6}
        title="🏆 Quick Shop"
      />
    </div>
  );
}

import AffiliateProducts from './AffiliateProducts';

function MetricCard({ label, value, change, goalDirection }: {
  label: string; value: string;
  change: { value: string; direction: string } | null;
  goalDirection: 'up' | 'down' | 'same';
}) {
  const isGood = change
    ? (goalDirection === 'down' && change.direction === 'down') ||
      (goalDirection === 'up' && change.direction === 'up') ||
      change.direction === 'same'
    : true;

  return (
    <div className="glass-card rounded-xl p-4">
      <p className="text-xs text-dark-text mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
      {change && (
        <div className={`flex items-center gap-1 text-xs mt-1 ${isGood ? 'text-green-400' : 'text-red-400'}`}>
          {change.direction === 'up' ? <TrendingUp className="w-3 h-3" /> :
           change.direction === 'down' ? <TrendingDown className="w-3 h-3" /> :
           <Minus className="w-3 h-3" />}
          {change.value} {change.direction === 'same' ? 'No change' : change.direction === 'up' ? 'up' : 'down'}
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { AlertTriangle, Award, Droplet, Utensils, Activity, ClipboardCheck } from 'lucide-react';
import { getHealthGoals } from '../api';

const CATEGORY_ICONS = {
  hydration: Droplet,
  diet: Utensils,
  monitoring: ClipboardCheck,
  lifestyle: Activity,
};

const CATEGORY_COLORS = {
  hydration: 'bg-blue-50 border-blue-200 text-blue-900',
  diet: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  monitoring: 'bg-purple-50 border-purple-200 text-purple-900',
  lifestyle: 'bg-amber-50 border-amber-200 text-amber-900',
};

export default function GoalsComponent({ patientId = 'patient_demo_001' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadGoals = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await getHealthGoals(patientId);
        setData(result);
      } catch (err) {
        setError(err.message || 'Unable to load health goals right now.');
      } finally {
        setLoading(false);
      }
    };

    loadGoals();
  }, [patientId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8 bg-white rounded-2xl shadow-lg border border-slate-200">
        <p className="text-slate-600 text-center">Loading your health goals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-8 bg-white rounded-2xl shadow-lg border border-slate-200">
        <div className="flex items-center gap-3 text-red-700">
          <AlertTriangle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-4">
          <Award className="w-8 h-8 text-blue-600" />
          <h2 className="text-3xl font-bold text-slate-900">Health Goals</h2>
        </div>
        {data?.motivational_line && (
          <p className="text-slate-600 text-lg">{data.motivational_line}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {(data?.goals || []).map((goal, idx) => {
          const Icon = CATEGORY_ICONS[goal.category] || Activity;
          const tone = CATEGORY_COLORS[goal.category] || 'bg-slate-50 border-slate-200 text-slate-900';
          return (
            <div key={idx} className={`rounded-2xl border-2 p-6 ${tone}`}>
              <div className="flex items-center gap-3 mb-2">
                <Icon className="w-5 h-5" />
                <h3 className="font-bold text-lg">{goal.title}</h3>
              </div>
              <p className="text-sm leading-relaxed">{goal.description}</p>
            </div>
          );
        })}
      </div>

      {(!data?.goals || data.goals.length === 0) && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center text-slate-500">
          No goals available yet.
        </div>
      )}
    </div>
  );
}

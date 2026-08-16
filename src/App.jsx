import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Upload, Droplet, TrendingDown, Activity, AlertCircle, Check, Calendar, Award } from 'lucide-react';
import ImageUploadComponent from './components/ImageUploadComponent';
import WaterIntakeComponent from './components/WaterIntakeComponent';
import RiskInsightsComponent from './components/RiskInsightsComponent';
import AppointmentsComponent from './components/AppointmentsComponent';
import GoalsComponent from './components/GoalsComponent';
import { getHealthSummary, getRiskInsights, getRiskHistory } from './api';

const PATIENT_ID = 'patient_demo_001';

export default function App() {
  const [stoneComposition, setStoneComposition] = useState('calcium-oxalate');
  const [activeTab, setActiveTab] = useState('dashboard'); // NEW: Tab navigation

  const [healthSummary, setHealthSummary] = useState(null);
  const [riskInsights, setRiskInsights] = useState(null);
  const [riskHistory, setRiskHistory] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadDashboardData = async () => {
      setDashboardLoading(true);
      try {
        const [summary, insights, history] = await Promise.all([
          getHealthSummary(PATIENT_ID),
          getRiskInsights(PATIENT_ID, 90),
          getRiskHistory(PATIENT_ID, 6),
        ]);
        if (cancelled) return;
        setHealthSummary(summary);
        setRiskInsights(insights);
        setRiskHistory(history.history || []);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        if (!cancelled) setDashboardLoading(false);
      }
    };

    loadDashboardData();
    return () => { cancelled = true; };
  }, []);

  const hydration = healthSummary
    ? Math.min(100, Math.round((healthSummary.today_water_intake_ml / healthSummary.water_goal_ml) * 100))
    : 0;
  const riskScore = riskInsights ? Math.round(riskInsights.risk_percentage) : 0;

  const lowOxalateFoods = [
    { name: 'Cauliflower', oxalate: 'Very Low', icon: '🥦', color: 'from-emerald-50 to-teal-50' },
    { name: 'Cucumber', oxalate: 'Low', icon: '🥒', color: 'from-green-50 to-emerald-50' },
    { name: 'White Rice', oxalate: 'Low', icon: '🍚', color: 'from-blue-50 to-cyan-50' },
    { name: 'Chicken Breast', oxalate: 'Very Low', icon: '🍗', color: 'from-slate-50 to-blue-50' },
    { name: 'Apple', oxalate: 'Low', icon: '🍎', color: 'from-red-50 to-pink-50' },
    { name: 'White Bread', oxalate: 'Low', icon: '🍞', color: 'from-amber-50 to-yellow-50' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-0 top-0 h-screen w-72 bg-white border-r border-slate-200/60 shadow-xl shadow-slate-200/50 z-50"
      >
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Droplet className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                RenalCare <span className="text-blue-600">AI</span>
              </h1>
              <p className="text-xs text-slate-500 tracking-wide">Advanced Kidney Care</p>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'dashboard', icon: Activity, label: 'Dashboard', active: true },
              { id: 'scan', icon: Upload, label: 'AI Scan Analysis' },
              { id: 'hydration', icon: Droplet, label: 'Hydration Tracker' },
              { id: 'risk', icon: TrendingDown, label: 'Risk Insights' },
              { id: 'appointments', icon: Calendar, label: 'Appointments' },
              { id: 'goals', icon: Award, label: 'Health Goals' },
            ].map((item, idx) => (
              <motion.button
                key={idx}
                whileHover={{ x: 4, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-200' 
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                <item.icon className="w-5 h-5" strokeWidth={2} />
                <span className="font-medium text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {item.label}
                </span>
              </motion.button>
            ))}
          </nav>

          <div className="absolute bottom-8 left-8 right-8">
            {(() => {
              const level = riskInsights?.risk_level || null;
              const tone = level === 'High'
                ? { bg: 'from-red-50 to-orange-50', border: 'border-red-200', iconBg: 'bg-red-100', icon: 'text-red-600', title: 'text-red-900', text: 'text-red-700' }
                : level === 'Moderate'
                ? { bg: 'from-amber-50 to-yellow-50', border: 'border-amber-200', iconBg: 'bg-amber-100', icon: 'text-amber-600', title: 'text-amber-900', text: 'text-amber-700' }
                : { bg: 'from-emerald-50 to-teal-50', border: 'border-emerald-200', iconBg: 'bg-emerald-100', icon: 'text-emerald-600', title: 'text-emerald-900', text: 'text-emerald-700' };
              const message = level === 'High'
                ? 'Your risk is elevated — check Risk Insights for a recovery plan.'
                : level === 'Moderate'
                ? 'Your kidney health needs regular monitoring. Keep tracking your habits.'
                : level === 'Low'
                ? 'Your kidney health is excellent. Keep up the great work!'
                : 'Loading your current status...';
              return (
                <div className={`bg-gradient-to-br ${tone.bg} border ${tone.border} rounded-2xl p-5`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 ${tone.iconBg} rounded-xl flex items-center justify-center`}>
                      <Check className={`w-5 h-5 ${tone.icon}`} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${tone.title} mb-1`}>{level ? `${level} Risk Status` : 'Risk Status'}</p>
                      <p className={`text-xs ${tone.text} leading-relaxed`}>{message}</p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="ml-72 p-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto space-y-8"
        >
          {/* CONDITIONAL: Show based on active tab */}
          {activeTab !== 'dashboard' && (
            <motion.div variants={itemVariants}>
              {activeTab === 'scan' && <ImageUploadComponent patientId={PATIENT_ID} />}
              {activeTab === 'hydration' && <WaterIntakeComponent patientId={PATIENT_ID} />}
              {activeTab === 'risk' && <RiskInsightsComponent patientId={PATIENT_ID} />}
              {activeTab === 'appointments' && <AppointmentsComponent patientId={PATIENT_ID} />}
              {activeTab === 'goals' && <GoalsComponent patientId={PATIENT_ID} />}
            </motion.div>
          )}

          {/* MAIN DASHBOARD */}
          {activeTab === 'dashboard' && (
            <>
          {/* Header/Hero Section */}
          <motion.div variants={itemVariants} className="mb-12">
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Welcome to RenalCare AI
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-slate-600 text-lg max-w-2xl leading-relaxed"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Your personalized kidney stone prevention system. Track your health metrics, analyze scans, and reduce recurrence risk with AI-powered insights.
            </motion.p>

            {/* Health Status Cards */}
            <div className="grid grid-cols-3 gap-6 mt-8">
              {dashboardLoading ? (
                <div className="col-span-3 text-center text-slate-500 py-8">Loading your health data...</div>
              ) : [
                {
                  label: 'Today\'s Water Intake',
                  value: healthSummary ? `${Math.round(healthSummary.today_water_intake_ml)} ml` : 'N/A',
                  trend: `${hydration}% of goal`,
                  color: hydration >= 80 ? 'emerald' : 'orange',
                },
                { label: 'Hydration Goal', value: `${hydration}%`, trend: hydration >= 80 ? 'On Track' : 'Needs Attention', color: hydration >= 80 ? 'blue' : 'orange' },
                { label: 'Risk Score', value: `${riskScore}%`, trend: riskInsights?.risk_level || 'Unknown', color: riskScore < 40 ? 'green' : riskScore < 70 ? 'orange' : 'red' },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1, duration: 0.6 }}
                  whileHover={{ y: -4, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.1)' }}
                  className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-lg shadow-slate-200/50"
                >
                  <p className="text-slate-500 text-sm font-medium mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {stat.value}
                  </p>
                  <p className={`text-${stat.color}-600 text-sm font-medium`}>{stat.trend}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* AI Scan Upload Section */}
          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-bold text-slate-900 mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
              AI Scan Analysis
            </h3>
            <div className="grid grid-cols-2 gap-6 items-start">
              <ImageUploadComponent patientId={PATIENT_ID} />

              {/* Latest Real Scan Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-lg shadow-slate-200/50"
              >
                <h4 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Latest Scan on Record
                </h4>

                {healthSummary?.latest_scan ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                      <span className="text-slate-600 font-medium text-sm">Stone Size</span>
                      <span className="text-slate-900 font-bold text-lg">
                        {healthSummary.latest_scan.stone_size_mm?.toFixed(2)} mm
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                      <span className="text-slate-600 font-medium text-sm">Location</span>
                      <span className="text-slate-900 font-bold">{healthSummary.latest_scan.stone_location}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                      <span className="text-slate-600 font-medium text-sm">Severity</span>
                      <span className="text-slate-900 font-bold capitalize">{healthSummary.latest_scan.severity}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                      <span className="text-emerald-700 font-medium text-sm">Confidence</span>
                      <span className="text-emerald-900 font-bold">
                        {((healthSummary.latest_scan.confidence || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm text-center py-8">
                    No scans uploaded yet. Analyze a scan to see results here.
                  </p>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* Dietary & Hydration Engine */}
          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-bold text-slate-900 mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Dietary & Hydration Engine
            </h3>
            
            <div className="grid grid-cols-3 gap-6">
              {/* Stone Composition Selector */}
              <div className="col-span-2 space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-lg shadow-slate-200/50">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Stone Composition Type
                  </label>
                  <select
                    value={stoneComposition}
                    onChange={(e) => setStoneComposition(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="calcium-oxalate">Calcium Oxalate</option>
                    <option value="uric-acid">Uric Acid</option>
                    <option value="struvite">Struvite</option>
                    <option value="cystine">Cystine</option>
                  </select>
                </div>

                {/* Meal Cards Grid */}
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">Recommended Low-Oxalate Foods</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {lowOxalateFoods.map((food, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + idx * 0.1, duration: 0.4 }}
                        whileHover={{ y: -6, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.15)' }}
                        className={`bg-gradient-to-br ${food.color} rounded-2xl p-6 border border-slate-200/40 cursor-pointer`}
                      >
                        <div className="text-4xl mb-3">{food.icon}</div>
                        <h5 className="font-bold text-slate-900 mb-1">{food.name}</h5>
                        <p className="text-xs text-slate-600 font-medium">{food.oxalate} Oxalate</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hydration Tracker */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-lg shadow-slate-200/50 flex flex-col items-center">
                <h4 className="text-lg font-semibold text-slate-900 mb-6 self-start">Daily Hydration</h4>
                
                {/* Water Bottle Visualization */}
                <div className="relative w-24 h-72 bg-slate-100 rounded-t-3xl rounded-b-2xl border-4 border-slate-300 overflow-hidden mb-6">
                  {/* Water fill */}
                  <motion.div
                    initial={{ height: '0%' }}
                    animate={{ height: `${hydration}%` }}
                    transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-400 to-blue-400 opacity-80"
                  >
                    {/* Water wave effect */}
                    <div className="absolute top-0 left-0 right-0 h-3 bg-blue-300 opacity-50 rounded-full" 
                         style={{ animation: 'wave 3s ease-in-out infinite' }}></div>
                  </motion.div>
                  
                  {/* Bottle cap */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-blue-600 rounded-t-lg border-4 border-slate-300"></div>
                  
                  {/* Measurement lines */}
                  {[25, 50, 75].map((mark) => (
                    <div key={mark} className="absolute left-0 right-0 flex items-center" style={{ bottom: `${mark}%` }}>
                      <div className="h-px bg-slate-300 flex-1"></div>
                      <span className="text-xs text-slate-400 ml-2">{mark}%</span>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <p className="text-4xl font-bold text-blue-600 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {hydration}%
                  </p>
                  <p className="text-sm text-slate-600 mb-4">2.4L / 3.0L Goal</p>
                  <button className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-blue-200 transition-all">
                    Log Water Intake
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Predictive Risk Dashboard */}
          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-bold text-slate-900 mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Predictive Risk Dashboard
            </h3>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Circular Risk Gauge */}
              <div className="bg-white rounded-2xl p-10 border border-slate-200/60 shadow-lg shadow-slate-200/50 flex flex-col items-center justify-center">
                <h4 className="text-lg font-semibold text-slate-900 mb-8">Recurrence Risk Score</h4>
                
                {/* SVG Circular Progress */}
                <div className="relative w-64 h-64">
                  <svg className="transform -rotate-90 w-full h-full">
                    {/* Background circle */}
                    <circle
                      cx="128"
                      cy="128"
                      r="110"
                      stroke="#e2e8f0"
                      strokeWidth="16"
                      fill="none"
                    />
                    {/* Progress circle */}
                    <motion.circle
                      cx="128"
                      cy="128"
                      r="110"
                      stroke="url(#greenGradient)"
                      strokeWidth="16"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "691.15 691.15", strokeDashoffset: 691.15 }}
                      animate={{ strokeDashoffset: 691.15 - (691.15 * riskScore / 100) }}
                      transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
                    />
                    <defs>
                      <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#14b8a6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.p 
                      className="text-6xl font-bold text-emerald-600 mb-2"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {riskScore}%
                    </motion.p>
                    <p className="text-sm text-slate-600 font-medium">{riskInsights?.risk_level || 'Unknown'} Risk</p>
                  </div>
                </div>

                <p className="text-slate-500 text-sm text-center mt-6 max-w-xs">
                  Based on your hydration, diet compliance, and medical history
                </p>
              </div>

              {/* Risk Trend Chart */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-lg shadow-slate-200/50">
                <h4 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                  Risk Trend
                  <TrendingDown className="w-5 h-5 text-emerald-600" />
                </h4>

                {riskHistory.length > 0 ? (
                  <>
                    <div className="relative h-64 flex items-end justify-between gap-2 px-4">
                      {riskHistory.map((point, idx) => (
                        <div key={point.month} className="flex-1 flex flex-col items-center gap-2">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(4, 100 - point.risk_percentage)}%` }}
                            transition={{ delay: 0.5 + idx * 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            className="w-full bg-gradient-to-t from-emerald-400 to-teal-400 rounded-t-xl relative"
                            style={{ maxHeight: '100%' }}
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-bold text-slate-700">
                              {point.risk_percentage}%
                            </div>
                          </motion.div>
                          <span className="text-xs text-slate-500 font-medium">{point.month}</span>
                        </div>
                      ))}
                    </div>

                    {riskHistory.length > 1 && (
                      <div className="mt-8 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                        <p className="text-sm text-emerald-800">
                          {riskHistory[riskHistory.length - 1].risk_percentage <= riskHistory[0].risk_percentage ? (
                            <>
                              <span className="font-bold">
                                ↓ {(riskHistory[0].risk_percentage - riskHistory[riskHistory.length - 1].risk_percentage).toFixed(1)}%
                                {' '}reduction
                              </span> in recurrence risk since tracking began.
                            </>
                          ) : (
                            <>
                              <span className="font-bold">
                                ↑ {(riskHistory[riskHistory.length - 1].risk_percentage - riskHistory[0].risk_percentage).toFixed(1)}%
                                {' '}increase
                              </span> in recurrence risk since tracking began — review your hydration and diet compliance.
                            </>
                          )}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-slate-500 text-sm text-center py-12">
                    Risk trend data starts accumulating from your first month using RenalCare AI.
                    Check back next month to see your progress.
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Footer Info */}
          <motion.div 
            variants={itemVariants}
            className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl p-8 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xl font-bold mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Need Medical Advice?
                </h4>
                <p className="text-blue-200 text-sm">
                  Schedule a consultation with our kidney specialists for personalized care.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('appointments')}
                className="px-8 py-3.5 bg-white text-blue-900 rounded-xl font-semibold hover:shadow-2xl hover:shadow-white/20 transition-all"
              >
                Book Appointment
              </button>
            </div>
          </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
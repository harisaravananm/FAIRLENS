"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { Upload, BarChart3, AlertTriangle, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [targetVar, setTargetVar] = useState('');
  const [sensitiveAttr, setSensitiveAttr] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [debiasing, setDebiasing] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      try {
        const res = await axios.post(`${API_URL}/api/upload`, formData);
        setColumns(res.data.columns);
      } catch (err) {
        console.error('Error uploading file', err);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!targetVar || !sensitiveAttr) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append('target_variable', targetVar);
    formData.append('sensitive_attribute', sensitiveAttr);
    
    try {
      const res = await axios.post(`${API_URL}/api/analyze`, formData);
      setAnalysis(res.data);
    } catch (err) {
      console.error('Error analyzing', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDebias = async (method: string) => {
    setDebiasing(true);
    const formData = new FormData();
    formData.append('method', method);
    
    try {
      const res = await axios.post(`${API_URL}/api/debias`, formData);
      setAnalysis({
        ...analysis,
        metrics: res.data.new_metrics
      });
      alert(res.data.message);
    } catch (err) {
      console.error('Error debiasing', err);
    } finally {
      setDebiasing(false);
    }
  };

  const getChartData = () => {
    if (!analysis?.metrics?.groups) return [];
    return Object.keys(analysis.metrics.groups).map(key => ({
      name: key,
      approvalRate: analysis.metrics.groups[key].approval_rate * 100
    }));
  };

  return (
    <main className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-indigo-600 tracking-tight">FairLens</h1>
            <p className="text-slate-500 mt-1">Unbiased AI Auditing Platform</p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition">
              <FileText size={18} /> Documentation
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Input Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Upload size={20} className="text-indigo-500" />
                Upload Dataset
              </h2>
              
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition cursor-pointer relative">
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-2">
                  <Upload size={32} className="text-slate-400" />
                  <p className="font-medium text-slate-600">
                    {file ? file.name : "Drag & drop CSV or click to browse"}
                  </p>
                </div>
              </div>

              {columns.length > 0 && (
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Target Variable</label>
                    <select 
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={targetVar}
                      onChange={(e) => setTargetVar(e.target.value)}
                    >
                      <option value="">Select Target...</option>
                      {columns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Sensitive Attribute</label>
                    <select 
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={sensitiveAttr}
                      onChange={(e) => setSensitiveAttr(e.target.value)}
                    >
                      <option value="">Select Sensitive Attribute...</option>
                      {columns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  
                  <button 
                    onClick={handleAnalyze}
                    disabled={!targetVar || !sensitiveAttr || loading}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {loading ? "Analyzing..." : "Run Bias Audit"} <ArrowRight size={18} />
                  </button>
                </div>
              )}
            </div>
            
            {analysis && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-semibold mb-4">Debiasing Options</h2>
                <div className="space-y-3">
                  {['Reweighting', 'Resampling', 'Adversarial'].map(method => (
                    <button 
                      key={method}
                      onClick={() => handleDebias(method)}
                      disabled={debiasing}
                      className="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition flex justify-between items-center"
                    >
                      <span className="font-medium text-slate-700">{method}</span>
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 py-1 rounded">Apply</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Results Dashboard */}
          <div className="lg:col-span-2">
            {analysis ? (
              <div className="space-y-6">
                {/* Status Card */}
                <div className={`p-6 rounded-2xl border ${analysis.metrics.bias_detected ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${analysis.metrics.bias_detected ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {analysis.metrics.bias_detected ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${analysis.metrics.bias_detected ? 'text-amber-800' : 'text-emerald-800'}`}>
                        {analysis.metrics.bias_detected ? "Bias Detected" : "Fairness Confirmed"}
                      </h3>
                      <p className={`mt-1 ${analysis.metrics.bias_detected ? 'text-amber-700' : 'text-emerald-700'}`}>
                        {analysis.explanation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Demographic Parity Diff", val: analysis.metrics.demographic_parity_difference },
                    { label: "Equalized Odds Diff", val: analysis.metrics.equalized_odds_difference },
                    { label: "Disparate Impact Ratio", val: analysis.metrics.disparate_impact_ratio }
                  ].map((m, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                      <p className="text-sm font-medium text-slate-500">{m.label}</p>
                      <p className="text-2xl font-bold text-slate-800 mt-2">{m.val.toFixed(3)}</p>
                    </div>
                  ))}
                </div>

                {/* Chart Area */}
                {analysis.metrics.groups && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                      <BarChart3 className="text-indigo-500" />
                      Approval Rates by Group
                    </h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getChartData()}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} unit="%" />
                          <Tooltip 
                            cursor={{fill: '#f8fafc'}}
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                          />
                          <Bar dataKey="approvalRate" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center p-12 text-center text-slate-500">
                <BarChart3 size={48} className="text-slate-300 mb-4" />
                <h3 className="text-xl font-medium text-slate-700">Awaiting Dataset</h3>
                <p className="mt-2 max-w-md">Upload a CSV dataset and select your variables to generate a comprehensive AI fairness audit.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

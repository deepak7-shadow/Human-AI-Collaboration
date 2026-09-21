import React from 'react';
import type { SensorReading } from '../types';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Thermometer, Zap, Gauge, Radio, Scale } from 'lucide-react';

interface SensorTelemetryPanelProps {
  data: SensorReading[];
}

export const SensorTelemetryPanel: React.FC<SensorTelemetryPanelProps> = ({ data }) => {
  const latest = data[data.length - 1] || {
    vibration_rms: 1.85,
    vibration_peak: 2.45,
    temperature: 48.2,
    motor_current: 42.1,
    rotational_speed: 1782.0,
    pressure: 5.2,
    load_pct: 74.5,
  };

  // Sparkline chart data formatted
  const chartData = data.slice(-25).map((d, i) => ({
    time: i,
    vib: d.vibration_rms,
    temp: d.temperature,
    curr: d.motor_current,
    speed: d.rotational_speed,
    press: d.pressure,
    load: d.load_pct,
  }));

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <h2 className="text-sm font-bold text-white tracking-wide uppercase m-0">
            Real-Time Multi-Sensor Telemetry
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Nominal
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> Advisory
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Alarm Threshold
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Sensor 1: Vibration RMS */}
        <div className={`p-3 rounded-lg border transition-all ${
          latest.vibration_rms > 4.5
            ? 'bg-rose-950/20 border-rose-500/50 shadow-lg shadow-rose-900/20'
            : latest.vibration_rms > 2.8
            ? 'bg-amber-950/20 border-amber-500/40'
            : 'bg-slate-800/40 border-slate-700/60'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1 font-medium">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> Vibration RMS
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              latest.vibration_rms > 4.5 ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-700/50 text-slate-300'
            }`}>ISO Zone {latest.vibration_rms > 4.5 ? 'C/D' : 'A/B'}</span>
          </div>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xl font-mono font-bold text-white tracking-tight">
              {latest.vibration_rms.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 font-mono">mm/s</span>
          </div>
          <div className="h-10 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <Area type="monotone" dataKey="vib" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={1.5} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
            <span>Peak: {latest.vibration_peak?.toFixed(2) || '2.4'}g</span>
            <span>Limit: 4.50</span>
          </div>
        </div>

        {/* Sensor 2: Temperature */}
        <div className={`p-3 rounded-lg border transition-all ${
          latest.temperature > 75.0
            ? 'bg-rose-950/20 border-rose-500/50 shadow-lg shadow-rose-900/20'
            : latest.temperature > 60.0
            ? 'bg-amber-950/20 border-amber-500/40'
            : 'bg-slate-800/40 border-slate-700/60'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1 font-medium">
              <Thermometer className="w-3.5 h-3.5 text-rose-400" /> Temperature
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              latest.temperature > 75 ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-700/50 text-slate-300'
            }`}>{latest.temperature > 75 ? 'OVERHEAT' : 'NOMINAL'}</span>
          </div>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xl font-mono font-bold text-white tracking-tight">
              {latest.temperature.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-mono">°C</span>
          </div>
          <div className="h-10 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <Area type="monotone" dataKey="temp" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.2} strokeWidth={1.5} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
            <span>Stator Casing</span>
            <span>Trip: 85.0°C</span>
          </div>
        </div>

        {/* Sensor 3: Motor Current */}
        <div className={`p-3 rounded-lg border transition-all ${
          latest.motor_current > 52.0
            ? 'bg-rose-950/20 border-rose-500/50 shadow-lg shadow-rose-900/20'
            : latest.motor_current > 46.0
            ? 'bg-amber-950/20 border-amber-500/40'
            : 'bg-slate-800/40 border-slate-700/60'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1 font-medium">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Motor Current
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-300">Phase A</span>
          </div>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xl font-mono font-bold text-white tracking-tight">
              {latest.motor_current.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-mono">Amps</span>
          </div>
          <div className="h-10 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <Area type="monotone" dataKey="curr" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} strokeWidth={1.5} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
            <span>FLA: 42.0 A</span>
            <span>Max: 56.0 A</span>
          </div>
        </div>

        {/* Sensor 4: Rotational Speed */}
        <div className="p-3 rounded-lg border border-slate-700/60 bg-slate-800/40">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1 font-medium">
              <Gauge className="w-3.5 h-3.5 text-indigo-400" /> Speed (Tach)
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-300">RPM</span>
          </div>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xl font-mono font-bold text-white tracking-tight">
              {latest.rotational_speed.toFixed(0)}
            </span>
            <span className="text-xs text-slate-400 font-mono">RPM</span>
          </div>
          <div className="h-10 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <Area type="monotone" dataKey="speed" stroke="#818cf8" fill="#818cf8" fillOpacity={0.2} strokeWidth={1.5} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
            <span>Sync: 1800</span>
            <span>Slip: 1.0%</span>
          </div>
        </div>

        {/* Sensor 5: Discharge Pressure */}
        <div className="p-3 rounded-lg border border-slate-700/60 bg-slate-800/40">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1 font-medium">
              <Radio className="w-3.5 h-3.5 text-teal-400" /> Discharge Press
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-300">Bar</span>
          </div>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xl font-mono font-bold text-white tracking-tight">
              {latest.pressure.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 font-mono">bar</span>
          </div>
          <div className="h-10 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <Area type="monotone" dataKey="press" stroke="#2dd4bf" fill="#2dd4bf" fillOpacity={0.2} strokeWidth={1.5} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
            <span>Nominal: 5.2</span>
            <span>ΔP: ±0.3</span>
          </div>
        </div>

        {/* Sensor 6: Operating Load */}
        <div className="p-3 rounded-lg border border-slate-700/60 bg-slate-800/40">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1 font-medium">
              <Scale className="w-3.5 h-3.5 text-purple-400" /> Operating Load
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-300">%</span>
          </div>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xl font-mono font-bold text-white tracking-tight">
              {latest.load_pct.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-mono">%</span>
          </div>
          <div className="h-10 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <Area type="monotone" dataKey="load" stroke="#c084fc" fill="#c084fc" fillOpacity={0.2} strokeWidth={1.5} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
            <span>Rated: 75.0%</span>
            <span>Capacity</span>
          </div>
        </div>
      </div>
    </div>
  );
};

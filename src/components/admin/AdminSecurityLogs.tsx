import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SuspiciousEvent } from '../../types';
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  Radio,
  Trash2,
  Filter,
  Eye,
  Lock,
  CheckCircle2,
} from 'lucide-react';

export const AdminSecurityLogs: React.FC = () => {
  const { suspiciousEvents, clearSuspiciousEvents, examSessions } = useApp();

  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');

  const filteredEvents = suspiciousEvents.filter((e) => {
    return severityFilter === 'all' || e.severity === severityFilter;
  });

  const getSeverityBadge = (severity: SuspiciousEvent['severity']) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
            CRITICAL
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
            HIGH
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
            INFO
          </span>
        );
    }
  };

  const getTypeLabel = (type: SuspiciousEvent['type']) => {
    switch (type) {
      case 'fullscreen_exit':
        return 'Keluar Layar Penuh (Fullscreen Exit)';
      case 'tab_switched':
        return 'Berpindah Tab Browser';
      case 'window_blur':
        return 'Window Blur / Fokus Hilang';
      case 'face_lost':
        return 'Wajah Tidak Terdeteksi di Kamera';
      case 'multiple_faces':
        return 'Terdeteksi Lebih dari 1 Wajah';
      case 'devtools_attempt':
        return 'Mencoba Buka DevTools / Inspect';
      case 'copy_paste_attempt':
        return 'Mencoba Salin / Tempel Jawaban';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            Pengawasan Real-Time & Log Aktivitas Mencurigakan
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Sistem notifikasi otomatis mendeteksi kecurangan saat ujian CBT berlangsung di SMP IT Sindangprabu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 text-xs font-mono">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>RADAR AKTIF</span>
          </div>

          <button
            type="button"
            onClick={clearSuspiciousEvents}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Bersihkan Log
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-lg border border-slate-800">
        <Filter className="w-3.5 h-3.5 text-slate-500 ml-2" />
        <span className="text-xs text-slate-400 mr-2">Tingkat Bahaya:</span>
        <button
          onClick={() => setSeverityFilter('all')}
          className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
            severityFilter === 'all'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Semua ({suspiciousEvents.length})
        </button>
        <button
          onClick={() => setSeverityFilter('critical')}
          className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
            severityFilter === 'critical'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-rose-400 hover:text-rose-300'
          }`}
        >
          Critical ({suspiciousEvents.filter((e) => e.severity === 'critical').length})
        </button>
        <button
          onClick={() => setSeverityFilter('high')}
          className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
            severityFilter === 'high'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-amber-400 hover:text-amber-300'
          }`}
        >
          High ({suspiciousEvents.filter((e) => e.severity === 'high').length})
        </button>
      </div>

      {/* Events Feed List */}
      <div className="space-y-2.5">
        {filteredEvents.length === 0 ? (
          <div className="p-8 rounded-xl border border-slate-800 bg-slate-900 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-200">
              Tidak Ada Aktivitas Mencurigakan
            </p>
            <p className="text-xs text-slate-500">
              Semua peserta ujian terpantau mematuhi protokol keamanan lockdown CBT.
            </p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    event.severity === 'critical'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : event.severity === 'high'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white">
                      {event.studentName}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs text-slate-400 font-medium">
                      {event.examTitle}
                    </span>
                    <span className="text-slate-600">·</span>
                    {getSeverityBadge(event.severity)}
                  </div>

                  <p className="text-xs text-slate-300 font-medium">
                    {getTypeLabel(event.type)}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {event.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center sm:flex-col sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800 text-[11px] text-slate-500 font-mono">
                <span>{event.timestamp} WIB</span>
                <span className="text-rose-400/80 font-sans font-semibold">
                  Notifikasi Otomatis
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

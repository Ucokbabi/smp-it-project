import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Eye,
  ShieldAlert,
  Radio,
  Clock,
  UserCheck,
  AlertTriangle,
  Lock,
} from 'lucide-react';

export const GuruLiveMonitor: React.FC = () => {
  const { exams, examSessions, suspiciousEvents, currentUser } = useApp();

  const [selectedExamId, setSelectedExamId] = useState<string>(() => exams[0]?.id || '');

  const teacherExams = exams.filter((e) => e.teacherId === currentUser?.id || true);
  const activeExam = exams.find((e) => e.id === selectedExamId) || teacherExams[0];

  const sessionsForExam = examSessions.filter((s) => s.examId === activeExam?.id);
  const alertsForExam = suspiciousEvents.filter((a) => a.examId === activeExam?.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Eye className="w-6 h-6 text-emerald-400" />
            Monitoring Ujian Real-Time & Deteksi Kecurangan
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pantau status pengerjaan siswa, waktu tersisa, dan alarm otomatis aktivitas mencurigakan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Pilih Ujian:</label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 font-semibold focus:outline-none focus:border-emerald-500"
          >
            {teacherExams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title} ({e.classGrade})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Exam Status Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
          <div>
            <h3 className="text-sm font-bold text-white">
              {activeExam?.title}
            </h3>
            <p className="text-xs text-slate-400">
              Token: <span className="text-emerald-400 font-mono font-bold">{activeExam?.token}</span> · Durasi: {activeExam?.durationMinutes} Menit · Toleransi: Max {activeExam?.maxViolationsAllowed} Pelanggaran
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-center">
            <span className="block text-[10px] text-slate-500 uppercase">Siswa Terhubung</span>
            <span className="text-sm font-bold text-white">{sessionsForExam.length}</span>
          </div>
          <div className="text-center">
            <span className="block text-[10px] text-slate-500 uppercase">Pelanggaran Terdeteksi</span>
            <span className="text-sm font-bold text-rose-400">{alertsForExam.length}</span>
          </div>
        </div>
      </div>

      {/* Grid: Student Live Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessionsForExam.length === 0 ? (
          <div className="col-span-full p-8 rounded-xl border border-slate-800 bg-slate-900 text-center space-y-2">
            <Radio className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
            <p className="text-xs font-semibold text-slate-300">
              Menunggu Siswa Masuk ke Ruang Ujian SISPENA
            </p>
            <p className="text-[11px] text-slate-500">
              Bagikan token <strong className="text-emerald-400 font-mono">{activeExam?.token}</strong> kepada siswa untuk memulai ujian terenkripsi.
            </p>
          </div>
        ) : (
          sessionsForExam.map((session) => {
            const hasViolations = session.violationCount > 0;
            const isLocked = session.status === 'locked_cheating';
            return (
              <div
                key={session.id}
                className={`p-4 rounded-xl border transition-all space-y-3 ${
                  isLocked
                    ? 'bg-rose-950/20 border-rose-600/80 shadow-rose-950/50 shadow-lg'
                    : hasViolations
                    ? 'bg-amber-950/20 border-amber-600/60'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate max-w-[160px]">
                    {session.studentName}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      isLocked
                        ? 'bg-rose-600 text-white animate-pulse'
                        : session.status === 'submitted'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {isLocked ? 'TERKUNCI CURANG' : session.status}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1">
                  <p>NISN: <span className="font-mono text-slate-200">{session.studentNisn}</span></p>
                  <p>Progres Jawaban: <span className="text-emerald-400 font-bold">{Object.keys(session.answers).length} / {activeExam?.totalQuestions || 5}</span></p>
                  <p>
                    Pelanggaran Keamanan:
                    <span className={`ml-1 font-mono font-bold ${session.violationCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                      {session.violationCount}x Strike
                    </span>
                  </p>
                </div>

                {isLocked && (
                  <div className="p-2 rounded bg-rose-950/60 border border-rose-700/60 text-[11px] text-rose-200 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Layar terkunci otomatis karena melebihi batas pelanggaran!</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Live Alert Feed for this Exam */}
      {alertsForExam.length > 0 && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Notifikasi Pelanggaran Langsung (Ujian Ini)
          </h3>
          <div className="space-y-2">
            {alertsForExam.map((a) => (
              <div
                key={a.id}
                className="p-3 rounded-lg bg-slate-950 border border-rose-900/50 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  <span className="font-bold text-white">{a.studentName}:</span>
                  <span className="text-slate-300">{a.description}</span>
                </div>
                <span className="font-mono text-slate-500 text-[11px]">
                  {a.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

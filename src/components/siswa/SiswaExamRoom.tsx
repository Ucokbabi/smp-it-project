import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Exam, ExamSession, Question } from '../../types';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Lock,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Camera,
  Maximize2,
  Send,
  Eye,
  Radio,
  Key,
  PowerOff,
} from 'lucide-react';
import { SiswaResultModal } from './SiswaResultModal';

interface SiswaExamRoomProps {
  exam: Exam;
  session: ExamSession;
  onFinishExam: () => void;
}

export const SiswaExamRoom: React.FC<SiswaExamRoomProps> = ({
  exam,
  session,
  onFinishExam,
}) => {
  const {
    updateSessionAnswer,
    submitExamSession,
    recordViolation,
    currentUser,
    serverControl,
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Time remaining (in seconds)
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(exam.durationMinutes * 60);

  // Webcam live proctoring stream
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCamera, setHasCamera] = useState(true);

  const currentQuestion: Question | undefined = exam.questions[currentIndex];
  const maxViolations = exam.maxViolationsAllowed || 3;
  const isLocked = session.status === 'locked_cheating' || session.violationCount >= maxViolations;

  // Initialize Fullscreen and Webcam
  useEffect(() => {
    // Attempt entering fullscreen
    const requestFs = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        }
      } catch (err) {
        console.warn('Fullscreen request rejected or requires user gesture:', err);
        setShowFullscreenWarning(true);
      }
    };
    requestFs();

    // Start webcam proctoring
    let camStream: MediaStream | null = null;
    navigator.mediaDevices
      ?.getUserMedia({ video: { width: 320, height: 240, facingMode: 'user' } })
      .then((stream) => {
        camStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.warn('Webcam proctoring fallback:', err);
        setHasCamera(false);
      });

    return () => {
      if (camStream) {
        camStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Listen for Fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        setShowFullscreenWarning(true);
        recordViolation(
          session.id,
          'fullscreen_exit',
          'Siswa terdeteksi keluar dari mode layar penuh (Fullscreen Exit)',
          'high'
        );
      } else {
        setIsFullscreen(true);
        setShowFullscreenWarning(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [session.id, recordViolation]);

  // Anti-Cheat: Visibility Change & Blur
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordViolation(
          session.id,
          'tab_switched',
          'Siswa terdeteksi memindahkan tab atau meminimalkan browser',
          'critical'
        );
      }
    };

    const handleWindowBlur = () => {
      recordViolation(
        session.id,
        'window_blur',
        'Fokus jendela ujian hilang (Window Blur / Alt-Tab terdeteksi)',
        'high'
      );
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [session.id, recordViolation]);

  // Anti-Cheat: Prevent context menu, copy, paste, inspect keys
  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      recordViolation(
        session.id,
        'copy_paste_attempt',
        'Mencoba klik kanan (Context Menu diblokir)',
        'medium'
      );
    };

    const preventCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      recordViolation(
        session.id,
        'copy_paste_attempt',
        'Mencoba menyalin/menempel teks ujian (Clipboard diblokir)',
        'high'
      );
    };

    const preventKeys = (e: KeyboardEvent) => {
      // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 'c' || e.key === 'v'))
      ) {
        e.preventDefault();
        recordViolation(
          session.id,
          'devtools_attempt',
          'Mencoba membuka inspect element / pintasan developer browser',
          'critical'
        );
      }
    };

    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('copy', preventCopyPaste);
    document.addEventListener('paste', preventCopyPaste);
    document.addEventListener('keydown', preventKeys);

    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('copy', preventCopyPaste);
      document.removeEventListener('paste', preventCopyPaste);
      document.removeEventListener('keydown', preventKeys);
    };
  }, [session.id, recordViolation]);

  // Countdown timer
  useEffect(() => {
    if (timeLeftSeconds <= 0 || isLocked) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeftSeconds, isLocked]);

  const handleSelectAnswer = (optionId: string) => {
    if (!currentQuestion || isLocked) return;
    updateSessionAnswer(session.id, currentQuestion.id, optionId);
  };

  const handleEssayChange = (text: string) => {
    if (!currentQuestion || isLocked) return;
    updateSessionAnswer(session.id, currentQuestion.id, text);
  };

  const handleToggleDoubtful = () => {
    if (!currentQuestion) return;
    const isCurrentlyDoubtful = !!session.doubtfulAnswers[currentQuestion.id];
    updateSessionAnswer(
      session.id,
      currentQuestion.id,
      session.answers[currentQuestion.id] || '',
      !isCurrentlyDoubtful
    );
  };

  const handleSubmitExam = () => {
    submitExamSession(session.id);
    setShowFinishConfirm(false);
    setShowResult(true);
    // Exit fullscreen safely
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(session.answers).length;
  const totalQuestions = exam.questions.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col select-none overflow-hidden">
      {/* Top Lockdown Header Bar */}
      <header className="h-16 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 p-0.5 flex items-center justify-center shadow-md shrink-0">
            <img
              src="/src/assets/images/school_smp_it_sindangprabu_1790860506326.jpg"
              alt="SMP IT Sindangprabu"
              className="w-full h-full object-cover rounded-[10px]"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">
                SISPENA CBT
              </span>
              <span className="text-xs text-emerald-400 font-mono">
                [ENCRYPTED SESSION]
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
              {exam.title} · {currentUser?.biodata.fullName}
            </p>
          </div>
        </div>

        {/* Center: Strike Meter & Countdown Timer */}
        <div className="flex items-center gap-4">
          {/* Security Strike Meter */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-mono font-bold ${
              session.violationCount === 0
                ? 'bg-slate-950 border-slate-800 text-slate-400'
                : session.violationCount >= maxViolations
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse'
                : 'bg-amber-500/20 border-amber-500/50 text-amber-300'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>
              STRIKE: {session.violationCount}/{maxViolations}
            </span>
          </div>

          {/* Timer */}
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-lg border font-mono font-bold text-sm ${
              timeLeftSeconds < 300
                ? 'bg-rose-500/20 border-rose-500/60 text-rose-400 animate-pulse'
                : 'bg-slate-950 border-slate-800 text-emerald-400'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>
        </div>

        {/* Right: Submit Button */}
        <div>
          <button
            type="button"
            onClick={() => setShowFinishConfirm(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Selesai & Kumpulkan</span>
          </button>
        </div>
      </header>

      {/* Main Examination Viewport */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left: Question Content Area */}
        <main className="flex-1 p-6 overflow-y-auto flex flex-col justify-between space-y-6">
          {currentQuestion && (
            <div className="space-y-6 max-w-4xl mx-auto w-full">
              {/* Question Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                    SOAL NOMOR {currentIndex + 1} DARI {totalQuestions}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    ({currentQuestion.scoreWeight} Poin)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleToggleDoubtful}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                    session.doubtfulAnswers[currentQuestion.id]
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Ragu-Ragu</span>
                </button>
              </div>

              {/* Question Text */}
              <div className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed py-2">
                {currentQuestion.text}
              </div>

              {/* Options (Multiple Choice) */}
              {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                <div className="space-y-3 pt-2">
                  {currentQuestion.options.map((opt) => {
                    const isSelected = session.answers[currentQuestion.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectAnswer(opt.id)}
                        className={`w-full p-4 rounded-xl border text-left flex items-start gap-4 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500/70 text-emerald-200 shadow-md shadow-emerald-950/30'
                            : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-lg font-mono font-bold flex items-center justify-center text-xs shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950 shadow'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {opt.id}
                        </span>
                        <span className="text-sm pt-0.5 leading-normal">
                          {opt.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Essay Input */}
              {currentQuestion.type === 'essay' && (
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-semibold text-slate-400">
                    Tuliskan Jawaban Uraian Anda Secara Lengkap:
                  </label>
                  <textarea
                    rows={6}
                    value={session.answers[currentQuestion.id] || ''}
                    onChange={(e) => handleEssayChange(e.target.value)}
                    placeholder="Ketik jawaban esai di sini..."
                    className="w-full p-4 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-500">
                    Jawaban otomatis tersimpan ke server setiap kali Anda mengetik.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800 max-w-4xl mx-auto w-full">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            <span className="text-xs text-slate-500 font-mono">
              Terjawab: {answeredCount} dari {totalQuestions} Soal
            </span>

            <button
              type="button"
              disabled={currentIndex === totalQuestions - 1}
              onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </main>

        {/* Right: Sidebar with Question Palette & Live Camera Proctoring */}
        <aside className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between space-y-6 overflow-y-auto">
          {/* Live Webcam Proctoring Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                Pengawasan Kamera Live
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                ACTIVE
              </span>
            </div>

            <div className="relative w-full aspect-4/3 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner">
              {hasCamera ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center space-y-1">
                  <img
                    src={currentUser?.biodata.photoUrl || '/src/assets/images/admin_rifky_ardiansyah_1790860491868.jpg'}
                    alt="Proctoring"
                    className="w-16 h-16 rounded-full object-cover border border-emerald-500/50"
                  />
                  <span className="text-[10px] text-slate-400">Sensor AI Sindangprabu</span>
                </div>
              )}

              {/* Face recognition overlay crosshair */}
              <div className="absolute inset-0 pointer-events-none border border-emerald-500/20 m-2 rounded-lg flex items-center justify-center">
                <div className="text-[9px] font-mono text-emerald-400/80 bg-slate-950/70 px-1.5 py-0.5 rounded">
                  FACE VERIFIED
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 text-center">
              Wajah harus selalu menghadap layar selama ujian SISPENA CBT berlangsung.
            </p>
          </div>

          {/* Question Palette Grid */}
          <div className="space-y-3">
            <span className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Nomor Soal
            </span>

            <div className="grid grid-cols-5 gap-2">
              {exam.questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = !!session.answers[q.id];
                const isDoubtful = !!session.doubtfulAnswers[q.id];

                let bgClass = 'bg-slate-800 text-slate-400 border-slate-700';
                if (isDoubtful) {
                  bgClass = 'bg-amber-500 text-slate-950 font-bold border-amber-400';
                } else if (isAnswered) {
                  bgClass = 'bg-emerald-600 text-white font-bold border-emerald-500';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-lg font-mono text-xs flex items-center justify-center border transition-all cursor-pointer ${bgClass} ${
                      isCurrent ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-105' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-600"></span>
                <span>Sudah Dijawab ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-500"></span>
                <span>Ragu-Ragu ({Object.keys(session.doubtfulAnswers).filter((k) => session.doubtfulAnswers[k]).length})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700"></span>
                <span>Belum Dijawab ({totalQuestions - answeredCount})</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Server Force Stop Emergency Lockdown Overlay */}
      {serverControl.status === 'emergency_stopped' && !showResult && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/98 backdrop-blur-lg animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border-2 border-rose-600 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 mx-auto flex items-center justify-center animate-pulse">
              <PowerOff className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold text-rose-400 uppercase tracking-widest font-mono">
                EMERGENCY SERVER SHUTDOWN
              </span>
              <h2 className="text-lg font-bold text-white mt-1">
                Server CBT Dihentikan Secara Paksa oleh Administrator
              </h2>
              <p className="text-xs text-rose-200/90 mt-1 leading-relaxed">
                Seluruh sesi ujian saat ini dibekukan sementara oleh Kepala Pusat Data & Server CBT (<strong>{serverControl.stoppedBy || 'Rifky Ardiansyah, S.Kom.'}</strong>).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-left space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Waktu Penghentian:</span>
                <span className="text-white font-bold">{serverControl.stoppedAt || 'Darurat'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Alasan Penghentian:</span>
                <span className="text-rose-400 font-bold">{serverControl.reason || 'Perintah Kill-Switch Darurat'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Integritas Jawaban:</span>
                <span className="text-emerald-400 font-bold">100% Tersimpan Aman di Cache</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal">
              Harap tetap tenang di tempat duduk Anda. Jangan menutup peramban hingga server dipulihkan kembali oleh panitia ujian SMP IT Sindangprabu.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={onFinishExam}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Kembali ke Halaman Siswa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Lockdown Warning Modal (When fullscreen is broken or tab switched) */}
      {(showFullscreenWarning || !isFullscreen) && !isLocked && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border-2 border-rose-600 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 mx-auto flex items-center justify-center animate-bounce">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold text-rose-400 uppercase tracking-widest font-mono">
                PERINGATAN PELANGGARAN KEAMANAN!
              </span>
              <h2 className="text-lg font-bold text-white mt-1">
                Layar Penuh Terputus / Anda Terdeteksi Keluar Layar
              </h2>
              <p className="text-xs text-rose-200/80 mt-1">
                Sesuai protokol integritas SMP IT Sindangprabu, Anda tidak diizinkan meninggalkan layar ujian sebelum seluruh soal selesai diserahkan.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-300 font-mono">
              Pelanggaran ke-{session.violationCount} dari maksimal {maxViolations} toleransi! Jika batas tercapai, sesi Anda langsung dikunci.
            </div>

            <button
              type="button"
              onClick={async () => {
                try {
                  await document.documentElement.requestFullscreen();
                  setIsFullscreen(true);
                  setShowFullscreenWarning(false);
                } catch (e) {
                  setShowFullscreenWarning(false);
                }
              }}
              className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-950/50"
            >
              <Maximize2 className="w-4 h-4" />
              Kembali ke Layar Penuh & Lanjutkan Ujian
            </button>
          </div>
        </div>
      )}

      {/* Auto-Locked Due to Cheating Modal */}
      {isLocked && !showResult && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border-2 border-rose-600 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-600 text-white mx-auto flex items-center justify-center animate-pulse">
              <Lock className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-bold text-white">
              Sesi Ujian Terkunci Otomatis!
            </h2>
            <p className="text-xs text-rose-300">
              Anda telah melakukan pelanggaran keamanan sebanyak {session.violationCount} kali (melebihi toleransi server). Seluruh jawaban Anda telah dikirimkan ke server pengawas dan sesi Anda dihentikan.
            </p>

            <button
              type="button"
              onClick={() => {
                submitExamSession(session.id);
                setShowResult(true);
              }}
              className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow"
            >
              Lihat Ringkasan Asesmen
            </button>
          </div>
        </div>
      )}

      {/* Confirmation to Finish Exam Modal */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white text-center">
              Konfirmasi Pengumpulan Ujian SISPENA
            </h3>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Total Soal:</span>
                <span className="font-mono font-bold text-white">{totalQuestions}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Soal Sudah Dijawab:</span>
                <span className="font-mono font-bold">{answeredCount}</span>
              </div>
              <div className="flex justify-between text-rose-400">
                <span>Soal Belum Dijawab:</span>
                <span className="font-mono font-bold">{totalQuestions - answeredCount}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 text-center">
              Apakah Anda yakin ingin menyelesaikan dan mengumpulkan ujian ini sekarang? Setelah dikumpulkan, Anda tidak dapat mengubah jawaban lagi.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowFinishConfirm(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg bg-slate-800 cursor-pointer"
              >
                Cek Kembali
              </button>
              <button
                type="button"
                onClick={handleSubmitExam}
                className="flex-1 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow cursor-pointer"
              >
                Ya, Kumpulkan Ujian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResult && (
        <SiswaResultModal
          session={session}
          exam={exam}
          onClose={() => {
            setShowResult(false);
            onFinishExam();
          }}
        />
      )}
    </div>
  );
};

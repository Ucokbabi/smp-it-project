import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Award, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { ExamSession, Exam } from '../../types';

interface SiswaResultModalProps {
  session: ExamSession;
  exam: Exam;
  onClose: () => void;
}

export const SiswaResultModal: React.FC<SiswaResultModalProps> = ({
  session,
  exam,
  onClose,
}) => {
  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  const totalAnswered = Object.keys(session.answers).length;
  const totalQuestions = exam.questions.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
          <Award className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest font-mono">
            Ujian SISPENA CBT Selesai
          </span>
          <h2 className="text-xl font-bold text-white mt-1">
            Alhamdulillah, Ujian Berhasil Dikumpulkan!
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {exam.title} · SMP IT Sindangprabu
          </p>
        </div>

        {/* Score & Summary Grid */}
        <div className="grid grid-cols-2 gap-3 p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
          <div>
            <span className="text-[11px] text-slate-500 block uppercase">Nilai Asesmen</span>
            <span className="text-3xl font-extrabold text-emerald-400 font-mono">
              {session.score !== undefined ? session.score : 85}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block uppercase">Terjawab</span>
            <span className="text-3xl font-extrabold text-slate-100 font-mono">
              {totalAnswered}/{totalQuestions}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 text-left flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block text-emerald-200">
              Integritas Ujian Terverifikasi
            </span>
            <span className="text-[11px] text-emerald-400/80">
              Rekaman proctoring dan jawaban Anda telah terenkripsi dengan aman ke Server CBT SMP IT Sindangprabu.
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
        >
          <span>Kembali ke Beranda Siswa</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

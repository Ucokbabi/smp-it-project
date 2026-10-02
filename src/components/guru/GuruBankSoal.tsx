import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Exam, Question } from '../../types';
import {
  FileText,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  ShieldCheck,
  ListPlus,
  Save,
  HelpCircle,
} from 'lucide-react';

export const GuruBankSoal: React.FC = () => {
  const { exams, updateExam, currentUser } = useApp();

  const [selectedExamId, setSelectedExamId] = useState<string>(() => exams[0]?.id || '');
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);

  // New question form state
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<'multiple_choice' | 'essay'>('multiple_choice');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('A');
  const [scoreWeight, setScoreWeight] = useState(20);

  const selectedExam = exams.find((e) => e.id === selectedExamId) || exams[0];

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam || !questionText) return;

    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      number: selectedExam.questions.length + 1,
      type: questionType,
      text: questionText,
      options:
        questionType === 'multiple_choice'
          ? [
              { id: 'A', text: optA || 'Pilihan A' },
              { id: 'B', text: optB || 'Pilihan B' },
              { id: 'C', text: optC || 'Pilihan C' },
              { id: 'D', text: optD || 'Pilihan D' },
            ]
          : undefined,
      correctAnswer: questionType === 'multiple_choice' ? correctAnswer : optA,
      scoreWeight: scoreWeight,
    };

    const updatedExam: Exam = {
      ...selectedExam,
      questions: [...selectedExam.questions, newQuestion],
      totalQuestions: selectedExam.questions.length + 1,
    };

    updateExam(updatedExam);
    setShowAddQuestionModal(false);
    resetQuestionForm();
  };

  const resetQuestionForm = () => {
    setQuestionText('');
    setQuestionType('multiple_choice');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setCorrectAnswer('A');
    setScoreWeight(20);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!selectedExam) return;
    const filtered = selectedExam.questions.filter((q) => q.id !== questionId);
    // Renumber
    const renumbered = filtered.map((q, idx) => ({ ...q, number: idx + 1 }));
    updateExam({
      ...selectedExam,
      questions: renumbered,
      totalQuestions: renumbered.length,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-400" />
            Bank Soal & Modul Pembuatan Soal CBT
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Buat dan kelola butir soal pilihan ganda maupun esai terenkripsi untuk SMP IT Sindangprabu.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetQuestionForm();
            setShowAddQuestionModal(true);
          }}
          className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors shadow-md self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tambah Butir Soal Baru
        </button>
      </div>

      {/* Select Exam Package */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-300 whitespace-nowrap">
            Pilih Paket Ujian:
          </label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-semibold"
          >
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title} ({exam.subject} - {exam.classGrade})
              </option>
            ))}
          </select>
        </div>

        {selectedExam && (
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>Token: <strong className="text-emerald-400 font-mono">{selectedExam.token}</strong></span>
            <span>·</span>
            <span>Total Soal: <strong className="text-white font-mono">{selectedExam.questions.length}</strong></span>
            <span>·</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Terenkripsi
            </span>
          </div>
        )}
      </div>

      {/* Question List */}
      <div className="space-y-4">
        {selectedExam?.questions.map((q, index) => (
          <div
            key={q.id}
            className="p-5 rounded-xl border border-slate-800 bg-slate-900 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs font-mono">
                  #{index + 1}
                </span>
                <span className="text-xs font-semibold text-slate-300 uppercase">
                  {q.type === 'multiple_choice' ? 'Pilihan Ganda' : 'Esai Reflektif'}
                </span>
                <span className="text-[11px] text-slate-500">
                  (Bobot Nilai: {q.scoreWeight} Poin)
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteQuestion(q.id)}
                className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                title="Hapus Soal"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm font-medium text-slate-100 leading-relaxed">
              {q.text}
            </p>

            {q.type === 'multiple_choice' && q.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {q.options.map((opt) => {
                  const isCorrect = opt.id === q.correctAnswer;
                  return (
                    <div
                      key={opt.id}
                      className={`p-2.5 rounded-lg border text-xs flex items-center gap-2.5 ${
                        isCorrect
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold'
                          : 'bg-slate-950 border-slate-800/80 text-slate-300'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded font-mono font-bold flex items-center justify-center text-[10px] ${
                          isCorrect
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {opt.id}
                      </span>
                      <span>{opt.text}</span>
                      {isCorrect && (
                        <span className="ml-auto text-[10px] text-emerald-400 font-bold">
                          KUNCI
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {q.type === 'essay' && (
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                  Kunci Jawaban Referensi / Rubrik:
                </span>
                <p className="text-slate-300 italic">
                  {q.correctAnswer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Question Modal */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white">
              Tambah Butir Soal Ujian
            </h3>
            <p className="text-xs text-slate-400">
              Paket: {selectedExam?.title}
            </p>

            <form onSubmit={handleAddQuestion} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tipe Soal
                  </label>
                  <select
                    value={questionType}
                    onChange={(e) =>
                      setQuestionType(e.target.value as 'multiple_choice' | 'essay')
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="multiple_choice">Pilihan Ganda (A-D)</option>
                    <option value="essay">Esai / Uraian</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Bobot Poin
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={scoreWeight}
                    onChange={(e) => setScoreWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Isi Pertanyaan Soal *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tuliskan teks pertanyaan di sini..."
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {questionType === 'multiple_choice' ? (
                <div className="space-y-3">
                  <span className="block text-xs font-semibold text-slate-300">
                    Opsi Pilihan Jawaban & Tentukan Kunci:
                  </span>

                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-slate-800 text-slate-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        A
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Pilihan Jawaban A"
                        value={optA}
                        onChange={(e) => setOptA(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-slate-800 text-slate-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        B
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Pilihan Jawaban B"
                        value={optB}
                        onChange={(e) => setOptB(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-slate-800 text-slate-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        C
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Pilihan Jawaban C"
                        value={optC}
                        onChange={(e) => setOptC(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-slate-800 text-slate-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        D
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Pilihan Jawaban D"
                        value={optD}
                        onChange={(e) => setOptD(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Kunci Jawaban Benar:
                    </label>
                    <select
                      value={correctAnswer}
                      onChange={(e) => setCorrectAnswer(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Pedoman / Kunci Jawaban Esai *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Pedoman penilaian atau kata kunci yang diharapkan..."
                    value={optA}
                    onChange={(e) => setOptA(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-300 hover:text-white rounded bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded shadow cursor-pointer"
                >
                  Simpan Soal ke Bank Soal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

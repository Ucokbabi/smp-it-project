import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Exam } from '../../types';
import {
  Server,
  Plus,
  Trash2,
  Edit,
  KeyRound,
  Clock,
  ShieldCheck,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  Shuffle,
  PowerOff,
  Play,
  AlertTriangle,
} from 'lucide-react';

export const AdminExams: React.FC = () => {
  const {
    exams,
    addExam,
    updateExam,
    deleteExam,
    teachers,
    serverControl,
    forceStopServer,
    restoreServer,
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Informatika');
  const [classGrade, setClassGrade] = useState('Kelas 9');
  const [teacherId, setTeacherId] = useState(teachers[0]?.id || '');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [token, setToken] = useState('SPN' + Math.floor(100 + Math.random() * 900));
  const [status, setStatus] = useState<Exam['status']>('scheduled');
  const [maxViolationsAllowed, setMaxViolationsAllowed] = useState(3);

  const isServerStopped = serverControl.status === 'emergency_stopped';

  const generateRandomToken = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let res = 'SPN';
    for (let i = 0; i < 3; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setToken(res);
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    const teacher = teachers.find((t) => t.id === teacherId) || teachers[0];

    if (editingExam) {
      const updated: Exam = {
        ...editingExam,
        title,
        subject,
        classGrade,
        teacherId: teacher?.id || '',
        teacherName: teacher?.biodata.fullName || 'Ustadzah Siti Fatimah, S.Pd.I',
        durationMinutes,
        token,
        status,
        maxViolationsAllowed,
      };
      updateExam(updated);
      setEditingExam(null);
    } else {
      const newExam: Exam = {
        id: `exam-${Date.now()}`,
        title,
        subject,
        classGrade,
        teacherId: teacher?.id || '',
        teacherName: teacher?.biodata.fullName || 'Ustadzah Siti Fatimah, S.Pd.I',
        token,
        durationMinutes,
        startTime: new Date().toISOString().slice(0, 10) + ' 08:00',
        endTime: new Date().toISOString().slice(0, 10) + ' 12:00',
        status,
        totalQuestions: 5,
        isEncrypted: true,
        allowRandomize: true,
        maxViolationsAllowed,
        questions: [
          {
            id: `q-gen-1`,
            number: 1,
            type: 'multiple_choice',
            text: 'Jaringan komputer terenkripsi pada SMP IT Sindangprabu menggunakan protokol...',
            options: [
              { id: 'A', text: 'HTTPS / TLS 1.3' },
              { id: 'B', text: 'Telnet Plaintext' },
              { id: 'C', text: 'FTP Anonymous' },
              { id: 'D', text: 'HTTP 1.0' },
            ],
            correctAnswer: 'A',
            scoreWeight: 20,
          },
          {
            id: `q-gen-2`,
            number: 2,
            type: 'multiple_choice',
            text: 'Fungsi utama pengawasan anti-kecurangan berbasis browser lockdown adalah...',
            options: [
              { id: 'A', text: 'Mencegah peserta berganti tab atau meminimalkan layar ujian' },
              { id: 'B', text: 'Mempercepat kecepatan internet' },
              { id: 'C', text: 'Menghapus memori cache browser' },
              { id: 'D', text: 'Membagikan jawaban ujian otomatis' },
            ],
            correctAnswer: 'A',
            scoreWeight: 20,
          },
        ],
      };
      addExam(newExam);
    }

    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setSubject('Informatika');
    setClassGrade('Kelas 9');
    setTeacherId(teachers[0]?.id || '');
    setDurationMinutes(60);
    generateRandomToken();
    setStatus('scheduled');
    setMaxViolationsAllowed(3);
  };

  const openEditModal = (exam: Exam) => {
    setEditingExam(exam);
    setTitle(exam.title);
    setSubject(exam.subject);
    setClassGrade(exam.classGrade);
    setTeacherId(exam.teacherId);
    setDurationMinutes(exam.durationMinutes);
    setToken(exam.token);
    setStatus(exam.status);
    setMaxViolationsAllowed(exam.maxViolationsAllowed);
    setShowAddModal(true);
  };

  const toggleExamStatus = (exam: Exam) => {
    const nextStatus = exam.status === 'active' ? 'completed' : 'active';
    updateExam({ ...exam, status: nextStatus });
  };

  return (
    <div className="space-y-6">
      {/* Emergency Server Stopped Banner */}
      {isServerStopped && (
        <div className="p-4 rounded-xl bg-rose-950/80 border-2 border-rose-600 text-rose-200 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-600 text-white animate-pulse">
              <PowerOff className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold block text-sm text-white">
                SERVER CBT DIHENTIKAN SECARA PAKSA!
              </span>
              <p className="text-xs text-rose-200">
                Semua ujian dibekukan. Alasan: "{serverControl.reason || 'Perintah Kill-Switch Darurat'}"
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={restoreServer}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow cursor-pointer shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>Nyalakan Server Kembali</span>
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Server className="w-6 h-6 text-emerald-400" />
            Manajemen Jadwal & Server Ujian CBT
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Atur paket ujian, generate token rilis, aktifkan sesi server, dan tentukan batasan anti-curang.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          {/* Force Stop / Kill Switch Button in Exams view */}
          {isServerStopped ? (
            <button
              type="button"
              onClick={restoreServer}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Pulihkan Server</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => forceStopServer('Penghentian paksa darurat dari panel jadwal ujian')}
              className="px-3.5 py-2 rounded-lg bg-rose-950/70 hover:bg-rose-900/80 text-rose-300 hover:text-white border border-rose-700/80 font-bold text-xs flex items-center gap-1.5 transition-colors shadow cursor-pointer"
            >
              <PowerOff className="w-3.5 h-3.5 text-rose-400" />
              <span>Hentikan Server Paksa</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              resetForm();
              setEditingExam(null);
              setShowAddModal(true);
            }}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Buat Jadwal Ujian Baru
          </button>
        </div>
      </div>

      {/* Exam Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="p-5 rounded-xl border border-slate-800 bg-slate-900/90 shadow-sm hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider font-mono">
                  {exam.subject} · {exam.classGrade}
                </span>

                <span
                  className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider font-mono ${
                    exam.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                      : exam.status === 'scheduled'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {exam.status === 'active' ? '● SERVER AKTIF' : exam.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-white mt-1">
                {exam.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pengampu: {exam.teacherName}
              </p>
            </div>

            {/* Exam Parameters */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950 rounded-lg border border-slate-800/80 text-center text-xs">
              <div>
                <span className="block text-[10px] text-slate-500 uppercase">Token SISPENA</span>
                <span className="font-mono font-bold text-emerald-400 tracking-wider">
                  {exam.token}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase">Durasi</span>
                <span className="font-mono text-slate-200">
                  {exam.durationMinutes} Menit
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase">Toleransi Strike</span>
                <span className="font-mono text-rose-400">
                  Max {exam.maxViolationsAllowed}x
                </span>
              </div>
            </div>

            {/* Security Badges */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                Enkripsi SHA256
              </span>
              <span>·</span>
              <span>{exam.questions.length} Butir Soal</span>
              <span>·</span>
              <span>Lockdown Screen ON</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => toggleExamStatus(exam)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  exam.status === 'active'
                    ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {exam.status === 'active' ? (
                  <>
                    <PauseCircle className="w-3.5 h-3.5" />
                    Hentikan Sesi Ujian
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-3.5 h-3.5" />
                    Aktifkan Sesi Server
                  </>
                )}
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openEditModal(exam)}
                  className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Edit Pengaturan Ujian"
                >
                  <Edit className="w-4 h-4 text-slate-300" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Hapus paket ujian ${exam.title}?`)) {
                      deleteExam(exam.id);
                    }
                  }}
                  className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                  title="Hapus Ujian"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Exam Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              {editingExam ? 'Edit Jadwal & Paket Ujian' : 'Buat Jadwal Ujian Baru'}
            </h3>
            <p className="text-xs text-slate-400">
              SMP IT Sindangprabu · Konfigurasi parameter server ujian SISPENA CBT
            </p>

            <form onSubmit={handleCreateExam} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Judul Ujian *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PTS Informatika & Pemrograman Web"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mata Pelajaran
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tingkat Kelas
                  </label>
                  <select
                    value={classGrade}
                    onChange={(e) => setClassGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Kelas 9">Kelas 9</option>
                    <option value="Kelas 8">Kelas 8</option>
                    <option value="Kelas 7">Kelas 7</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Guru Pengampu
                  </label>
                  <select
                    value={teacherId}
                    onChange={(e) => setTeacherId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.biodata.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Durasi (Menit)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={180}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Token Rilis
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomToken}
                      className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5"
                    >
                      <Shuffle className="w-2.5 h-2.5" />
                      Acak
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-emerald-400 font-mono font-bold tracking-wider focus:outline-none focus:border-emerald-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Batas Toleransi Pelanggaran
                  </label>
                  <select
                    value={maxViolationsAllowed}
                    onChange={(e) => setMaxViolationsAllowed(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value={1}>1x Pelanggaran (Ketat)</option>
                    <option value={2}>2x Pelanggaran</option>
                    <option value={3}>3x Pelanggaran (Standar)</option>
                    <option value={5}>5x Pelanggaran</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-300 hover:text-white rounded bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded shadow cursor-pointer"
                >
                  {editingExam ? 'Simpan Perubahan' : 'Buat Ujian'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

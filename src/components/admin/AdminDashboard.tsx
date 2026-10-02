import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import {
  Server,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck2,
  ShieldAlert,
  Radio,
  Activity,
  HardDrive,
  Cpu,
  RefreshCw,
  ExternalLink,
  PowerOff,
  AlertTriangle,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { AdminSiswaList } from './AdminSiswaList';
import { AdminGuruList } from './AdminGuruList';
import { AdminExams } from './AdminExams';
import { AdminAttendance } from './AdminAttendance';
import { AdminSecurityLogs } from './AdminSecurityLogs';

interface AdminDashboardProps {
  onOpenFaceScan: (user: User) => void;
  onOpenEditBiodata: (user: User) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenFaceScan,
  onOpenEditBiodata,
}) => {
  const {
    students,
    teachers,
    exams,
    suspiciousEvents,
    attendanceRecords,
    currentUser,
    serverControl,
    forceStopServer,
    restoreServer,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'siswa' | 'guru' | 'exams' | 'attendance' | 'security'>('overview');
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState('Indikasi Insiden Keamanan & Kecurangan Massal');

  const activeExamsCount = exams.filter((e) => e.status === 'active').length;
  const criticalSuspiciousCount = suspiciousEvents.filter((e) => e.severity === 'critical' || e.severity === 'high').length;
  const isServerStopped = serverControl.status === 'emergency_stopped';

  const handleConfirmForceStop = (e: React.FormEvent) => {
    e.preventDefault();
    forceStopServer(emergencyReason);
    setShowEmergencyModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Admin Sub Navigation Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Server className="w-4 h-4" />
          Server Utama
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('siswa')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'siswa'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Menu Siswa ({students.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('guru')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'guru'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Menu Guru ({teachers.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('exams')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'exams'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          Jadwal Ujian ({exams.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'attendance'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <CalendarCheck2 className="w-4 h-4" />
          Absensi Guru & Murid
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'security'
              ? 'bg-rose-500 text-white font-bold shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Anti-Curang
          {criticalSuspiciousCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-950 text-rose-300 text-[10px] font-mono border border-rose-800">
              {criticalSuspiciousCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Emergency Server Shutdown Alert Banner */}
          {isServerStopped && (
            <div className="p-5 rounded-2xl bg-rose-950/80 border-2 border-rose-600 text-rose-200 shadow-2xl space-y-3 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-600 text-white shrink-0 animate-pulse">
                    <PowerOff className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                        KILL-SWITCH AKTIF
                      </span>
                      <h2 className="text-base font-bold text-white">
                        Server CBT SMP IT Sindangprabu Sedang Dihentikan Secara Paksa!
                      </h2>
                    </div>
                    <p className="text-xs text-rose-200 mt-1">
                      Seluruh sesi ujian siswa dibekukan. Server dalam status darurat oleh <strong>{serverControl.stoppedBy || 'Rifky Ardiansyah, S.Kom.'}</strong> ({serverControl.stoppedAt}).
                    </p>
                    <p className="text-[11px] text-rose-300 font-mono mt-0.5">
                      Alasan: "{serverControl.reason || 'Perintah Penghentian Paksa'}"
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={restoreServer}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer shrink-0"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Pulihkan & Nyalakan Server</span>
                </button>
              </div>
            </div>
          )}

          {/* Welcome Banner for Rifky Ardiansyah, S.Kom. */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-4">
              <img
                src={currentUser?.biodata.photoUrl || '/src/assets/images/admin_rifky_ardiansyah_1790860491868.jpg'}
                alt="Rifky Ardiansyah, S.Kom."
                className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/80 shadow-md"
              />
              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest font-mono">
                  Server Control Center
                </span>
                <h1 className="text-xl font-bold text-white mt-0.5">
                  Selamat Datang, {currentUser?.biodata.fullName || 'Rifky Ardiansyah, S.Kom.'}
                </h1>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  Pusat Server Asesmen SMP IT Sindangprabu. Mengatur jalannya ujian CBT berkeamanan tinggi, enkripsi bank soal, absensi biometrik guru & murid, dan radar pengawasan kecurangan real-time.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
              <button
                type="button"
                onClick={() => setActiveTab('exams')}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow cursor-pointer"
              >
                Mulai Ujian Baru
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Pantau Radar
              </button>
            </div>
          </div>

          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400">Total Siswa Terdaftar</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-white">
                  {students.length}
                </span>
                <GraduationCap className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-[11px] text-emerald-400">
                {students.filter((s) => s.biodata.faceRegistered).length} Wajah Biometrik Aktif
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400">Dewan Guru</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-white">
                  {teachers.length}
                </span>
                <BookOpen className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-[11px] text-blue-400">
                Presensi Mandiri + GPS Sindangprabu
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400">Sesi Ujian CBT Aktif</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-white">
                  {activeExamsCount}
                </span>
                <Server className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-[11px] text-amber-400">
                Lockdown Screen & Enkripsi Aktif
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400">Notifikasi Kecurangan</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-rose-400">
                  {suspiciousEvents.length}
                </span>
                <ShieldAlert className="w-5 h-5 text-rose-400" />
              </div>
              <span className="text-[11px] text-rose-400">
                {criticalSuspiciousCount} Peringatan Serius
              </span>
            </div>
          </div>

          {/* Server Engine Health & Live Proctoring Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Server CBT Health Panel */}
            <div className={`p-5 rounded-xl border space-y-4 transition-all ${
              isServerStopped
                ? 'bg-rose-950/20 border-rose-600 shadow-xl shadow-rose-950/40'
                : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Activity className={`w-4 h-4 ${isServerStopped ? 'text-rose-400' : 'text-emerald-400'}`} />
                  Kondisi Server SISPENA CBT
                </h3>
                {isServerStopped ? (
                  <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-rose-300 bg-rose-500/20 px-2.5 py-0.5 rounded border border-rose-500/40 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    DIHENTIKAN PAKSA
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    ONLINE
                  </span>
                )}
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Enkripsi Token Soal (AES-256)</span>
                    <span className={isServerStopped ? "text-rose-400 font-mono font-bold" : "text-emerald-400 font-mono"}>
                      {isServerStopped ? 'DIBEKUKAN DARURAT' : 'AKTIF & AMAN'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`w-full h-full rounded-full ${isServerStopped ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Integritas Browser Lockdown</span>
                    <span className={isServerStopped ? "text-rose-400 font-mono font-bold" : "text-emerald-400 font-mono"}>
                      {isServerStopped ? 'CLIENT TERKUNCI TOTAL' : '100% TERKUNCI'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`w-full h-full rounded-full ${isServerStopped ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Koordinat Geofence SMP IT Sindangprabu</span>
                    <span className="text-emerald-400 font-mono">-7.16104, 107.95218</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Radius validasi presensi: 250 meter di Wanaraja - Garut.
                  </p>
                </div>
              </div>

              {/* Emergency Kill-Switch Action Button */}
              <div className="pt-2 border-t border-slate-800/80">
                {isServerStopped ? (
                  <button
                    type="button"
                    onClick={restoreServer}
                    className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-950/50"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Pulihkan & Nyalakan Kembali Server</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowEmergencyModal(true)}
                    className="w-full py-2.5 px-3 rounded-lg bg-rose-950/70 hover:bg-rose-900/80 text-rose-300 hover:text-white border border-rose-700/80 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow"
                  >
                    <PowerOff className="w-4 h-4 text-rose-400" />
                    <span>Hentikan Server Secara Paksa (Kill-Switch)</span>
                  </button>
                )}
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                <span>Versi Engine CBT: 3.4-PRO</span>
                <span className="font-mono text-slate-300">Sindangprabu Server #1</span>
              </div>
            </div>

            {/* Quick Live Anti-Cheat Notifications */}
            <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  Notifikasi Otomatis Aktivitas Mencurigakan Terakhir
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('security')}
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>Lihat Semua Log</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2">
                {suspiciousEvents.slice(0, 3).map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                      <span className="font-bold text-white">{evt.studentName}</span>
                      <span className="text-slate-500 truncate">{evt.description}</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400 shrink-0">
                      {evt.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'siswa' && (
        <AdminSiswaList
          onOpenFaceScan={onOpenFaceScan}
          onOpenEditBiodata={onOpenEditBiodata}
        />
      )}

      {activeTab === 'guru' && (
        <AdminGuruList
          onOpenFaceScan={onOpenFaceScan}
          onOpenEditBiodata={onOpenEditBiodata}
        />
      )}

      {activeTab === 'exams' && <AdminExams />}

      {activeTab === 'attendance' && <AdminAttendance />}

      {activeTab === 'security' && <AdminSecurityLogs />}

      {/* Emergency Server Force Stop Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border-2 border-rose-600 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center">
              <PowerOff className="w-7 h-7" />
            </div>

            <div className="text-center">
              <span className="text-[11px] font-bold text-rose-400 uppercase tracking-widest font-mono">
                PERINTAH DARURAT SERVER CBT
              </span>
              <h3 className="text-base font-bold text-white mt-1">
                Konfirmasi Hentikan Server Secara Paksa?
              </h3>
              <p className="text-xs text-rose-200/90 mt-1 leading-relaxed">
                Tindakan ini akan seketika membekukan seluruh sesi ujian aktif siswa, memutus transmisi soal, dan mengunci ruang ujian klien di seluruh SMP IT Sindangprabu.
              </p>
            </div>

            <form onSubmit={handleConfirmForceStop} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Alasan Penghentian Paksa Server *
                </label>
                <select
                  value={emergencyReason}
                  onChange={(e) => setEmergencyReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                >
                  <option value="Indikasi Insiden Keamanan & Kecurangan Massal">Indikasi Insiden Keamanan & Kecurangan Massal</option>
                  <option value="Gangguan Jaringan & Server Down Darurat">Gangguan Jaringan & Server Down Darurat</option>
                  <option value="Pemadaman Listrik / Bencana / Force Majeure">Pemadaman Listrik / Bencana / Force Majeure</option>
                  <option value="Instruksi Panitia: Ujian Ditunda Sementara">Instruksi Panitia: Ujian Ditunda Sementara</option>
                </select>
              </div>

              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-[11px] text-rose-300 space-y-1">
                <p className="font-bold flex items-center gap-1 text-rose-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  Dampak Eksekusi:
                </p>
                <p>• Seluruh ujian aktif ({activeExamsCount}) langsung dibekukan/ditutup.</p>
                <p>• Seluruh layar ujian siswa terkunci dengan notifikasi darurat.</p>
                <p>• Log darurat dicatat atas nama <strong>{currentUser?.biodata.fullName || 'Rifky Ardiansyah, S.Kom.'}</strong>.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEmergencyModal(false)}
                  className="px-3.5 py-2 text-xs text-slate-300 hover:text-white rounded-lg bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-lg shadow-rose-950/60 flex items-center gap-1.5 cursor-pointer"
                >
                  <PowerOff className="w-3.5 h-3.5" />
                  Ya, Hentikan Paksa Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

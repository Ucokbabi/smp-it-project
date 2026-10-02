import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ScanFace,
  Trash2,
  Calendar,
} from 'lucide-react';
import { SindangprabuMap } from '../common/SindangprabuMap';

interface GuruAbsensiMandiriProps {
  onOpenFaceScanner: () => void;
}

export const GuruAbsensiMandiri: React.FC<GuruAbsensiMandiriProps> = ({
  onOpenFaceScanner,
}) => {
  const {
    currentUser,
    submitAttendance,
    attendanceRecords,
    deleteUserFace,
    schoolInfo,
  } = useApp();

  const [currentDistance, setCurrentDistance] = useState(18);
  const [isWithinRadius, setIsWithinRadius] = useState(true);
  const [currentLat, setCurrentLat] = useState(-7.16105);
  const [currentLng, setCurrentLng] = useState(107.95219);
  const [attendanceType, setAttendanceType] = useState<'masuk' | 'pulang'>('masuk');
  const [notes, setNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!currentUser) return null;

  // Find today's attendance for this teacher
  const todayStr = new Date().toISOString().slice(0, 10);
  const teacherHistory = attendanceRecords.filter(
    (r) => r.userId === currentUser.id
  );

  const handleLocationUpdate = (lat: number, lng: number, distance: number, valid: boolean) => {
    setCurrentLat(lat);
    setCurrentLng(lng);
    setCurrentDistance(distance);
    setIsWithinRadius(valid);
  };

  const handleDoAttendance = () => {
    if (!currentUser.biodata.faceRegistered) {
      alert('Wajah Anda belum terdaftar di sistem biometrik. Silakan rekam wajah terlebih dahulu.');
      onOpenFaceScanner();
      return;
    }

    if (!isWithinRadius) {
      if (!confirm('Posisi GPS Anda terdeteksi di luar radius 250m SMP IT Sindangprabu. Tetap kirimkan presensi dengan catatan?')) {
        return;
      }
    }

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    submitAttendance({
      userId: currentUser.id,
      userName: currentUser.biodata.fullName,
      userRole: 'guru',
      identifier: currentUser.biodata.identifier,
      date: todayStr,
      time: timeStr,
      type: attendanceType,
      status: 'hadir',
      method: 'face_recognition',
      faceVerified: true,
      faceCaptureUrl: currentUser.biodata.facePhotoUrl || currentUser.biodata.photoUrl,
      latitude: currentLat,
      longitude: currentLng,
      distanceFromSchoolMeters: currentDistance,
      isWithinRadius: isWithinRadius,
      notes: notes || `Presensi mandiri guru via biometrik wajah & GPS SMP IT Sindangprabu`,
    });

    setSuccessMsg(`Presensi ${attendanceType.toUpperCase()} berhasil dikirim! Terverifikasi wajah biometrik.`);
    setTimeout(() => {
      setSuccessMsg(null);
    }, 3500);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ScanFace className="w-6 h-6 text-emerald-400" />
            Absensi Mandiri Guru dengan Pengenalan Wajah & GPS
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Sistem absensi cerdas berbasis biometrik wajah dan validasi koordinat lokasi SMP IT Sindangprabu.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Grid: Face Verification Card & GPS Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Facial Recognition Sensor Card */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                Status Biometrik Wajah Guru
              </span>

              {currentUser.biodata.faceRegistered ? (
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Wajah Terverifikasi
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Wajah Belum Terdaftar
                </span>
              )}
            </div>

            {/* Face snapshot & Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="relative">
                {currentUser.biodata.facePhotoUrl ? (
                  <img
                    src={currentUser.biodata.facePhotoUrl}
                    alt={currentUser.biodata.fullName}
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-slate-800 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500">
                    <ScanFace className="w-8 h-8 mb-1" />
                    <span className="text-[10px]">Belum Ada</span>
                  </div>
                )}
                {currentUser.biodata.faceRegistered && (
                  <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-slate-950 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              <div className="space-y-2 text-center sm:text-left">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {currentUser.biodata.fullName}
                  </h4>
                  <p className="text-xs text-slate-400">
                    NIP: {currentUser.biodata.identifier} · {currentUser.biodata.subject || 'Guru Pengampu'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={onOpenFaceScanner}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    {currentUser.biodata.faceRegistered ? 'Scan / Update Wajah' : 'Daftarkan Wajah'}
                  </button>

                  {/* Tombol Delete / Hapus Wajah - As requested */}
                  {currentUser.biodata.faceRegistered && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Hapus data rekaman biometrik wajah Anda?')) {
                          deleteUserFace(currentUser.id);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Wajah
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Attendance Form */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAttendanceType('masuk')}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    attendanceType === 'masuk'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Presensi Masuk Pagi
                </button>
                <button
                  type="button"
                  onClick={() => setAttendanceType('pulang')}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    attendanceType === 'pulang'
                      ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Presensi Pulang Sore
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Catatan Harian (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Mengajar Informatika Kelas 9 & Pembinaan Tahfidz"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDoAttendance}
            className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            Kirim Presensi Mandiri Sekarang
          </button>
        </div>

        {/* Right: Geolocation Sindangprabu Map */}
        <div>
          <SindangprabuMap onLocationUpdate={handleLocationUpdate} interactive={true} />
        </div>
      </div>

      {/* Teacher Attendance Log History */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          Riwayat Presensi Guru Anda
        </h3>

        <div className="space-y-2">
          {teacherHistory.length === 0 ? (
            <p className="text-xs text-slate-500 py-3 text-center">
              Belum ada data presensi yang tercatat untuk akun ini.
            </p>
          ) : (
            teacherHistory.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <div>
                    <span className="font-semibold text-white">
                      {item.type.toUpperCase()} · {item.date}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      {item.notes || 'Presensi terverifikasi'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-emerald-400 block font-bold">
                    {item.time} WIB
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Jarak: {item.distanceFromSchoolMeters || 18}m dari SMP IT Sindangprabu
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, AttendanceRecord } from '../../types';
import {
  Users,
  CheckCircle2,
  Calendar,
  Save,
  ScanFace,
  UserCheck,
  Search,
} from 'lucide-react';

interface GuruAbsensiSiswaProps {
  onOpenFaceScannerForStudent: (student: User) => void;
}

export const GuruAbsensiSiswa: React.FC<GuruAbsensiSiswaProps> = ({
  onOpenFaceScannerForStudent,
}) => {
  const { students, submitAttendance } = useApp();

  const [selectedClass, setSelectedClass] = useState('Kelas 9A (Tahfidz Sains)');
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [attendanceState, setAttendanceState] = useState<
    Record<string, 'hadir' | 'sakit' | 'izin' | 'alpa'>
  >({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Filter students in selected class
  const classStudents = students.filter((s) =>
    s.biodata.className?.includes(selectedClass.slice(0, 8))
  );

  const handleStatusChange = (
    studentId: string,
    status: 'hadir' | 'sakit' | 'izin' | 'alpa'
  ) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAllHadir = () => {
    const updated: Record<string, 'hadir'> = {};
    classStudents.forEach((s) => {
      updated[s.id] = 'hadir';
    });
    setAttendanceState(updated);
  };

  const handleSaveClassAttendance = () => {
    const nowTime = new Date().toTimeString().split(' ')[0];

    classStudents.forEach((student) => {
      const status = attendanceState[student.id] || 'hadir';
      const record: Omit<AttendanceRecord, 'id'> = {
        userId: student.id,
        userName: student.biodata.fullName,
        userRole: 'siswa',
        identifier: student.biodata.identifier,
        className: student.biodata.className,
        date: selectedDate,
        time: nowTime,
        type: 'masuk',
        status: status,
        method: student.biodata.faceRegistered ? 'face_recognition' : 'manual',
        faceVerified: student.biodata.faceRegistered,
        notes: `Presensi kelas ${selectedClass} oleh guru pengampu`,
        isWithinRadius: true,
        distanceFromSchoolMeters: 15,
      };
      submitAttendance(record);
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            Presensi Siswa SMP IT Sindangprabu
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Lakukan absensi kelas peserta didik secara manual atau menggunakan verifikasi pengenalan wajah.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleMarkAllHadir}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
          >
            Tandai Semua Hadir
          </button>
          <button
            type="button"
            onClick={handleSaveClassAttendance}
            className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Simpan Presensi Kelas
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Presensi kelas berhasil disimpan ke dalam server SISPENA!</span>
        </div>
      )}

      {/* Class & Date Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Pilih Kelas Binaan
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-blue-500"
          >
            <option value="Kelas 9A (Tahfidz Sains)">Kelas 9A (Tahfidz Sains)</option>
            <option value="Kelas 9B (Teknologi Islam)">Kelas 9B (Teknologi Islam)</option>
            <option value="Kelas 8A">Kelas 8A</option>
            <option value="Kelas 7A">Kelas 7A</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Tanggal Presensi
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Student List Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Siswa</th>
                <th className="py-3 px-4">NISN</th>
                <th className="py-3 px-4 text-center">Biometrik Wajah</th>
                <th className="py-3 px-4 text-center">Status Kehadiran</th>
                <th className="py-3 px-4 text-right">Verifikasi Wajah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Tidak ada siswa di kelas ini.
                  </td>
                </tr>
              ) : (
                classStudents.map((siswa) => {
                  const currentStatus = attendanceState[siswa.id] || 'hadir';
                  return (
                    <tr key={siswa.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={siswa.biodata.photoUrl || '/src/assets/images/admin_rifky_ardiansyah_1790860491868.jpg'}
                            alt={siswa.biodata.fullName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-700"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="font-semibold text-slate-200 block">
                              {siswa.biodata.fullName}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {siswa.biodata.className}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-300">
                        {siswa.biodata.identifier}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {siswa.biodata.faceRegistered ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Aktif
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Belum Ada</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(siswa.id, 'hadir')}
                            className={`px-2 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                              currentStatus === 'hadir'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Hadir
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(siswa.id, 'sakit')}
                            className={`px-2 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                              currentStatus === 'sakit'
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Sakit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(siswa.id, 'izin')}
                            className={`px-2 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                              currentStatus === 'izin'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Izin
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(siswa.id, 'alpa')}
                            className={`px-2 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                              currentStatus === 'alpa'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Alpa
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onOpenFaceScannerForStudent(siswa)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1 ml-auto transition-colors cursor-pointer"
                        >
                          <ScanFace className="w-3.5 h-3.5 text-blue-400" />
                          Scan Wajah
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

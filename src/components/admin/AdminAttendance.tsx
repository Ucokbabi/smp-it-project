import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CalendarCheck2,
  ScanFace,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Search,
  ExternalLink,
} from 'lucide-react';
import { SindangprabuMap } from '../common/SindangprabuMap';

export const AdminAttendance: React.FC = () => {
  const { attendanceRecords, schoolInfo } = useApp();

  const [roleFilter, setRoleFilter] = useState<'all' | 'guru' | 'siswa'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMap, setShowMap] = useState(false);

  const filteredRecords = attendanceRecords.filter((rec) => {
    const matchRole = roleFilter === 'all' || rec.userRole === roleFilter;
    const matchSearch =
      rec.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.identifier.includes(searchTerm);
    return matchRole && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarCheck2 className="w-6 h-6 text-emerald-400" />
            Rekap Presensi Guru & Siswa SMP IT Sindangprabu
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Log kehadiran terintegrasi dengan verifikasi biometrik pengenalan wajah dan validasi koordinat GPS radius sekolah.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <MapPin className="w-4 h-4 text-emerald-400" />
          {showMap ? 'Sembunyikan Peta Sekolah' : 'Lihat Radius SMP IT Sindangprabu'}
        </button>
      </div>

      {/* Interactive Geofence Map Drawer */}
      {showMap && (
        <div className="animate-in fade-in">
          <SindangprabuMap interactive={false} />
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau NIP/NISN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setRoleFilter('all')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              roleFilter === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Semua Presensi
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('guru')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              roleFilter === 'guru'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Presensi Guru
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('siswa')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              roleFilter === 'siswa'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Presensi Siswa
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Nama & Foto Scan</th>
                <th className="py-3 px-4">Peran</th>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Metode Presensi</th>
                <th className="py-3 px-4">Jarak & Radius GPS</th>
                <th className="py-3 px-4">Status & Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Belum ada rekaman presensi pada filter ini.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {rec.faceCaptureUrl ? (
                          <img
                            src={rec.faceCaptureUrl}
                            alt={rec.userName}
                            className="w-9 h-9 rounded-lg object-cover border border-emerald-500/50 shadow-sm"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500">
                            <ScanFace className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <span className="font-semibold text-slate-200 block text-xs">
                            {rec.userName}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            {rec.identifier} {rec.className ? `· ${rec.className}` : ''}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          rec.userRole === 'guru'
                            ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                            : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {rec.userRole}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-300">
                      <div>{rec.date}</div>
                      <div className="text-[11px] text-slate-500">{rec.time} WIB</div>
                    </td>

                    <td className="py-3 px-4">
                      {rec.method === 'face_recognition' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Scan Biometrik Wajah
                        </span>
                      ) : (
                        <span className="text-slate-400">Presensi Presensi Kelas</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {rec.distanceFromSchoolMeters !== undefined ? (
                        <div className="space-y-0.5">
                          <span
                            className={`inline-flex items-center gap-1 font-mono font-bold text-[11px] ${
                              rec.isWithinRadius ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            <MapPin className="w-3 h-3" />
                            {rec.distanceFromSchoolMeters}m dari Sekolah
                          </span>
                          <div className="text-[10px] text-slate-500">
                            {rec.isWithinRadius ? '✓ Dalam Radius 250m' : '⚠ Diluar Radius'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px]">-</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-emerald-500/20 text-emerald-300">
                        {rec.status}
                      </span>
                      {rec.notes && (
                        <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs truncate">
                          {rec.notes}
                        </p>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

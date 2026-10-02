import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import {
  ScanFace,
  Users,
  FileText,
  Eye,
  CalendarCheck2,
  CheckCircle2,
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import { GuruAbsensiMandiri } from './GuruAbsensiMandiri';
import { GuruAbsensiSiswa } from './GuruAbsensiSiswa';
import { GuruBankSoal } from './GuruBankSoal';
import { GuruLiveMonitor } from './GuruLiveMonitor';

interface GuruDashboardProps {
  onOpenFaceScannerForUser: (user: User) => void;
}

export const GuruDashboard: React.FC<GuruDashboardProps> = ({
  onOpenFaceScannerForUser,
}) => {
  const { currentUser, exams, students } = useApp();

  const [activeTab, setActiveTab] = useState<'absensi_mandiri' | 'absensi_siswa' | 'bank_soal' | 'live_monitor'>('absensi_mandiri');

  if (!currentUser) return null;

  return (
    <div className="space-y-6">
      {/* Sub Navigation Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('absensi_mandiri')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'absensi_mandiri'
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ScanFace className="w-4 h-4 text-emerald-400" />
          Absensi Mandiri (Wajah & GPS)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('absensi_siswa')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'absensi_siswa'
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Presensi Siswa ({students.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bank_soal')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'bank_soal'
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Buat Soal & Bank Soal
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('live_monitor')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'live_monitor'
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Eye className="w-4 h-4 text-emerald-400" />
          Monitoring Ujian & Anti-Curang
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'absensi_mandiri' && (
        <GuruAbsensiMandiri
          onOpenFaceScanner={() => onOpenFaceScannerForUser(currentUser)}
        />
      )}

      {activeTab === 'absensi_siswa' && (
        <GuruAbsensiSiswa
          onOpenFaceScannerForStudent={(student) => onOpenFaceScannerForUser(student)}
        />
      )}

      {activeTab === 'bank_soal' && <GuruBankSoal />}

      {activeTab === 'live_monitor' && <GuruLiveMonitor />}
    </div>
  );
};

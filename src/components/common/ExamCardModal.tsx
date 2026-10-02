import React, { useRef } from 'react';
import { User, Exam } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  QrCode,
  FileBadge,
  CheckCircle2,
} from 'lucide-react';

interface ExamCardModalProps {
  student: User;
  onClose: () => void;
}

export const ExamCardModal: React.FC<ExamCardModalProps> = ({ student, onClose }) => {
  const { exams, schoolInfo } = useApp();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const participantNumber = `SPN-26-${student.biodata.identifier || '0087654321'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header (Hidden on Print) */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileBadge className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Kartu Peserta Ujian SISPENA CBT
              </h3>
              <p className="text-[11px] text-slate-400">
                SMP IT Sindangprabu · Dokumen Resmi Ujian
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Download PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Card Body - Printable Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-950 flex items-center justify-center">
          <div
            ref={printRef}
            id="printable-exam-card"
            className="w-full max-w-xl bg-white text-slate-900 rounded-xl p-6 shadow-xl border-2 border-slate-300 font-sans space-y-4 print:m-0 print:p-6 print:border-none print:shadow-none"
          >
            {/* Kop Surat Sekolah */}
            <div className="flex items-center gap-4 pb-3 border-b-2 border-slate-800">
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-emerald-800 p-0.5 bg-emerald-700">
                <img
                  src="/src/assets/images/school_smp_it_sindangprabu_1790860506326.jpg"
                  alt="Logo SMP IT Sindangprabu"
                  className="w-full h-full object-cover rounded-[10px]"
                />
              </div>

              <div className="flex-1 text-center">
                <span className="block text-[11px] font-bold tracking-widest text-emerald-800 uppercase">
                  YAYASAN PENDIDIKAN ISLAM SINDANGPRABU
                </span>
                <h1 className="text-base font-extrabold text-slate-950 uppercase tracking-tight">
                  SMP IT SINDANGPRABU
                </h1>
                <p className="text-[10px] text-slate-600 leading-tight">
                  {schoolInfo.address}
                </p>
                <div className="text-[10px] font-bold text-slate-800 mt-1 uppercase tracking-wider bg-slate-100 py-0.5 rounded border border-slate-300">
                  KARTU PESERTA ASESMEN BERBASIS KOMPUTER (SISPENA CBT)
                </div>
              </div>
            </div>

            {/* Student Info & Photo Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pt-1">
              {/* Photo Box */}
              <div className="flex flex-col items-center shrink-0">
                <div className="relative w-24 h-32 rounded-lg border-2 border-slate-400 overflow-hidden bg-slate-100 shadow-sm">
                  <img
                    src={student.biodata.photoUrl || '/src/assets/images/admin_rifky_ardiansyah_1790860491868.jpg'}
                    alt={student.biodata.fullName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {student.biodata.faceRegistered && (
                    <div className="absolute bottom-0 inset-x-0 bg-emerald-800 text-white text-[8px] font-bold text-center py-0.5">
                      BIO-VERIFIED
                    </div>
                  )}
                </div>
                <span className="text-[9px] font-mono text-slate-500 mt-1">
                  PAS FOTO 3X4
                </span>
              </div>

              {/* Biodata Table */}
              <div className="flex-1 w-full text-xs space-y-1.5">
                <div className="grid grid-cols-3 gap-1 py-0.5 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">No. Peserta CBT</span>
                  <span className="col-span-2 font-mono font-bold text-emerald-800">
                    : {participantNumber}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 py-0.5 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Nama Siswa</span>
                  <span className="col-span-2 font-bold text-slate-900 uppercase">
                    : {student.biodata.fullName}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 py-0.5 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">NISN</span>
                  <span className="col-span-2 font-mono text-slate-900">
                    : {student.biodata.identifier}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 py-0.5 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Kelas / Rombel</span>
                  <span className="col-span-2 text-slate-900 font-semibold">
                    : {student.biodata.className || 'Kelas 9A'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 py-0.5 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Ruang / Server</span>
                  <span className="col-span-2 text-slate-900">
                    : Lab Komputer 1 / Server CBT
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 py-0.5">
                  <span className="text-slate-500 font-medium">Status Biometrik</span>
                  <span className="col-span-2 text-slate-900 font-semibold flex items-center gap-1">
                    : {student.biodata.faceRegistered ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
                        Wajah Terdaftar (Siap Ujian)
                      </span>
                    ) : (
                      <span className="text-amber-700">Wajah Belum Terdaftar</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Mata Pelajaran Ujian Table */}
            <div className="pt-2">
              <span className="block text-[11px] font-bold text-slate-800 uppercase tracking-wide mb-1">
                Jadwal Ujian yang Diikuti:
              </span>
              <table className="w-full text-left text-[11px] border border-slate-300">
                <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                  <tr>
                    <th className="py-1 px-2 border-r border-slate-300 text-center w-8">No</th>
                    <th className="py-1 px-2 border-r border-slate-300">Mata Pelajaran</th>
                    <th className="py-1 px-2 border-r border-slate-300">Sesi & Jam</th>
                    <th className="py-1 px-2 text-center">Durasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {exams.slice(0, 3).map((ex, idx) => (
                    <tr key={ex.id}>
                      <td className="py-1 px-2 border-r border-slate-300 text-center font-mono font-bold">
                        {idx + 1}
                      </td>
                      <td className="py-1 px-2 border-r border-slate-300 font-semibold text-slate-900">
                        {ex.title}
                      </td>
                      <td className="py-1 px-2 border-r border-slate-300 text-slate-700">
                        07:30 - Selesai
                      </td>
                      <td className="py-1 px-2 text-center font-mono text-slate-800">
                        {ex.durationMinutes} Menit
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Verification Footer with Digital Stamp & Signature */}
            <div className="pt-3 border-t border-slate-300 flex items-center justify-between text-xs">
              {/* QR Verification */}
              <div className="flex items-center gap-2">
                <div className="w-16 h-16 p-1 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center">
                  {/* Decorative QR vector */}
                  <svg viewBox="0 0 100 100" className="w-full h-full text-slate-800" fill="currentColor">
                    <rect x="0" y="0" width="30" height="30" rx="3" fill="#1e293b" />
                    <rect x="5" y="5" width="20" height="20" fill="white" />
                    <rect x="10" y="10" width="10" height="10" fill="#1e293b" />
                    <rect x="70" y="0" width="30" height="30" rx="3" fill="#1e293b" />
                    <rect x="75" y="5" width="20" height="20" fill="white" />
                    <rect x="80" y="10" width="10" height="10" fill="#1e293b" />
                    <rect x="0" y="70" width="30" height="30" rx="3" fill="#1e293b" />
                    <rect x="5" y="75" width="20" height="20" fill="white" />
                    <rect x="10" y="80" width="10" height="10" fill="#1e293b" />
                    <rect x="40" y="10" width="10" height="20" fill="#1e293b" />
                    <rect x="50" y="40" width="20" height="10" fill="#1e293b" />
                    <rect x="35" y="45" width="10" height="10" fill="#1e293b" />
                    <rect x="45" y="70" width="15" height="15" fill="#1e293b" />
                    <rect x="70" y="70" width="20" height="10" fill="#1e293b" />
                  </svg>
                </div>
                <div className="text-[10px] text-slate-500 leading-tight">
                  <span className="block font-bold text-slate-800">Verifikasi Resmi</span>
                  <span>SISPENA CBT Cloud</span>
                  <span className="block font-mono text-emerald-800">VALID-SECURE</span>
                </div>
              </div>

              {/* Tanda Tangan & Cap Administrator Server CBT: Rifky Ardiansyah, S.Kom. */}
              <div className="text-center relative">
                <span className="block text-[10px] text-slate-600">
                  Sindangprabu, 1 Oktober 2026
                </span>
                <span className="block text-[10px] font-semibold text-slate-800">
                  Kepala Pusat Data & Server CBT,
                </span>

                {/* Simulated Official Stamp & Signature */}
                <div className="relative my-1 flex items-center justify-center h-12">
                  {/* Stamp circular SVG watermark */}
                  <div className="absolute w-14 h-14 rounded-full border-2 border-blue-600/70 text-blue-700/80 flex items-center justify-center -rotate-12 pointer-events-none">
                    <span className="text-[7px] font-bold text-center uppercase tracking-tighter leading-tight">
                      ★ SMP IT ★<br />SINDANGPRABU<br />TERAKREDITASI
                    </span>
                  </div>

                  {/* Signature line / script font */}
                  <span className="font-serif italic font-extrabold text-blue-900 text-sm tracking-widest relative z-10">
                    Rifky Ardiansyah
                  </span>
                </div>

                <span className="block text-[11px] font-bold text-slate-900 underline">
                  Rifky Ardiansyah, S.Kom.
                </span>
                <span className="block text-[9px] font-mono text-slate-600">
                  NIP. 199508122020011002
                </span>
              </div>
            </div>

            {/* Note */}
            <div className="pt-2 text-[9px] text-slate-500 text-center italic border-t border-dashed border-slate-300">
              * Kartu ini adalah tanda bukti sah keikutsertaan ujian CBT SMP IT Sindangprabu. Harap dibawa saat memasuki ruang ujian.
            </div>
          </div>
        </div>

        {/* Footer info (Hidden on Print) */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400 print:hidden">
          <span>Tips: Anda dapat memilih "Save as PDF" di menu printer.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-slate-300 hover:text-white rounded-lg bg-slate-800 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

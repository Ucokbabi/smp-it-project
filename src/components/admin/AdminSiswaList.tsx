import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import {
  GraduationCap,
  Plus,
  Trash2,
  ScanFace,
  Edit,
  Search,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  FileBadge,
  Printer,
  Download,
} from 'lucide-react';
import { ExamCardModal } from '../common/ExamCardModal';

interface AdminSiswaListProps {
  onOpenFaceScan: (user: User) => void;
  onOpenEditBiodata: (user: User) => void;
}

export const AdminSiswaList: React.FC<AdminSiswaListProps> = ({
  onOpenFaceScan,
  onOpenEditBiodata,
}) => {
  const { students, addUser, deleteUser, deleteUserFace } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudentForCard, setSelectedStudentForCard] = useState<User | null>(null);

  // New student form state
  const [newFullName, setNewFullName] = useState('');
  const [newNisn, setNewNisn] = useState('');
  const [newClass, setNewClass] = useState('Kelas 9A (Tahfidz Sains)');
  const [newGender, setNewGender] = useState<'L' | 'P'>('L');

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.biodata.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.biodata.identifier.includes(searchTerm);
    const matchClass =
      selectedClass === 'all' || s.biodata.className?.includes(selectedClass);
    return matchSearch && matchClass;
  });

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newNisn) return;

    const newStudent: User = {
      id: `usr-siswa-${Date.now()}`,
      username: `siswa_${newNisn.slice(-4)}`,
      role: 'siswa',
      biodata: {
        fullName: newFullName,
        identifier: newNisn,
        email: `${newNisn}@siswa.smpitsindangprabu.sch.id`,
        phone: '0812-0000-0000',
        address: 'Sindangprabu, Garut, Jawa Barat',
        birthPlace: 'Garut',
        birthDate: '2011-01-01',
        gender: newGender,
        className: newClass,
        photoUrl:
          newGender === 'L'
            ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&fit=crop&crop=face'
            : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face',
        faceRegistered: false,
      },
    };

    addUser(newStudent);
    setShowAddModal(false);
    setNewFullName('');
    setNewNisn('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-emerald-400" />
            Manajemen Data Siswa SMP IT Sindangprabu
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola data peserta didik, biodata lengkap, dan biometrik wajah untuk verifikasi ujian SISPENA CBT.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          {students.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedStudentForCard(filteredStudents[0] || students[0])}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Cetak Kartu Ujian</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Siswa Baru
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama siswa atau NISN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="all">Semua Kelas</option>
          <option value="Kelas 9A">Kelas 9A</option>
          <option value="Kelas 9B">Kelas 9B</option>
          <option value="Kelas 8">Kelas 8</option>
          <option value="Kelas 7">Kelas 7</option>
        </select>
      </div>

      {/* Students Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Siswa</th>
                <th className="py-3 px-4">NISN</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4 text-center">Biometrik Wajah</th>
                <th className="py-3 px-4 text-center">Menu Wajah & Tindakan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Tidak ada siswa ditemukan yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((siswa) => (
                  <tr key={siswa.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Siswa Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={siswa.biodata.photoUrl || '/src/assets/images/admin_rifky_ardiansyah_1790860491868.jpg'}
                          alt={siswa.biodata.fullName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-700"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <span className="font-semibold text-slate-200 block text-xs">
                            {siswa.biodata.fullName}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {siswa.biodata.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* NISN */}
                    <td className="py-3 px-4 font-mono font-medium text-slate-300">
                      {siswa.biodata.identifier}
                    </td>

                    {/* Kelas */}
                    <td className="py-3 px-4 text-slate-300">
                      {siswa.biodata.className || 'Kelas 9A'}
                    </td>

                    {/* Face Recognition Status */}
                    <td className="py-3 px-4 text-center">
                      {siswa.biodata.faceRegistered ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Terdaftar
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <AlertCircle className="w-3 h-3 text-amber-400" />
                          Belum Ada
                        </span>
                      )}
                    </td>

                    {/* Menu Wajah & Tombol Delete Wajah */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenFaceScan(siswa)}
                          title="Pindai Wajah Siswa"
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <ScanFace className="w-3.5 h-3.5 text-emerald-400" />
                          Scan
                        </button>

                        {/* Dedicated Delete Wajah button as required by prompt */}
                        {siswa.biodata.faceRegistered && (
                          <button
                            type="button"
                            onClick={() => deleteUserFace(siswa.id)}
                            title="Hapus Data Biometrik Wajah Siswa"
                            className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete Wajah
                          </button>
                        )}
                      </div>
                    </td>

                    {/* General Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedStudentForCard(siswa)}
                          title="Lihat & Download Kartu Ujian Siswa"
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-emerald-950/60 text-slate-300 hover:text-emerald-300 border border-slate-700 hover:border-emerald-600/50 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <FileBadge className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Kartu Ujian</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenEditBiodata(siswa)}
                          title="Buka & Edit Biodata"
                          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4 text-slate-300" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus data siswa ${siswa.biodata.fullName}?`)) {
                              deleteUser(siswa.id);
                            }
                          }}
                          title="Hapus Siswa dari Database"
                          className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              Tambah Data Siswa Baru
            </h3>
            <p className="text-xs text-slate-400">
              SMP IT Sindangprabu · Masukkan informasi dasar siswa
            </p>

            <form onSubmit={handleAddStudent} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Lengkap Siswa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Azzam"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  NISN (10 Digit) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="0087654399"
                  value={newNisn}
                  onChange={(e) => setNewNisn(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kelas
                  </label>
                  <select
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Kelas 9A (Tahfidz Sains)">Kelas 9A (Tahfidz Sains)</option>
                    <option value="Kelas 9B (Teknologi Islam)">Kelas 9B (Teknologi Islam)</option>
                    <option value="Kelas 8A (Tahfidz)">Kelas 8A (Tahfidz)</option>
                    <option value="Kelas 7A (Sains IT)">Kelas 7A (Sains IT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as 'L' | 'P')}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
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
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Exam Card Modal for Admin */}
      {selectedStudentForCard && (
        <ExamCardModal
          student={selectedStudentForCard}
          onClose={() => setSelectedStudentForCard(null)}
        />
      )}
    </div>
  );
};

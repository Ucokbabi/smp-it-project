import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import {
  BookOpen,
  Plus,
  Trash2,
  ScanFace,
  Edit,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

interface AdminGuruListProps {
  onOpenFaceScan: (user: User) => void;
  onOpenEditBiodata: (user: User) => void;
}

export const AdminGuruList: React.FC<AdminGuruListProps> = ({
  onOpenFaceScan,
  onOpenEditBiodata,
}) => {
  const { teachers, addUser, deleteUser, deleteUserFace } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New teacher form state
  const [newFullName, setNewFullName] = useState('');
  const [newNip, setNewNip] = useState('');
  const [newSubject, setNewSubject] = useState('Informatika');
  const [newGender, setNewGender] = useState<'L' | 'P'>('L');

  const filteredTeachers = teachers.filter((t) => {
    return (
      t.biodata.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.biodata.identifier.includes(searchTerm) ||
      (t.biodata.subject && t.biodata.subject.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newNip) return;

    const newTeacher: User = {
      id: `usr-guru-${Date.now()}`,
      username: `guru_${newNip.slice(-4)}`,
      role: 'guru',
      biodata: {
        fullName: newFullName,
        identifier: newNip,
        email: `${newNip}@smpitsindangprabu.sch.id`,
        phone: '0812-3344-5566',
        address: 'Sindangprabu, Garut, Jawa Barat',
        birthPlace: 'Garut',
        birthDate: '1990-01-01',
        gender: newGender,
        subject: newSubject,
        position: `Guru Pengampu ${newSubject}`,
        photoUrl:
          newGender === 'L'
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face'
            : '/src/assets/images/teacher_avatar_female_1790860518753.jpg',
        faceRegistered: false,
      },
    };

    addUser(newTeacher);
    setShowAddModal(false);
    setNewFullName('');
    setNewNip('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-400" />
            Manajemen Dewan Guru SMP IT Sindangprabu
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola data ustaz & ustazah, NIP, pengampu mata pelajaran, serta data biometrik presensi mandiri.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-md self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tambah Guru Baru
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Cari berdasarkan nama guru, NIP, atau mata pelajaran..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Teachers Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Guru / Pendidik</th>
                <th className="py-3 px-4">NIP / NUPTK</th>
                <th className="py-3 px-4">Mata Pelajaran</th>
                <th className="py-3 px-4 text-center">Biometrik Wajah</th>
                <th className="py-3 px-4 text-center">Menu Wajah & Tindakan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Tidak ada guru ditemukan yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((guru) => (
                  <tr key={guru.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Guru Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={guru.biodata.photoUrl || '/src/assets/images/teacher_avatar_female_1790860518753.jpg'}
                          alt={guru.biodata.fullName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-700"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <span className="font-semibold text-slate-200 block text-xs">
                            {guru.biodata.fullName}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {guru.biodata.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* NIP */}
                    <td className="py-3 px-4 font-mono font-medium text-slate-300">
                      {guru.biodata.identifier}
                    </td>

                    {/* Mata Pelajaran */}
                    <td className="py-3 px-4 text-slate-200 font-medium">
                      {guru.biodata.subject || 'Pendidik'}
                    </td>

                    {/* Face Recognition Status */}
                    <td className="py-3 px-4 text-center">
                      {guru.biodata.faceRegistered ? (
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
                          onClick={() => onOpenFaceScan(guru)}
                          title="Pindai Wajah Guru"
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <ScanFace className="w-3.5 h-3.5 text-blue-400" />
                          Scan
                        </button>

                        {/* Dedicated Delete Wajah button as required by prompt */}
                        {guru.biodata.faceRegistered && (
                          <button
                            type="button"
                            onClick={() => deleteUserFace(guru.id)}
                            title="Hapus Data Biometrik Wajah Guru"
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
                          onClick={() => onOpenEditBiodata(guru)}
                          title="Buka & Edit Biodata"
                          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4 text-slate-300" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus guru ${guru.biodata.fullName}?`)) {
                              deleteUser(guru.id);
                            }
                          }}
                          title="Hapus Guru dari Database"
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

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              Tambah Guru / Pendidik Baru
            </h3>
            <p className="text-xs text-slate-400">
              SMP IT Sindangprabu · Masukkan informasi data pengajar
            </p>

            <form onSubmit={handleAddTeacher} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Lengkap & Gelar *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ustadzah Nurul Hidayah, S.Pd"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  NIP / NUPTK *
                </label>
                <input
                  type="text"
                  required
                  placeholder="199201012020012001"
                  value={newNip}
                  onChange={(e) => setNewNip(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
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
                    placeholder="Contoh: Bahasa Arab"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as 'L' | 'P')}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-blue-500"
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
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded shadow cursor-pointer"
                >
                  Simpan Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

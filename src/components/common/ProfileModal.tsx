import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserBiodata } from '../../types';
import {
  X,
  User as UserIcon,
  Camera,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Save,
  ScanFace,
  MapPin,
  Calendar,
  Phone,
  Mail,
  FileBadge,
} from 'lucide-react';

interface ProfileModalProps {
  onOpenFaceScanner?: (user: User) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ onOpenFaceScanner }) => {
  const {
    isProfileModalOpen,
    profileModalTargetUser,
    closeProfileModal,
    updateUser,
    deleteUserFace,
    currentUser,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const targetUser = profileModalTargetUser || currentUser;

  // Local form state
  const [formData, setFormData] = useState<UserBiodata | null>(() => {
    return targetUser ? { ...targetUser.biodata } : null;
  });

  const [activeTab, setActiveTab] = useState<'biodata' | 'biometrik'>('biodata');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sync if target user changes
  React.useEffect(() => {
    if (targetUser) {
      setFormData({ ...targetUser.biodata });
    }
  }, [targetUser]);

  if (!isProfileModalOpen || !targetUser || !formData) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) =>
            prev ? { ...prev, photoUrl: reader.result as string } : prev
          );
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBiodata = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    const updatedUser: User = {
      ...targetUser,
      biodata: formData,
    };

    updateUser(updatedUser);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2500);
  };

  const handleDeleteFaceData = () => {
    deleteUserFace(targetUser.id);
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            faceRegistered: false,
            facePhotoUrl: undefined,
            faceRegisteredAt: undefined,
            faceEmbeddingHash: undefined,
          }
        : prev
    );
    setShowDeleteConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Profil & Isi Biodata
              </h2>
              <p className="text-xs text-slate-400">
                SMP IT Sindangprabu · {targetUser.role.toUpperCase()}
              </p>
            </div>
          </div>

          <button
            onClick={closeProfileModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/50">
          <button
            onClick={() => setActiveTab('biodata')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'biodata'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Formulir Biodata Lengkap
          </button>
          <button
            onClick={() => setActiveTab('biometrik')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'biometrik'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ScanFace className="w-4 h-4" />
            Pengenalan Wajah & Foto
            {formData.faceRegistered ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {saveSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Data biodata dan profil berhasil disimpan ke sistem!</span>
            </div>
          )}

          {activeTab === 'biodata' ? (
            <form onSubmit={handleSaveBiodata} className="space-y-5">
              {/* Profile Card Header with Photo */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="relative group">
                  <img
                    src={formData.photoUrl || '/src/assets/images/admin_rifky_ardiansyah_1790860491868.jpg'}
                    alt={formData.fullName}
                    className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500/60 shadow-md"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg transition-colors cursor-pointer"
                    title="Ubah Foto Profil"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileUpload}
                    className="hidden"
                  />
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {formData.fullName}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {targetUser.role === 'siswa'
                          ? `NISN: ${formData.identifier} · ${formData.className || 'Kelas 9'}`
                          : `NIP: ${formData.identifier} · ${formData.subject || formData.position || 'Staff Pengajar'}`}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors self-center sm:self-auto cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                      Ubah Gambar
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Format foto yang didukung: JPG, PNG, WEBP (Rasio 1:1 direkomendasikan).
                  </p>
                </div>
              </div>

              {/* Biodata Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nama Lengkap */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nama Lengkap & Gelar *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      placeholder="Masukkan nama lengkap"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Nomor Identitas (NIP / NISN) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {targetUser.role === 'siswa' ? 'NISN (Nomor Induk Siswa Nasional)' : 'NIP / NUPTK'} *
                  </label>
                  <div className="relative">
                    <FileBadge className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      name="identifier"
                      value={formData.identifier}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Email Sekolah */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Resmi Sekolah *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Nomor Telepon / WhatsApp */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    No. Handphone / WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="0812-xxxx-xxxx"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Tempat & Tanggal Lahir */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Tempat Lahir
                  </label>
                  <input
                    type="text"
                    name="birthPlace"
                    value={formData.birthPlace}
                    onChange={handleInputChange}
                    placeholder="Contoh: Garut"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Tanggal Lahir
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Jenis Kelamin */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Jenis Kelamin
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                {/* Role Specific Field */}
                <div>
                  {targetUser.role === 'siswa' && (
                    <>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Kelas
                      </label>
                      <input
                        type="text"
                        name="className"
                        value={formData.className || ''}
                        onChange={handleInputChange}
                        placeholder="Contoh: Kelas 9A (Tahfidz Sains)"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </>
                  )}

                  {targetUser.role === 'guru' && (
                    <>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Mata Pelajaran yang Diampu
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject || ''}
                        onChange={handleInputChange}
                        placeholder="Contoh: Informatika / PAI"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </>
                  )}

                  {targetUser.role === 'admin' && (
                    <>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Posisi / Jabatan
                      </label>
                      <input
                        type="text"
                        name="position"
                        value={formData.position || ''}
                        onChange={handleInputChange}
                        placeholder="Kepala Pusat Data & Server CBT"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </>
                  )}
                </div>

                {/* Alamat Domisili */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Alamat Lengkap Domisili
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <textarea
                      name="address"
                      rows={2}
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Masukkan alamat rumah lengkap..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={closeProfileModal}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Simpan Perubahan Biodata
                </button>
              </div>
            </form>
          ) : (
            /* Tab Pengenalan Wajah & Biometrik */
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  {formData.faceRegistered && formData.facePhotoUrl ? (
                    <img
                      src={formData.facePhotoUrl}
                      alt="Wajah Terdaftar"
                      className="w-28 h-28 rounded-2xl object-cover border-2 border-emerald-500 shadow-lg"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-2xl bg-slate-800 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500">
                      <ScanFace className="w-10 h-10 text-slate-600 mb-1" />
                      <span className="text-[10px]">Belum Ada</span>
                    </div>
                  )}

                  {formData.faceRegistered && (
                    <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold shadow">
                      Aktif
                    </span>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left space-y-2">
                  <h4 className="text-base font-bold text-white flex items-center justify-center md:justify-start gap-2">
                    Status Biometrik Wajah
                    {formData.faceRegistered ? (
                      <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Terverifikasi
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        Belum Terdaftar
                      </span>
                    )}
                  </h4>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Data wajah digunakan untuk verifikasi absensi mandiri guru di lokasi SMP IT Sindangprabu, serta pengawasan biometrik siswa selama ujian berlangsung di SISPENA CBT.
                  </p>

                  {formData.faceRegistered && (
                    <div className="text-[11px] text-slate-500 space-y-0.5">
                      <p>Waktu Pendaftaran: <span className="text-slate-300 font-mono">{formData.faceRegisteredAt || 'Aktif'}</span></p>
                      <p>Hash Enkripsi: <span className="text-emerald-400 font-mono">{formData.faceEmbeddingHash || 'HASH_SECURE_TOKEN_OK'}</span></p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons for Biometric Face Data */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Tindakan Manajemen Biometrik Wajah
                </h5>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenFaceScanner) {
                        onOpenFaceScanner(targetUser);
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    {formData.faceRegistered ? 'Pindai Ulang Wajah (Webcam)' : 'Pindai & Daftarkan Wajah'}
                  </button>

                  {/* Tombol Delete / Hapus Wajah - As requested in prompt:
                      "tambahkan tombol delete di menu wajah guru dan siswa di 3 role tersebut" */}
                  {formData.faceRegistered && (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:border-rose-500/50 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      Hapus Data Wajah
                    </button>
                  )}
                </div>

                {/* Delete Confirmation Warning */}
                {showDeleteConfirm && (
                  <div className="p-4 rounded-lg bg-rose-950/40 border border-rose-800/80 space-y-3 animate-in fade-in">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-rose-200">
                          Konfirmasi Penghapusan Rekaman Wajah
                        </p>
                        <p className="text-xs text-rose-300/80 mt-1">
                          Apakah Anda yakin ingin menghapus data biometrik wajah {targetUser.biodata.fullName}? Tindakan ini akan mencabut izin verifikasi absensi otomatis dan pengenalan wajah ujian sampai wajah didaftarkan ulang.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-3 py-1.5 text-xs text-slate-300 hover:text-white rounded bg-slate-800 cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteFaceData}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Ya, Hapus Data Wajah
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

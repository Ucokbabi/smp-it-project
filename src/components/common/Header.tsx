import React from 'react';
import { useApp } from '../../context/AppContext';
import { LogOut, UserCheck, Shield, BookOpen, GraduationCap } from 'lucide-react';

interface HeaderProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const { currentUser, logout, openProfileModal } = useApp();

  if (!currentUser) return null;

  const getRoleBadge = () => {
    switch (currentUser.role) {
      case 'admin':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            Server Administrator
          </span>
        );
      case 'guru':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-950 text-blue-300 border border-blue-800/60">
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            Guru Pengampu
          </span>
        );
      case 'siswa':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-800/60">
            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
            Peserta Ujian
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Zone - Clean single-line mark without AI word */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 p-0.5 flex items-center justify-center shadow-md shadow-emerald-900/20 overflow-hidden shrink-0">
            <img
              src="/src/assets/images/school_smp_it_sindangprabu_1790860506326.jpg"
              alt="Logo SMP IT Sindangprabu"
              className="w-full h-full object-cover rounded-[10px]"
              onError={(e) => {
                // fallback styled icon
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white font-sans">
                SISPENA CBT
              </span>
              <span className="text-xs text-emerald-400 font-medium hidden sm:inline-block">
                SMP IT Sindangprabu
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal leading-none hidden sm:block">
              smart system SMP IT SindangPrabu
            </p>
          </div>
        </div>

        {/* Right Zone: User Profile button (Clickable to open Isi Biodata) & Logout */}
        <div className="flex items-center gap-3">
          {/* Clickable Profile Button */}
          <button
            onClick={() => openProfileModal(currentUser)}
            type="button"
            title="Klik untuk membuka Biodata dan Ubah Profil"
            className="group flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 transition-all text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <div className="relative">
              <img
                src={currentUser.biodata.photoUrl || '/src/assets/images/admin_rifky_ardiansyah_1790860491868.jpg'}
                alt={currentUser.biodata.fullName}
                className="w-9 h-9 rounded-full object-cover border border-slate-600 group-hover:border-emerald-400 transition-colors"
                referrerPolicy="no-referrer"
              />
              {currentUser.biodata.faceRegistered && (
                <span
                  title="Biometrik Wajah Aktif"
                  className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full flex items-center justify-center"
                >
                  <UserCheck className="w-2 h-2 text-white" />
                </span>
              )}
            </div>

            <div className="hidden md:block">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors max-w-[180px] truncate">
                  {currentUser.biodata.fullName}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                {getRoleBadge()}
                <span className="text-[10px] text-slate-400 group-hover:text-slate-300">
                  (Klik Profil)
                </span>
              </div>
            </div>
          </button>

          {/* Logout Action */}
          <button
            onClick={logout}
            type="button"
            title="Keluar dari Akun"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-rose-950/60 hover:text-rose-400 border border-slate-700/80 hover:border-rose-700/60 text-slate-400 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

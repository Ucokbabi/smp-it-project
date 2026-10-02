import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Shield,
  BookOpen,
  GraduationCap,
  LogIn,
  CheckCircle,
  KeyRound,
  User as UserIcon,
  MapPin,
  Lock,
  ShieldAlert,
  AlertTriangle,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { users, loginAs, urlSecurityAlert, clearUrlSecurityAlert } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Switch tabs & fill default credentials
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg(null);
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else if (role === 'guru') {
      setUsername('guru_siti');
      setPassword('guru123');
    } else if (role === 'siswa') {
      setUsername('siswa_muhammad');
      setPassword('siswa123');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedUsername = username.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // Check if user exists in the system
    const matchedUser = users.find(
      (u) =>
        u.username.toLowerCase() === trimmedUsername ||
        u.biodata.identifier === trimmedUsername
    );

    if (!matchedUser) {
      setErrorMsg(`Identitas akun / username '${username}' tidak terdaftar di sistem SMP IT Sindangprabu.`);
      return;
    }

    // Role check: Ensure user cannot login into another role
    if (matchedUser.role !== selectedRole) {
      setErrorMsg(
        `Akses Ditolak: Akun '${matchedUser.biodata.fullName}' terdaftar sebagai ${matchedUser.role.toUpperCase()}, bukan ${selectedRole.toUpperCase()}. Silakan pilih tab peran yang sesuai.`
      );
      return;
    }

    // Password verification
    const expectedPassword =
      selectedRole === 'admin' ? 'admin123' : selectedRole === 'guru' ? 'guru123' : 'siswa123';

    if (trimmedPassword !== expectedPassword) {
      setErrorMsg('Kata sandi yang Anda masukkan salah. Akses sistem ditolak.');
      return;
    }

    // Authenticated successfully
    loginAs(matchedUser);
  };

  // Quick switch demo user helper
  const handleQuickLogin = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      loginAs(target);
    }
  };

  const currentRoleUsers = users.filter((u) => u.role === selectedRole);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950">
      {/* Top minimal bar */}
      <div className="border-b border-slate-900 bg-slate-950/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 p-0.5 flex items-center justify-center shadow-md">
            <img
              src="/src/assets/images/school_smp_it_sindangprabu_1790860506326.jpg"
              alt="Logo SMP IT Sindangprabu"
              className="w-full h-full object-cover rounded-[10px]"
            />
          </div>
          <div>
            <span className="font-bold text-white text-base tracking-tight font-sans">
              SISPENA CBT
            </span>
            <span className="text-xs text-emerald-400 font-medium ml-2">
              SMP IT Sindangprabu
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-emerald-400 font-mono">
            <Lock className="w-3 h-3 text-emerald-500" />
            <span>ENCRYPTED PORTAL</span>
          </div>

          <a
            href="https://maps.app.goo.gl/pjSkS4FFqpVJUtB46?g_st=iw"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
            <span>Sindangprabu, Garut</span>
          </a>
        </div>
      </div>

      {/* Main Login Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 my-6 max-w-lg mx-auto w-full space-y-4">
        {/* URL Bypassing / Security Guard Alert Banner */}
        {urlSecurityAlert && (
          <div className="w-full p-4 rounded-xl bg-rose-950/70 border-2 border-rose-600/80 text-rose-200 text-xs shadow-lg space-y-2 animate-in fade-in">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-sm text-white">
                    Peringatan Keamanan Akses URL
                  </span>
                  <p className="text-rose-200 leading-relaxed mt-0.5">
                    {urlSecurityAlert}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={clearUrlSecurityAlert}
                className="text-rose-400 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Card */}
          <div className="p-6 text-center border-b border-slate-800 bg-slate-900/60 relative">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-3 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Portal Akses SISPENA CBT
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              SMP IT Sindangprabu · Autentikasi Wajib Sebelum Masuk Sistem
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-[10px] text-slate-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Akses Langsung via URL Diblokir Firewall
            </div>
          </div>

          {/* 3 Role Selection Tabs */}
          <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1.5">
            <button
              type="button"
              onClick={() => handleRoleSelect('admin')}
              className={`py-2 px-1 text-xs font-semibold rounded-lg flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                selectedRole === 'admin'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('guru')}
              className={`py-2 px-1 text-xs font-semibold rounded-lg flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                selectedRole === 'guru'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Guru</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('siswa')}
              className={`py-2 px-1 text-xs font-semibold rounded-lg flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                selectedRole === 'siswa'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Siswa</span>
            </button>
          </div>

          {/* Login Form */}
          <div className="p-6 space-y-5">
            {errorMsg && (
              <div className="p-3.5 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {selectedRole === 'siswa'
                    ? 'NISN / Username Siswa'
                    : selectedRole === 'guru'
                    ? 'NIP / Username Guru'
                    : 'Username Admin'}
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Masukkan username atau ID"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Kata Sandi
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Default: {selectedRole}123
                  </span>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 focus:outline-none transition-colors cursor-pointer"
                    title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-slate-400 hover:text-slate-200" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                Masuk Sebagai {selectedRole.toUpperCase()}
              </button>
            </form>

            {/* Quick Demo Selector for evaluation */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Pilih Akun Demo {selectedRole.toUpperCase()}:
                </span>
                <span className="text-[10px] text-slate-500">
                  Password: {selectedRole}123
                </span>
              </div>
              <div className="space-y-1.5">
                {currentRoleUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickLogin(u.id)}
                    className="w-full text-left p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <img
                        src={u.biodata.photoUrl || '/src/assets/images/admin_rifky_ardiansyah_1790860491868.jpg'}
                        alt={u.biodata.fullName}
                        className="w-6 h-6 rounded-full object-cover shrink-0"
                      />
                      <div className="truncate text-xs">
                        <span className="font-semibold text-slate-200 block truncate">
                          {u.biodata.fullName}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {u.biodata.identifier} {u.biodata.className ? `· ${u.biodata.className}` : ''}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 shrink-0">
                      Login Cepat &rarr;
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer text required by user */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <p className="font-medium text-slate-400">
          smart system SMP IT SindangPrabu
        </p>
        <p className="text-[11px] text-slate-600 mt-1">
          SISPENA CBT &copy; {new Date().getFullYear()} · SMP IT Sindangprabu Garut
        </p>
      </footer>
    </div>
  );
};


import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { LoginView } from './components/auth/LoginView';
import { ProfileModal } from './components/common/ProfileModal';
import { FaceScannerModal } from './components/common/FaceScannerModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { GuruDashboard } from './components/guru/GuruDashboard';
import { SiswaDashboard } from './components/siswa/SiswaDashboard';
import { User } from './types';

function MainAppContent() {
  const { currentUser, openProfileModal } = useApp();

  // Face scanner state
  const [faceScanTargetUser, setFaceScanTargetUser] = useState<User | null>(null);

  if (!currentUser) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {currentUser.role === 'admin' && (
          <AdminDashboard
            onOpenFaceScan={(user) => setFaceScanTargetUser(user)}
            onOpenEditBiodata={(user) => openProfileModal(user)}
          />
        )}

        {currentUser.role === 'guru' && (
          <GuruDashboard
            onOpenFaceScannerForUser={(user) => setFaceScanTargetUser(user)}
          />
        )}

        {currentUser.role === 'siswa' && (
          <SiswaDashboard
            onOpenFaceScanner={() => setFaceScanTargetUser(currentUser)}
          />
        )}
      </main>

      {/* Footer with specified text */}
      <Footer />

      {/* Profile & Isi Biodata Modal */}
      <ProfileModal
        onOpenFaceScanner={(user) => setFaceScanTargetUser(user)}
      />

      {/* Webcam Biometric Face Scanner Modal */}
      {faceScanTargetUser && (
        <FaceScannerModal
          user={faceScanTargetUser}
          onClose={() => setFaceScanTargetUser(null)}
          onSuccess={() => setFaceScanTargetUser(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

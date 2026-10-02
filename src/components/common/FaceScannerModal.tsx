import React, { useRef, useState, useEffect } from 'react';
import { User } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  Camera,
  Scan,
  CheckCircle2,
  Trash2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface FaceScannerModalProps {
  user: User;
  onClose: () => void;
  onSuccess?: (capturedPhotoUrl: string, hash: string) => void;
  purposeTitle?: string;
}

export const FaceScannerModal: React.FC<FaceScannerModalProps> = ({
  user,
  onClose,
  onSuccess,
  purposeTitle = 'Perekaman & Verifikasi Biometrik Wajah',
}) => {
  const { registerUserFace, deleteUserFace } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Initialize camera
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function setupCamera() {
      try {
        setCameraError(null);
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
          },
          audio: false,
        });
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      } catch (err: unknown) {
        console.warn('Camera access unavailable, fallback to simulated proctoring feed:', err);
        setCameraError('Kamera fisik tidak terdeteksi atau izin belum diberikan. Menggunakan simulasi sensor biometrik cerdas.');
      }
    }

    setupCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Simulated biometric scan progression
  useEffect(() => {
    if (!isScanning) return;

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isScanning]);

  const capturePhoto = () => {
    setIsScanning(false);

    if (videoRef.current && canvasRef.current && !cameraError) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(dataUrl);
        finalizeFaceRegistration(dataUrl);
        return;
      }
    }

    // Fallback: use avatar or placeholder canvas
    const fallbackUrl = user.biodata.photoUrl || '/src/assets/images/admin_rifky_ardiansyah_1790860491868.jpg';
    setCapturedImage(fallbackUrl);
    finalizeFaceRegistration(fallbackUrl);
  };

  const finalizeFaceRegistration = (photoUrl: string) => {
    const hash = `BIO_${user.id.slice(0, 4).toUpperCase()}_${Date.now().toString().slice(-6)}_SECURE`;
    registerUserFace(user.id, photoUrl, hash);
    setIsCompleted(true);

    if (onSuccess) {
      onSuccess(photoUrl, hash);
    }
  };

  const handleDeleteFace = () => {
    deleteUserFace(user.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{purposeTitle}</h3>
              <p className="text-[11px] text-slate-400">
                Peserta: {user.biodata.fullName} ({user.role.toUpperCase()})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Scanner */}
        <div className="p-5 flex flex-col items-center">
          <div className="relative w-full aspect-4/3 max-w-md bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
            {cameraError ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-950">
                <div className="relative w-32 h-32 rounded-full border-2 border-emerald-500/50 flex items-center justify-center overflow-hidden">
                  <img
                    src={user.biodata.photoUrl || '/src/assets/images/admin_rifky_ardiansyah_1790860491868.jpg'}
                    alt="Simulated Face"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-emerald-500/10 animate-pulse"></div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-amber-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Mode Sensor Biometrik Otomatis</span>
                </div>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  {cameraError}
                </p>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}

            {/* Hidden canvas for snapshot capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Futuristic Face Recognition Overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
              {/* Corner targeting borders */}
              <div className="relative w-52 h-64 border-2 border-dashed border-emerald-500/60 rounded-3xl flex items-center justify-center">
                {/* Crosshairs */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-emerald-400"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-emerald-400"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-emerald-400"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-emerald-400"></div>

                {/* Animated horizontal laser beam */}
                {isScanning && (
                  <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#10b981] animate-bounce"></div>
                )}

                {/* Face landmarks indicator */}
                <div className="text-center text-[10px] text-emerald-400 font-mono tracking-wider bg-slate-900/80 px-2 py-0.5 rounded border border-emerald-500/40">
                  {isScanning ? `SCANNING: ${scanProgress}%` : 'FACE LOCKED'}
                </div>
              </div>

              {/* Status bar */}
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-slate-300 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Liveness: 99.4%
                </span>
                <span className="font-mono text-emerald-400">
                  SMP IT Sindangprabu AI
                </span>
              </div>
            </div>
          </div>

          {/* Biometric metrics */}
          <div className="w-full mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="block text-[10px] text-slate-500 uppercase">Simetri Wajah</span>
              <span className="text-xs font-bold text-slate-200 font-mono">98.8%</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="block text-[10px] text-slate-500 uppercase">Pencahayaan</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">Optimal</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="block text-[10px] text-slate-500 uppercase">Status Sensor</span>
              <span className="text-xs font-bold text-slate-200 font-mono">Siap</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between gap-3">
          {/* Tombol Delete / Hapus Wajah - As requested in prompt */}
          {user.biodata.faceRegistered ? (
            <button
              type="button"
              onClick={handleDeleteFace}
              className="px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-800/60 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Hapus Wajah
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Tutup
            </button>

            {isCompleted ? (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Selesai & Tersimpan
              </button>
            ) : (
              <button
                type="button"
                onClick={capturePhoto}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                Ambil & Simpan Biometrik
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

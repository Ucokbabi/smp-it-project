import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, Navigation, ExternalLink, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface SindangprabuMapProps {
  onLocationUpdate?: (lat: number, lng: number, distance: number, isValid: boolean) => void;
  interactive?: boolean;
}

export const SindangprabuMap: React.FC<SindangprabuMapProps> = ({
  onLocationUpdate,
  interactive = true,
}) => {
  const { schoolInfo, calculateDistanceFromSchool } = useApp();

  // Teacher/User current location state (default to right inside the school yard)
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: -7.16105,
    lng: 107.95219,
  });

  const [distance, setDistance] = useState<number>(() =>
    calculateDistanceFromSchool(-7.16105, 107.95219)
  );

  const [isGettingGps, setIsGettingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const isWithinRadius = distance <= schoolInfo.maxRadiusMeters;

  // Notify parent on update
  useEffect(() => {
    if (onLocationUpdate) {
      onLocationUpdate(currentCoords.lat, currentCoords.lng, distance, isWithinRadius);
    }
  }, [currentCoords, distance, isWithinRadius, onLocationUpdate]);

  const requestRealGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Browser tidak mendukung Geolocation API.');
      return;
    }

    setIsGettingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const dist = calculateDistanceFromSchool(lat, lng);
        setCurrentCoords({ lat, lng });
        setDistance(dist);
        setIsGettingGps(false);
      },
      (err) => {
        setIsGettingGps(false);
        setGpsError(`Gagal mendapatkan sinyal GPS (${err.message}). Menggunakan koordinat area SMP IT Sindangprabu.`);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const simulateInsideSchool = () => {
    // Offset very close (approx 15-20 meters)
    const lat = schoolInfo.latitude + 0.00012;
    const lng = schoolInfo.longitude + 0.00008;
    const dist = calculateDistanceFromSchool(lat, lng);
    setCurrentCoords({ lat, lng });
    setDistance(dist);
  };

  const simulateOutsideSchool = () => {
    // Offset far (approx 500 meters)
    const lat = schoolInfo.latitude + 0.0045;
    const lng = schoolInfo.longitude + 0.0035;
    const dist = calculateDistanceFromSchool(lat, lng);
    setCurrentCoords({ lat, lng });
    setDistance(dist);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Geolokasi SMP IT Sindangprabu
            </h4>
            <p className="text-[11px] text-slate-400">
              Koordinat: {schoolInfo.latitude.toFixed(5)}, {schoolInfo.longitude.toFixed(5)} · Radius Maksimal: {schoolInfo.maxRadiusMeters}m
            </p>
          </div>
        </div>

        <a
          href="https://maps.app.goo.gl/pjSkS4FFqpVJUtB46?g_st=iw"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] transition-colors self-start sm:self-auto"
        >
          <span>Buka di Google Maps</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>
      </div>

      {/* Visual Radar Map Canvas */}
      <div className="relative w-full h-52 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
        {/* Grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b20_1px,transparent_1px),linear-gradient(to_bottom,#1e293b20_1px,transparent_1px)] bg-[size:16px_16px]"></div>

        {/* Circular Radar Geofence zone */}
        <div className="relative w-44 h-44 rounded-full border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-center animate-pulse">
          <div className="w-28 h-28 rounded-full border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center">
            {/* Center: School Landmark Pin */}
            <div className="relative flex flex-col items-center z-10">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-900/50 border-2 border-emerald-300">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold text-emerald-300 bg-slate-950/90 px-1.5 py-0.5 rounded mt-1 border border-emerald-500/30 whitespace-nowrap shadow">
                SMP IT Sindangprabu
              </span>
            </div>
          </div>

          {/* User's Current GPS Position Pin */}
          <div
            className={`absolute transition-all duration-700 z-20 flex flex-col items-center ${
              isWithinRadius ? 'top-10 right-10' : 'top-2 right-2 translate-x-4'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md border-2 ${
                isWithinRadius
                  ? 'bg-blue-600 border-white text-white animate-bounce'
                  : 'bg-rose-600 border-white text-white'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 transform -rotate-45" />
            </div>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 whitespace-nowrap shadow ${
                isWithinRadius
                  ? 'bg-blue-950 text-blue-200 border border-blue-500/40'
                  : 'bg-rose-950 text-rose-200 border border-rose-500/40'
              }`}
            >
              Posisi Anda ({distance}m)
            </span>
          </div>
        </div>

        {/* Map Legend Overlay */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-slate-400 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-lg border border-slate-800">
          <span>Desa Sindangprabu, Wanaraja - Garut</span>
          <span className="font-mono text-emerald-400">Zona Geofence: 250m</span>
        </div>
      </div>

      {/* Geofence Verification Status Card */}
      <div
        className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
          isWithinRadius
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}
      >
        <div className="flex items-center gap-2">
          {isWithinRadius ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <div>
            <p className="font-semibold">
              {isWithinRadius
                ? 'Dalam Radius Presensi Sekolah (Valid)'
                : 'Di Luar Radius Presensi Sekolah'}
            </p>
            <p className="text-[11px] text-slate-400">
              Jarak Anda ke SMP IT Sindangprabu: <span className="font-mono font-bold text-white">{distance} meter</span>
            </p>
          </div>
        </div>

        <span
          className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
            isWithinRadius ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
          }`}
        >
          {isWithinRadius ? 'TERVERIFIKASI' : 'DILUAR RADIUS'}
        </span>
      </div>

      {gpsError && (
        <p className="text-[11px] text-amber-400 bg-amber-500/10 p-2 rounded border border-amber-500/20">
          {gpsError}
        </p>
      )}

      {/* Interactive Controls */}
      {interactive && (
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
          <button
            type="button"
            onClick={requestRealGps}
            disabled={isGettingGps}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGettingGps ? 'animate-spin' : ''}`} />
            {isGettingGps ? 'Mendeteksi GPS...' : 'Deteksi GPS Asli'}
          </button>

          <span className="text-slate-600 text-xs">|</span>

          <button
            type="button"
            onClick={simulateInsideSchool}
            className="px-2.5 py-1.5 rounded-md bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 text-xs font-medium transition-colors cursor-pointer"
          >
            Simulasi: Di Sekolah (18m)
          </button>

          <button
            type="button"
            onClick={simulateOutsideSchool}
            className="px-2.5 py-1.5 rounded-md bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-medium transition-colors cursor-pointer"
          >
            Simulasi: Di Luar Sekolah (520m)
          </button>
        </div>
      )}
    </div>
  );
};

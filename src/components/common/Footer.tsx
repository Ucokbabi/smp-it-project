import React from 'react';
import { MapPin, ExternalLink, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-950/80 py-6 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        {/* Left: Branding & Tagline required by user */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-center sm:text-left">
          <span className="font-semibold text-slate-200">
            SISPENA CBT
          </span>
          <span className="hidden sm:inline text-slate-600">·</span>
          <span className="text-emerald-400 font-medium">
            smart system SMP IT SindangPrabu
          </span>
        </div>

        {/* Center: School Map Link */}
        <div className="flex items-center gap-2">
          <a
            href="https://maps.app.goo.gl/pjSkS4FFqpVJUtB46?g_st=iw"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
            <span>Sindangprabu, Wanaraja - Garut</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
        </div>

        {/* Right: Security & Copyright */}
        <div className="flex items-center gap-2 text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500/70" />
          <span>SMP IT Sindangprabu &copy; {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
};

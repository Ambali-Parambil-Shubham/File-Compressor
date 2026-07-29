import { useEffect } from 'react';

export default function DesktopAppModal({ isOpen, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const githubReleaseUrl = 'https://github.com/Ambali-Parambil-Shubham/MossZIP_File-Compressor';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in gpu-layer"
    >
      <div 
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-[#1C271D] text-[#FFF7E2] rounded-3xl border border-[#4F633D]/40 p-5 sm:p-8 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Desktop Modal"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 flex items-center justify-center font-bold text-sm transition-all cursor-pointer min-h-[44px]"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#4F633D]/30 border border-[#4F633D]/50 flex items-center justify-center text-2xl shadow-inner shrink-0">
            💻
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-display font-bold text-[#FFF7E2]">MossZip Studio Desktop</h2>
              <span className="text-[10px] font-mono font-bold bg-[#4F633D]/40 text-[#8BA194] px-2 py-0.5 rounded-full border border-[#4F633D]/50">
                v2.4.0 (Windows)
              </span>
            </div>
            <p className="text-xs text-[#A6B49B] mt-0.5">
              High-Performance Offline File Compression & Converter Platform
            </p>
          </div>
        </div>

        {/* Features List */}
        <div className="p-4 bg-black/30 rounded-2xl border border-white/5 space-y-2.5 text-xs text-[#FFF7E2]">
          <div className="flex items-center gap-2.5">
            <span className="text-emerald-400">✓</span>
            <span><strong>100% Offline Processing</strong> — Compress files locally without internet</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-emerald-400">✓</span>
            <span><strong>Unlimited File Sizes</strong> — Process 5GB+ videos & PDFs with zero limit</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-emerald-400">✓</span>
            <span><strong>Multi-Threaded FFmpeg & MozJPEG</strong> — 10x faster execution</span>
          </div>
        </div>

        {/* Single Download Action Button */}
        <div className="pt-2">
          <a
            href={githubReleaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 px-6 rounded-2xl bg-[#4F633D] hover:bg-[#61794C] text-[#FFF7E2] font-display font-bold text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center gap-3 border border-[#8BA194]/40 hover:scale-[1.01] min-h-[44px]"
          >
            <svg className="w-5 h-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span>Download MossZip Studio for Windows</span>
          </a>
        </div>

        {/* Footer Note */}
        <p className="text-[11px] text-[#A6B49B]/70 text-center font-mono">
          Compatible with Windows 10 & 11 (64-bit). No installation required.
        </p>
      </div>
    </div>
  );
}

export default function TerminalLog({ lines = [] }) {
  if (!lines || lines.length === 0) {
    return (
      <div className="bg-[#E7EFEA]/80 border border-[#8BA194]/40 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-2">
        <div className="w-10 h-10 rounded-full bg-[#4F633D]/10 flex items-center justify-center text-[#4F633D] mb-1">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 2.625a7.5 7.5 0 001.5-.189m-1.5.189a7.5 7.5 0 01-1.5-.189m-3.75 2.625a9 9 0 001.5-.189m-1.5.189a9 9 0 01-1.5-.189M12 6.75A5.25 5.25 0 006.75 12v6.75H17.25V12A5.25 5.25 0 0012 6.75z" />
          </svg>
        </div>
        <p className="text-sm font-display font-semibold text-[#243224]">Awaiting input...</p>
        <p className="text-xs text-[#5E6B63]">Upload a file or paste text to begin compression</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1C261D] text-[#FFF7E2] rounded-2xl p-4 font-mono text-xs leading-relaxed overflow-auto max-h-56 border border-[#2C3B2E] shadow-inner">
      {lines.map((line, idx) => {
        const isError = line.includes('[ERROR]');
        const isSuccess = line.includes('[SUCCESS]');
        const isInfo = line.includes('[INFO]') || line.includes('[PROC]') || line.includes('[IO]');

        return (
          <div key={idx} className="py-0.5 flex items-start gap-2 max-w-full overflow-hidden">
            <span className="text-[#8BA194] select-none shrink-0">$</span>
            <span className={`break-all whitespace-pre-wrap ${
              isError ? 'text-[#FF8A80]' :
              isSuccess ? 'text-[#8BA194] font-semibold' :
              isInfo ? 'text-[#FFF7E2]/90' : 'text-[#8BA194]/80'
            }`}>
              {line}
            </span>
          </div>
        );
      })}
    </div>
  );
}

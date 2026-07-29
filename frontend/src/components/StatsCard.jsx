export default function StatsCard({ label, value, sub, accent, type }) {
  const isOriginal = type === 'original' || accent === 'cyan';
  const isCompressed = type === 'compressed' || accent === 'green';
  const isEfficiency = type === 'efficiency' || accent === 'tertiary';

  return (
    <div className="bg-white rounded-[18px] p-5 border border-[#8BA194]/30 shadow-md flex flex-col justify-between h-full transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-display font-bold text-[#7E8C84] uppercase tracking-wider">
          {label}
        </span>
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
          isOriginal ? 'bg-[#4F633D] text-[#FFF7E2]' :
          isCompressed ? 'bg-[#8BA194] text-[#152016]' :
          'bg-[#FFF7E2] text-[#4F633D] border border-[#8BA194]/40'
        }`}>
          {isOriginal ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25" />
            </svg>
          ) : isCompressed ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          )}
        </div>
      </div>
      <div>
        <p className="text-2xl sm:text-3xl font-display font-extrabold text-[#243224] tracking-tight">
          {value ?? '—'}
        </p>
        {sub && (
          <p className="text-xs font-medium text-[#5E6B63] mt-1">{sub}</p>
        )}
      </div>
    </div>
  );
}

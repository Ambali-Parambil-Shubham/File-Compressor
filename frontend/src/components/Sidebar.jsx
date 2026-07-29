import { getApiUrl } from '../lib/api.js';
import logoImg from '../assets/logo.png';

const NAV_ITEMS = [
  {
    id: 'compressor',
    label: 'Compressor',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    id: 'imageToPdf',
    label: 'Images → PDF',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
  },
  {
    id: 'pdfToWord',
    label: 'PDF → Word',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5-3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    id: 'mergePdf',
    label: 'Merge PDFs',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
  {
    id: 'splitPdf',
    label: 'Split PDF',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.875 14.25l1.214 1.942a2.25 2.25 0 001.9 1.058h1.022a2.25 2.25 0 001.9-1.058l1.214-1.942M12 3v11.25" />
      </svg>
    ),
  },
  {
    id: 'history',
    label: 'History',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function Sidebar({ activePage, setActivePage, onOpenDesktopModal }) {
  const isWeb = typeof window !== 'undefined' && 
    !window.navigator?.userAgent?.toLowerCase().includes('electron') && 
    !window.Capacitor && 
    window.location.protocol.startsWith('http');

  return (
    <aside className="w-60 flex-shrink-0 bg-surface-low h-screen flex flex-col border-r border-border/80 select-none hidden lg:flex">
      {/* App Workspace Switcher */}
      <div className="px-4 py-3.5 border-b border-border/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logoImg} alt="MossZip Logo" className="w-8 h-8 rounded-lg object-contain bg-surface-container shadow-sm border border-border/60" />
            <div>
              <h2 className="text-sm font-display font-bold text-on-surface leading-none">MossZip Studio</h2>
              <span className="text-[11px] text-on-surface-subtle font-medium">Binary Engine</span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-container text-on-surface-muted border border-border/60">
            v2.4
          </span>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        <div>
          <p className="px-2 pb-2 text-[10px] font-mono font-semibold text-on-surface-subtle uppercase tracking-wider">
            Workspace Tools
          </p>
          <nav className="space-y-0.5">
            {NAV_ITEMS.map(item => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage && setActivePage(item.id)}
                  className={`nav-item w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-display font-semibold transition-all ${
                    isActive 
                      ? 'bg-primary text-white shadow-md' 
                      : 'text-on-surface-muted hover:text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-white' : 'text-on-surface-muted'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="px-2 pb-2 text-[10px] font-mono font-semibold text-on-surface-subtle uppercase tracking-wider">
            Engine Mode
          </p>
          <div className="px-3 py-2.5 rounded-xl bg-white border border-border/80 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-on-surface font-medium">
              <span>Codec</span>
              <span className="font-mono text-primary font-semibold">MossZip Engine</span>
            </div>
            <div className="flex items-center justify-between text-on-surface-muted">
              <span>Bit-Packing</span>
              <span className="font-mono text-xs">Enabled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Status */}
      <div className="p-3 border-t border-border/80 bg-surface-low space-y-2">
        {isWeb && (
          <button
            onClick={onOpenDesktopModal}
            className="w-full py-2 px-3 rounded-xl bg-primary/10 text-primary text-xs font-display font-bold hover:bg-primary/20 transition-all border border-primary/20 flex items-center justify-center gap-2 shadow-sm"
            title="Download Desktop App for Windows"
          >
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 0121 5.25zM12 6v6m0 0l-2.25-2.25M12 12l2.25-2.25" />
            </svg>
            <span>Download Desktop App</span>
          </button>
        )}

        <div className="flex items-center justify-between px-2 py-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="font-medium text-on-surface-muted">System Ready</span>
          </div>
          <span className="text-[10px] font-mono text-on-surface-subtle">v2.4 Active</span>
        </div>
      </div>
    </aside>
  );
}

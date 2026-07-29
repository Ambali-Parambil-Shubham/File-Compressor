import { useState, useMemo, useCallback } from 'react';

// ── Helpers defined OUTSIDE component — never recreated on render ─────────────
function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '—';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour12: false }) + ' · ' + d.toLocaleDateString();
  } catch { return iso; }
}

// ── HistoryPage ───────────────────────────────────────────────────────────────
// Records are passed from App.jsx (single Supabase source-of-truth).
// This component no longer makes its own Supabase request — eliminating the
// duplicate fetch that previously fired every time the History tab was opened.
export default function HistoryPage({ records: propRecords = [], onClear }) {
  const [search, setSearch] = useState('');

  // ── Debounced search — avoids filtering on every single keystroke ─────────────
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useMemo(() => ({ timer: null }), []);

  const handleSearchChange = useCallback((e) => {
    const val = e.target.value;
    setSearch(val);
    if (debounceRef.timer) clearTimeout(debounceRef.timer);
    debounceRef.timer = setTimeout(() => setDebouncedSearch(val), 150);
  }, [debounceRef]);

  // ── Memoized filtered list — only recalculated when records or search change ──
  const filteredRecords = useMemo(() => {
    const sorted = [...propRecords].sort((a, b) =>
      new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
    );
    if (!debouncedSearch.trim()) return sorted;
    const q = debouncedSearch.toLowerCase();
    return sorted.filter(r => (r.file || '').toLowerCase().includes(q));
  }, [propRecords, debouncedSearch]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-on-surface">Task History</h1>
          <p className="text-xs text-on-surface-muted mt-0.5">Audit log of all compression jobs.</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search files..."
            className="input-field max-w-full sm:max-w-xs text-xs py-1.5 px-3 font-sans flex-1"
          />
          {propRecords.length > 0 && (
            <button
              onClick={onClear}
              className="px-3 py-1.5 rounded-lg border border-border/80 text-xs font-display font-medium text-on-surface-subtle hover:text-rose-600 hover:bg-rose-50 transition-all whitespace-nowrap min-h-[44px]"
            >
              Clear Logs
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="card p-4 sm:p-6 space-y-4 max-w-full overflow-hidden">
        <div className="flex items-center gap-4 border-b border-border/60 pb-3 text-xs font-display">
          <span className="font-semibold text-primary border-b-2 border-primary pb-3 -mb-3.5">
            Compression Jobs ({propRecords.length})
          </span>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="py-12 text-center text-xs text-on-surface-subtle">
            {propRecords.length === 0
              ? 'No task records yet. Perform a compression run to generate history entries.'
              : 'No records match your search.'}
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {filteredRecords.map((rec) => (
              <div
                key={rec.id || rec.timestamp}
                className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0 max-w-full">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-primary-light text-primary flex-shrink-0">
                    {rec.type || 'Compress'}
                  </span>
                  <span className="font-display font-semibold text-on-surface truncate max-w-[200px] sm:max-w-sm">
                    {rec.file}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-on-surface-muted font-mono text-[11px]">
                  <span>
                    {formatBytes((rec.originalBits || 0) / 8)} → {formatBytes((rec.compressedBits || 0) / 8)}
                  </span>
                  <span className="font-semibold text-primary font-display">
                    {(rec.ratio || 0).toFixed(1)}%
                  </span>
                  <span className="text-on-surface-subtle">{formatTime(rec.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

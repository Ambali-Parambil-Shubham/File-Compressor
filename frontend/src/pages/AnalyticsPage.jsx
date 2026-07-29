import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient.js';

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '0 B';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function AnalyticsPage({ records: propRecords = [] }) {
  const [supabaseRecords, setSupabaseRecords] = useState([]);

  useEffect(() => {
    fetchSupabaseAnalytics();
  }, []);

  const fetchSupabaseAnalytics = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('compression_jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSupabaseRecords(data.map(item => ({
          id: item.id,
          type: 'Compress',
          file: item.name,
          originalBits: item.stats?.originalBits,
          compressedBits: item.stats?.compressedBits,
          ratio: item.stats?.ratio || 0,
          timestamp: item.created_at
        })));
      }
    } catch (e) {}
  };

  // Combine prop/localStorage records with Supabase records (removing duplicates by id)
  const combinedRecordsMap = new Map();
  propRecords.forEach(r => combinedRecordsMap.set(String(r.id), r));
  supabaseRecords.forEach(r => {
    if (!combinedRecordsMap.has(String(r.id))) {
      combinedRecordsMap.set(String(r.id), r);
    }
  });

  const records = Array.from(combinedRecordsMap.values());
  const compressions = records.filter(r => r.type === 'Compress');

  const totalOriginalBits = compressions.reduce((acc, r) => acc + (r.originalBits || 0), 0);
  const totalCompressedBits = compressions.reduce((acc, r) => acc + (r.compressedBits || 0), 0);
  const totalSavedBits = Math.max(0, totalOriginalBits - totalCompressedBits);
  const avgRatio = compressions.length > 0 ? compressions.reduce((acc, r) => acc + (r.ratio || 0), 0) / compressions.length : 0;
  const bestRatio = compressions.length > 0 ? Math.max(...compressions.map(r => r.ratio || 0)) : 0;

  const maxRatio = compressions.length ? Math.max(...compressions.map(r => Math.abs(r.ratio)), 1) : 100;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-display font-bold text-on-surface">Efficiency Analytics</h1>
        <p className="text-xs text-on-surface-muted mt-0.5">
          Real-time performance metrics and byte-level savings data.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 space-y-1">
          <p className="text-[11px] font-display font-semibold text-on-surface-subtle uppercase tracking-wider">Total Operations</p>
          <p className="text-2xl font-display font-bold text-on-surface">{compressions.length}</p>
          <p className="text-[11px] text-on-surface-muted">completed runs</p>
        </div>

        <div className="card p-5 space-y-1">
          <p className="text-[11px] font-display font-semibold text-on-surface-subtle uppercase tracking-wider">Average Reduction</p>
          <p className="text-2xl font-display font-bold text-primary">{avgRatio.toFixed(1)}%</p>
          <p className="text-[11px] text-on-surface-muted">space saved</p>
        </div>

        <div className="card p-5 space-y-1">
          <p className="text-[11px] font-display font-semibold text-on-surface-subtle uppercase tracking-wider">Peak Efficiency</p>
          <p className="text-2xl font-display font-bold text-primary">{bestRatio.toFixed(1)}%</p>
          <p className="text-[11px] text-on-surface-muted">best run ratio</p>
        </div>

        <div className="card p-5 space-y-1">
          <p className="text-[11px] font-display font-semibold text-on-surface-subtle uppercase tracking-wider">Total Bytes Saved</p>
          <p className="text-2xl font-display font-bold text-on-surface">{formatBytes(totalSavedBits / 8)}</p>
          <p className="text-[11px] text-on-surface-muted">cumulative savings</p>
        </div>
      </div>

      {/* Main Analytics Content */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 card p-6 space-y-4 max-w-full overflow-hidden">
          <h3 className="text-xs font-display font-bold text-on-surface uppercase tracking-wider">
            Compression Ratio per Job
          </h3>

          {compressions.length === 0 ? (
            <p className="text-xs text-on-surface-subtle py-8 text-center">No compression job metrics available yet. Perform a compression run to view real-time job analytics.</p>
          ) : (
            <div className="space-y-3.5">
              {compressions.map((rec, i) => (
                <div key={rec.id} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-on-surface font-medium truncate max-w-xs">
                      #{i + 1} · {rec.file}
                    </span>
                    <span className="font-mono font-bold text-primary">{(rec.ratio || 0).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-container overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(2, ((rec.ratio || 0) / maxRatio) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-12 lg:col-span-4 card p-6 space-y-4 max-w-full overflow-hidden">
          <h3 className="text-xs font-display font-bold text-on-surface uppercase tracking-wider">
            Data Throughput Summary
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-border/60">
              <span className="text-on-surface-muted">Original Volume</span>
              <span className="font-mono font-bold text-on-surface">{formatBytes(totalOriginalBits / 8)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/60">
              <span className="text-on-surface-muted">Compressed Output</span>
              <span className="font-mono font-bold text-primary">{formatBytes(totalCompressedBits / 8)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-on-surface-muted">Net Storage Saved</span>
              <span className="font-mono font-bold text-primary">{formatBytes(totalSavedBits / 8)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

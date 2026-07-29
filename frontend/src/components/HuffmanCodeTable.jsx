export default function HuffmanCodeTable({ codes }) {
  if (!codes || codes.size === 0) return null;

  const charLabel = (ch) => {
    if (ch === '\n') return '\\n';
    if (ch === ' ') return 'SPACE';
    if (ch === '\t') return '\\t';
    if (ch === '\r') return '\\r';
    return ch;
  };

  const rows = [...codes.entries()].sort(([, a], [, b]) => a.length - b.length);

  const efficiency = (code) => {
    const savings = Math.round((1 - code.length / 8) * 100);
    if (savings > 0) return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-primary-light text-primary">{savings}% saved</span>;
    if (savings < 0) return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-red-50 text-red-700">{Math.abs(savings)}% larger</span>;
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-surface-container text-on-surface-muted">even</span>;
  };

  return (
    <div className="space-y-2 w-full overflow-x-auto">
      <div className="min-w-[400px] space-y-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-low rounded-lg text-xs font-display font-semibold text-on-surface-subtle">
          <div className="w-24">Char</div>
          <div className="w-20">ASCII Bits</div>
          <div className="flex-1">Huffman Code</div>
          <div className="w-24">Efficiency</div>
        </div>

        <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
          {rows.map(([char, code]) => (
            <div key={char} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-surface-container transition-colors text-xs">
              <div className="w-24">
                <span className="font-mono text-xs text-on-surface bg-surface-container px-2 py-0.5 rounded border border-border/60">
                  {charLabel(char)}
                </span>
              </div>
              <div className="w-20 font-mono text-on-surface-muted">8</div>
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <span className="font-mono text-xs text-primary font-semibold tracking-wider truncate">
                  {code}
                </span>
                <span className="text-[11px] text-on-surface-subtle font-mono shrink-0">({code.length}b)</span>
              </div>
              <div className="w-24">{efficiency(code)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

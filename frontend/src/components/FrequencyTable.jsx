import { useState } from 'react';

export default function FrequencyTable({ freqMap }) {
  const [sortBy, setSortBy] = useState('freq'); // 'freq' | 'char'
  const [sortDir, setSortDir] = useState('desc');

  if (!freqMap || freqMap.size === 0) return null;

  const rows = [...freqMap.entries()].sort(([aChar, aFreq], [bChar, bFreq]) => {
    let cmp = 0;
    if (sortBy === 'freq') cmp = aFreq - bFreq;
    else cmp = aChar.localeCompare(bChar);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const maxFreq = Math.max(...rows.map(([, f]) => f));

  const toggle = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const charLabel = (ch) => {
    if (ch === '\n') return '\\n';
    if (ch === ' ') return 'SPACE';
    if (ch === '\t') return '\\t';
    if (ch === '\r') return '\\r';
    return ch;
  };

  return (
    <div className="space-y-2 w-full overflow-x-auto">
      <div className="min-w-[380px] space-y-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-low rounded-lg text-xs font-display font-semibold text-on-surface-subtle">
          <button
            onClick={() => toggle('char')}
            className="flex-1 flex items-center gap-1 hover:text-on-surface transition-colors"
          >
            Character {sortBy === 'char' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
          </button>
          <button
            onClick={() => toggle('freq')}
            className="w-24 flex items-center gap-1 hover:text-on-surface transition-colors"
          >
            Frequency {sortBy === 'freq' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
          </button>
          <div className="flex-1">Distribution</div>
        </div>

        <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
          {rows.map(([char, freq]) => (
            <div key={char} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-surface-container transition-colors text-xs">
              <div className="flex-1">
                <span className="font-mono text-xs text-on-surface bg-surface-container px-2 py-0.5 rounded border border-border/60">
                  {charLabel(char)}
                </span>
              </div>
              <div className="w-24 font-mono font-medium text-primary">{freq.toLocaleString()}</div>
              <div className="flex-1">
                <div className="h-1.5 rounded-full bg-border/60 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(freq / maxFreq) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

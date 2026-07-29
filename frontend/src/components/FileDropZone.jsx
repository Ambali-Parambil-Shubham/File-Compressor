import { useState, useRef, useCallback } from 'react';

const ICONS = {
  upload: (
    <svg className="w-12 h-12 text-[#4F633D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V3m0 0l-4.5 4.5M12 3l4.5 4.5M3 16.5v1.875A2.625 2.625 0 005.625 21h12.75A2.625 2.625 0 0021 18.375V16.5" />
    </svg>
  ),
};

export default function FileDropZone({ onFile, accept, label, sublabel, compact }) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const [fileName, setFileName] = useState(null);
  const inputRef = useRef(null);

  const handleFile = useCallback((file) => {
    if (!file) return;
    setFileName(file.name);

    // 1. Immediately pass rawFile to parent state for instant zero-memory compression availability!
    onFile({ 
      name: file.name, 
      size: file.size, 
      rawFile: file,
      content: null,
      textContent: '[Binary Stream Payload]'
    });

    // 2. Only read ArrayBuffer into browser memory if file is under 50MB to prevent Chrome Out of Memory crashes!
    const MAX_MEMORY_READ_BYTES = 50 * 1024 * 1024; // 50 MB
    if (file.size < MAX_MEMORY_READ_BYTES) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawBytes = new Uint8Array(e.target.result);
        let textContent = '';
        try {
          textContent = new TextDecoder('utf-8', { fatal: false }).decode(rawBytes);
        } catch (err) {
          textContent = '[Binary Data]';
        }
        onFile({ 
          name: file.name, 
          size: file.size, 
          content: rawBytes,
          textContent: textContent,
          rawFile: file
        });
      };
      reader.readAsArrayBuffer(file);
    }
    if (inputRef.current) inputRef.current.value = '';
  }, [onFile]);

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setDragCounter(0);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e) => { e.preventDefault(); };
  const onDragEnter = (e) => { 
    e.preventDefault(); 
    setDragCounter(prev => prev + 1);
    setIsDragging(true); 
  };
  const onDragLeave = (e) => { 
    e.preventDefault(); 
    const newCounter = dragCounter - 1;
    setDragCounter(newCounter);
    if (newCounter <= 0) setIsDragging(false); 
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={label || 'Drop your file here or click to select'}
      onKeyDown={handleKeyDown}
      className={`rounded-[20px] bg-[#FFFDF6] border-2 border-dashed border-[#8BA194]/40 transition-all duration-200 ease-out flex flex-col items-center justify-center text-center cursor-pointer p-5 sm:p-10 max-w-full overflow-hidden outline-none select-none ${
        isDragging
          ? 'bg-[#E7EFEA] border-[#4F633D] shadow-[0_0_25px_rgba(139,161,148,0.3)] scale-[0.99]'
          : 'hover:bg-white hover:border-[#4F633D]/60 hover:shadow-[0_0_25px_rgba(139,161,148,0.2)] focus-visible:ring-2 focus-visible:ring-[#4F633D]'
      }`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {fileName ? (
        <div className="flex flex-col items-center gap-2.5 w-full max-w-md px-2">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#4F633D]/10 flex items-center justify-center text-[#4F633D] shrink-0">
            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div className="max-w-full overflow-hidden">
            <p className="text-sm sm:text-base font-display font-bold text-[#243224] truncate max-w-[220px] sm:max-w-md">{fileName}</p>
            <p className="text-[11px] sm:text-xs text-[#7E8C84] mt-0.5">Click or press Enter to replace file</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2.5 px-2">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#8BA194]/15 flex items-center justify-center mb-1 shrink-0">
            {ICONS.upload}
          </div>
          <div className="max-w-full">
            <p className="font-display font-bold text-base sm:text-lg text-[#243224] leading-snug">
              {label || 'Drop your file here'}
            </p>
            <p className="text-[11px] sm:text-xs text-[#5E6B63] mt-1 font-medium max-w-xs sm:max-w-sm mx-auto leading-relaxed">
              {sublabel || 'Supports Video (MP4, MOV, AVI, MKV), PDF, Office, Images & Text'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

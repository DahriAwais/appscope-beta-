import React, { useState, useEffect } from 'react';
import { Eye, ShieldAlert, Loader2 } from 'lucide-react';

interface ScreenshotImageProps {
  url: string;
  index: number;
  proxiedUrl: string;
}

export default function ScreenshotImage({ url, index, proxiedUrl }: ScreenshotImageProps) {
  // Try direct browser CDN URL first to bypass sandbox server-to-server outbound constraints
  const [currentSrc, setCurrentSrc] = useState(url);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hasTriedFallback, setHasTriedFallback] = useState(false);

  useEffect(() => {
    setCurrentSrc(url);
    setLoading(true);
    setError(false);
    setHasTriedFallback(false);
  }, [url]);

  return (
    <div className="relative w-full h-full bg-zinc-950 flex flex-col items-center justify-center">
      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 w-full h-full z-10">
          <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
          <span className="text-[9px] text-zinc-500 font-mono mt-1.5 uppercase tracking-wider animate-pulse">Syncing CDN...</span>
        </div>
      )}

      {error ? (
        <div className="p-4 flex flex-col items-center text-center justify-center h-full w-full bg-[#0d0d0d] text-zinc-500 space-y-3 select-none">
          <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <ShieldAlert className="w-4.5 h-4.5" />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-mono uppercase bg-zinc-900 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-bold">
              Access Impeded
            </span>
            <p className="text-[10px] text-zinc-400 font-sans leading-relaxed max-w-[180px] mx-auto">
              Store asset hotlink protections active or invalid query reference.
            </p>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[9px] font-mono font-extrabold bg-zinc-900 hover:bg-zinc-850 hover:text-zinc-200 border border-zinc-800 rounded-lg px-2.5 py-1.5 transition-all text-zinc-400 active:scale-95"
          >
            <Eye className="w-3 h-3 text-emerald-400" />
            <span>Open Original Link</span>
          </a>
        </div>
      ) : (
        <img
          src={currentSrc}
          alt={`Store Screenshot ${index + 1}`}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.03] ${
            loading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
          onLoad={() => setLoading(false)}
          onError={() => {
            if (!hasTriedFallback && currentSrc !== proxiedUrl) {
              setHasTriedFallback(true);
              setCurrentSrc(proxiedUrl);
            } else {
              setError(true);
              setLoading(false);
            }
          }}
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
}

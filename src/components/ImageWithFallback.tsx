import React, { useState, useEffect } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;        // Typically the proxied URL
  fallbackSrc: string; // Typically the direct CDN URL
  alt?: string;
  className?: string;
}

export default function ImageWithFallback({ src, fallbackSrc, alt, className, ...props }: ImageWithFallbackProps) {
  // We want to try the direct URL first (fallbackSrc) because direct browser calls with referrerPolicy="no-referrer"
  // are highly successful and avoid container networking timeouts/limits.
  // Stage 0: Direct CDN URL (fallbackSrc)
  // Stage 1: Proxied URL (src)
  // Stage 2: Aesthetic Vector SVG Avatar Fallback
  const [stage, setStage] = useState<number>(() => (fallbackSrc ? 0 : src ? 1 : 2));
  const [currentSrc, setCurrentSrc] = useState<string>(() => fallbackSrc || src || '');

  useEffect(() => {
    // Sync props updates
    if (fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setStage(0);
    } else if (src) {
      setCurrentSrc(src);
      setStage(1);
    } else {
      setCurrentSrc('');
      setStage(2);
    }
  }, [src, fallbackSrc]);

  const generatePlaceholderSvg = (name: string) => {
    const cleanAlt = (name || alt || 'App').trim();
    const initial = cleanAlt.charAt(0).toUpperCase();
    
    // Hash based on name to get a consistent beautiful gradient hue range
    let hash = 0;
    for (let i = 0; i < cleanAlt.length; i++) {
      hash = cleanAlt.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Modern gradients
    const gradients = [
      { start: "#10b981", end: "#059669" }, // Emeralds
      { start: "#3b82f6", end: "#1d4ed8" }, // Blues
      { start: "#8b5cf6", end: "#6d28d9" }, // Violets
      { start: "#ec4899", end: "#be185d" }, // Pinks
      { start: "#f59e0b", end: "#b45309" }, // Ambers
      { start: "#06b6d4", end: "#0891b2" }, // Cyans
    ];
    
    const pickedIdx = Math.abs(hash) % gradients.length;
    const grad = gradients[pickedIdx];
    
    const svgStr = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <defs>
          <linearGradient id="grad-${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${grad.start}" />
            <stop offset="100%" stop-color="${grad.end}" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="22" fill="url(#grad-${hash})" />
        <text x="50" y="56" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900" fill="#ffffff" dominant-baseline="middle" text-anchor="middle" letter-spacing="-1">${initial}</text>
      </svg>
    `.trim();

    return `data:image/svg+xml;utf8,${encodeURIComponent(svgStr)}`;
  };

  const handleError = () => {
    if (stage === 0) {
      // Direct CDN URL failed, switch to proxy (Stage 1)
      if (src && src !== fallbackSrc) {
        setCurrentSrc(src);
        setStage(1);
      } else {
        // No proxy or same as CDN, go straight to placeholder SVG (Stage 2)
        setStage(2);
      }
    } else if (stage === 1) {
      // Proxy failed, fall back to aesthetic SVG
      setStage(2);
    }
  };

  if (stage === 2) {
    const finalFallbackSvg = generatePlaceholderSvg(alt || 'A');
    return (
      <img
        src={finalFallbackSvg}
        alt={alt}
        className={className}
        {...props}
      />
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      referrerPolicy="no-referrer"
      {...props}
    />
  );
}

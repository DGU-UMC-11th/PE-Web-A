import { useState } from 'react';
import { cn } from '../../utils/cn';
export function MovieImage({ src, alt, className }: { src: string | null; alt: string; className: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  return src && failedSrc !== src
    ? <img src={src} alt={alt} onError={() => setFailedSrc(src)} className={className} />
    : <div role="img" aria-label={`${alt || '배경'}: 이미지 없음`} className={cn(className, 'flex items-center justify-center bg-gray-200 text-sm text-gray-600')}>이미지 없음</div>;
}

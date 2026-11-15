import { cn } from "../../utils/cn";

interface MovieImageProps {
  src: string | null;
  alt: string;
  className?: string;
}

export function MovieImage({ src, alt, className }: MovieImageProps) {
  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-neutral-300 text-sm text-neutral-600",
          className,
        )}
      >
        이미지 없음
      </div>
    );
  }

  return <img src={src} alt={alt} className={cn("object-cover", className)} />;
}
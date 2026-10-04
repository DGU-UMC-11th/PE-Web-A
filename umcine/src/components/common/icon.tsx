import { cn } from "../../utils/cn";

type IconName =
  | "arrow-right"
  | "bookmark"
  | "bookmark-outline"
  | "chevron-left"
  | "chevron-right"
  | "close"
  | "movie"
  | "search"
  | "star"
  | "star-outline";

interface IconProps {
  name: IconName;
  className?: string;
}

/**
 * public/icons의 검정 SVG를 CSS mask로 그려, 글자색(text-*)으로 색을 입히는 아이콘
 * @param name public/icons 안의 파일 이름 (확장자 제외)
 * @param className 크기(size-*)와 색(text-*) 등 추가 class
 */
export function Icon({ name, className }: IconProps) {
  const maskImage = `url(/icons/${name}.svg)`;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-6 shrink-0 bg-current mask-contain mask-center mask-no-repeat",
        className,
      )}
      style={{ maskImage, WebkitMaskImage: maskImage }}
    />
  );
}

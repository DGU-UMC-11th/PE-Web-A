import { Icon } from "@/components/common/icon";
import { cn } from "@/utils/cn";

interface ProfileAvatarProps {
  imageUrl: string | null;
  className?: string;
}

/**
 * 원형 프로필 이미지. 이미지가 없으면 person 아이콘을 보여준다.
 * @param imageUrl 프로필 이미지 주소 (없으면 null)
 * @param className 크기 등 추가 class
 */
export function ProfileAvatar({ imageUrl, className }: ProfileAvatarProps) {
  return (
    <div
      className={cn(
        "flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-line",
        className,
      )}
    >
      {imageUrl ? (
        <img src={imageUrl} alt="프로필 이미지" className="size-full object-cover" />
      ) : (
        <Icon name="person" className="size-9 text-ink" />
      )}
    </div>
  );
}

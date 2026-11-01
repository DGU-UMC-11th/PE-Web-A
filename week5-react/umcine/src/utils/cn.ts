import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** 조건부 클래스를 합치고 충돌하는 Tailwind 클래스를 정리한다. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

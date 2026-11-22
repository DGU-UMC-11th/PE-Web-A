export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const validNickname = (value: string) => value.trim().length >= 2 && value.trim().length <= 12;

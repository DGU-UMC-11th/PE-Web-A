import type { InputHTMLAttributes, ReactNode } from 'react';
import { errorMessage } from '../api/api-client';

export const primaryButton = 'rounded-lg bg-[#2563eb] px-5 py-3 font-bold text-white disabled:opacity-40';
export const secondaryButton = 'shrink-0 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-bold disabled:opacity-40';
/** 폼 요소에 보이는 레이블과 일관된 입력 스타일을 제공한다. */
export function Field({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="block min-w-0 flex-1 text-sm font-bold">{label}<input {...props} className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-normal disabled:bg-gray-100" /></label>;
}
/** 로그인·회원가입 폼의 공통 화면 틀이다. */
export function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return <main className="mx-auto w-full max-w-lg flex-1 px-6 py-12"><section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"><h1 className="mb-8 text-2xl font-bold">{title}</h1>{children}</section></main>;
}
/** 실패 이유를 스크린 리더와 화면에 함께 알린다. */
export function ErrorNotice({ error }: { error: unknown }) {
  return error ? <p role="alert" className="my-3 text-sm text-red-700">{errorMessage(error)}</p> : null;
}

import { useState } from 'react';
import { Link, useSearch } from '@tanstack/react-router';
import { AuthCard, Field, ErrorNotice, primaryButton } from '../../components/form';
import { useLoginMutation } from '../../hooks/use-member';

/** 로그인 입력을 검증하고 실패 시 입력값을 유지해 다시 제출할 수 있게 한다. */
export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const mutation = useLoginMutation();
  const { registered } = useSearch({ from: '/login' });
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && password.length > 0;
  return <AuthCard title="로그인">
    {registered && <p role="status" className="mb-5 text-sm text-blue-700">회원가입이 완료됐어요. 로그인해 주세요.</p>}
    <form className="space-y-5" onSubmit={event => { event.preventDefault(); if (valid && !mutation.isPending) mutation.mutate({ email: email.trim(), password }); }}>
      <Field label="이메일" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} disabled={mutation.isPending} />
      <Field label="비밀번호" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} disabled={mutation.isPending} />
      <ErrorNotice error={mutation.error} />
      <button className={`${primaryButton} w-full`} disabled={!valid || mutation.isPending}>{mutation.isPending ? '로그인 중…' : '로그인'}</button>
    </form>
    <p className="mt-6 text-center text-sm text-gray-600">아직 계정이 없나요? <Link to="/signup" className="font-bold text-blue-700">회원가입</Link></p>
  </AuthCard>;
}

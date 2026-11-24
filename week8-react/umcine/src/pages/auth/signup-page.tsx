import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { checkAvailability } from '../../api/members';
import { useSignupMutation } from '../../hooks/use-member';
import { AuthCard, ErrorNotice, Field, primaryButton, secondaryButton } from '../../components/form';

/** 가입 폼의 중복 확인 결과는 확인한 입력값과 함께 보관한다. */
export function SignupPage() {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const emailCheck = useMutation({ mutationFn: (value: string) => checkAvailability('email', value) });
  const nicknameCheck = useMutation({ mutationFn: (value: string) => checkAvailability('nickname', value) });
  const signup = useSignupMutation();
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const nicknameValid = nickname.trim().length >= 2 && nickname.trim().length <= 12;
  const passwordValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(password);
  const emailAvailable = emailCheck.data?.available && emailCheck.variables === email.trim();
  const nicknameAvailable = nicknameCheck.data?.available && nicknameCheck.variables === nickname.trim();
  const busy = signup.isPending || emailCheck.isPending || nicknameCheck.isPending;
  const valid = emailValid && nicknameValid && passwordValid && confirm === password && emailAvailable && nicknameAvailable;
  return <AuthCard title="회원가입"><form className="space-y-5" onSubmit={event => {
    event.preventDefault(); if (valid && !busy) signup.mutate({ email: email.trim(), nickname: nickname.trim(), password });
  }}>
    <div className="flex items-end gap-2"><Field required label="이메일" type="email" autoComplete="email" value={email} disabled={busy} onChange={event => { setEmail(event.target.value); emailCheck.reset(); }} />
      <button type="button" className={secondaryButton} disabled={!emailValid || busy} onClick={() => emailCheck.mutate(email.trim())}>중복 확인</button></div>
    {emailCheck.isSuccess && <p role="status" className="text-sm">{emailAvailable ? '사용할 수 있는 이메일이에요.' : '이미 사용 중인 이메일이에요.'}</p>}
    <ErrorNotice error={emailCheck.error} />
    <div className="flex items-end gap-2"><Field required label="닉네임" autoComplete="nickname" maxLength={12} value={nickname} disabled={busy} onChange={event => { setNickname(event.target.value); nicknameCheck.reset(); }} />
      <button type="button" className={secondaryButton} disabled={!nicknameValid || busy} onClick={() => nicknameCheck.mutate(nickname.trim())}>중복 확인</button></div>
    <p className="text-xs text-gray-600">닉네임은 2~12자로 입력해 주세요.</p>
    {nicknameCheck.isSuccess && <p role="status" className="text-sm">{nicknameAvailable ? '사용할 수 있는 닉네임이에요.' : '이미 사용 중인 닉네임이에요.'}</p>}
    <ErrorNotice error={nicknameCheck.error} />
    <Field required label="비밀번호" type="password" autoComplete="new-password" value={password} disabled={busy} onChange={event => setPassword(event.target.value)} />
    <p className="text-xs text-gray-600">대문자·소문자·숫자·특수문자(!@#$%^&*)를 포함해 8자 이상 입력해 주세요.</p>
    <Field required label="비밀번호 확인" type="password" autoComplete="new-password" value={confirm} disabled={busy} onChange={event => setConfirm(event.target.value)} />
    {confirm && confirm !== password && <p role="status" className="text-sm text-red-700">비밀번호가 일치하지 않아요.</p>}
    <ErrorNotice error={signup.error} />
    <button className={`${primaryButton} w-full`} disabled={!valid || busy}>{signup.isPending ? '가입 중…' : '가입하기'}</button>
    <Link to="/login" className="block text-center text-sm text-blue-700">이미 계정이 있어요</Link>
  </form></AuthCard>;
}

import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useMe, useUpdateMeMutation } from '../../hooks/use-member';
import type { MemberInfo } from '../../api/members';
import { AuthCard, Field, ErrorNotice, primaryButton, secondaryButton } from '../../components/form';

/** 회원 조회가 끝난 뒤 현재 닉네임으로 편집 폼을 초기화한다. */
export function EditProfilePage() {
  const me = useMe();
  return <AuthCard title="내 정보 수정">{me.isPending ? <p role="status">내 정보를 불러오는 중이에요.</p> : me.isError ? <><ErrorNotice error={me.error} /><button onClick={() => void me.refetch()} className={secondaryButton}>다시 시도</button></> : <ProfileForm member={me.data} />}</AuthCard>;
}

/** 닉네임 변경 결과를 공통 회원 캐시에 반영한다. */
function ProfileForm({ member }: { member: MemberInfo }) {
  const [nickname, setNickname] = useState(member.nickname);
  const mutation = useUpdateMeMutation();
  const valid = nickname.trim().length >= 2 && nickname.trim().length <= 12;
  return <form className="space-y-5" onSubmit={event => { event.preventDefault(); if (valid && !mutation.isPending) mutation.mutate(nickname.trim()); }}>
    <Field label="이메일" value={member.email} readOnly />
    <Field label="닉네임" autoComplete="nickname" value={nickname} maxLength={12} disabled={mutation.isPending} onChange={event => { setNickname(event.target.value); mutation.reset(); }} />
    <p className="text-xs text-gray-600">닉네임은 2~12자로 입력해 주세요.</p>
    <ErrorNotice error={mutation.error} />{mutation.isSuccess && <p role="status" className="text-sm text-blue-700">내 정보를 수정했어요.</p>}
    <button className={`${primaryButton} w-full`} disabled={!valid || nickname.trim() === member.nickname || mutation.isPending}>{mutation.isPending ? '저장 중…' : '저장'}</button>
    <Link to="/my" className="block text-center text-sm text-blue-700">마이페이지로 돌아가기</Link>
  </form>;
}

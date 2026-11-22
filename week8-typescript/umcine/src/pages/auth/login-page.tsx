import { Link } from "@tanstack/react-router";
import { useLoginMutation } from "../../hooks/use-account";
import { useState } from "react";
import { AccountField, AccountPanel, primaryButton } from "./account-form";
import { emailPattern } from "./account-validation";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const mutation = useLoginMutation();
  const validEmail = emailPattern.test(email.trim());

  return (
    <AccountPanel title="로그인">
      <form noValidate className="grid gap-4" onSubmit={(event) => {
        event.preventDefault();
        if (validEmail && password && !mutation.isPending) mutation.mutate({ email: email.trim(), password });
      }}>
        <AccountField id="login-email" label="이메일" type="email" autoComplete="username" placeholder="name@example.com" icon="/icons/movie-icons/mail.svg"
          value={email} onChange={(event) => { setEmail(event.target.value); mutation.reset(); }}
          error={email && !validEmail ? "이메일 형식을 확인해 주세요." : undefined} />
        <AccountField id="login-password" label="비밀번호" type="password" autoComplete="current-password" placeholder="비밀번호" icon="/icons/movie-icons/lock.svg"
          value={password} onChange={(event) => { setPassword(event.target.value); mutation.reset(); }} />
        <button className={primaryButton} disabled={!validEmail || !password || mutation.isPending}>{mutation.isPending ? "로그인 중" : "로그인"}</button>
        {mutation.isError && <p role="alert" className="text-sm text-red-600">로그인에 실패했어요. 이메일과 비밀번호를 확인해 주세요.</p>}
      </form>
      <p className="mt-5 text-center text-sm text-gray-500">처음이신가요? <Link to="/signup" className="font-semibold text-blue-600">회원가입</Link></p>
    </AccountPanel>
  );
}

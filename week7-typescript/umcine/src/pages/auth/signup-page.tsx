import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type SubmitEvent } from "react";
import { checkAvailability, signup } from "../../api/members/member-api";
import { AccountField, AccountPanel, primaryButton } from "./account-form";
import { emailPattern, validNickname } from "./account-validation";

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;
const initialForm = { email: "", nickname: "", password: "", passwordConfirm: "" };
type CheckField = "email" | "nickname";
type Check = { status: "idle" | "checking" | "available" | "unavailable" | "error" };
const idle: Check = { status: "idle" };

export function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [checks, setChecks] = useState({ email: idle, nickname: idle });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const valid = {
    email: emailPattern.test(form.email.trim()),
    nickname: validNickname(form.nickname),
    password: passwordPattern.test(form.password),
    passwordConfirm: !!form.passwordConfirm && form.password === form.passwordConfirm,
  };
  const canSubmit = Object.values(valid).every(Boolean) &&
    checks.email.status === "available" && checks.nickname.status === "available";

  function update(field: keyof typeof initialForm, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
    if (field === "email" || field === "nickname") {
      setChecks((previous) => ({ ...previous, [field]: idle }));
    }
  }

  async function check(field: CheckField) {
    if (!valid[field] || checks[field].status === "checking") return;
    setChecks((previous) => ({ ...previous, [field]: { status: "checking" } }));
    try {
      const available = await checkAvailability(field, form[field].trim());
      setChecks((previous) => ({ ...previous, [field]: { status: available ? "available" : "unavailable" } }));
    } catch {
      setChecks((previous) => ({ ...previous, [field]: { status: "error" } }));
    }
  }

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const response = await signup({ email: form.email.trim(), nickname: form.nickname.trim(), password: form.password });
      window.alert(response.message);
      await navigate({ to: "/login" });
    } catch {
      setSubmitError("회원가입에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AccountPanel title="회원가입">
      <form onSubmit={submit} noValidate className="grid gap-4">
        {(["email", "nickname"] as const).map((field) => {
          const label = field === "email" ? "이메일" : "닉네임";
          const { status } = checks[field];
          const error = form[field] && !valid[field]
            ? field === "email" ? "이메일 형식을 확인해 주세요." : "닉네임은 2~12자로 입력해 주세요."
            : undefined;
          return (
            <div key={field}>
              <AccountField label={label} id={field} type={field === "email" ? "email" : "text"}
                placeholder={field === "email" ? "name@example.com" : "2–12자"} autoComplete={field} value={form[field]} error={error} disabled={submitting || status === "checking"}
                onChange={(event) => update(field, event.target.value)}
                action={<button type="button" disabled={!valid[field] || submitting || status === "checking"}
                  className="shrink-0 rounded px-1 py-2 text-xs font-semibold text-blue-700 disabled:text-gray-400"
                  onClick={() => void check(field)}>{status === "checking" ? "확인 중" : "중복 확인"}</button>} />
              <p role="status" className="mt-1 text-sm text-gray-600">
                {status === "available" && `사용할 수 있는 ${label}이에요.`}
                {status === "unavailable" && `이미 사용 중인 ${label}이에요.`}
                {status === "error" && "중복 확인에 실패했어요. 다시 시도해 주세요."}
              </p>
            </div>
          );
        })}
        <AccountField label="비밀번호" id="signup-password" type="password" autoComplete="new-password" placeholder="8자 이상"
          hint="영문 대·소문자, 숫자, 특수문자를 포함해 8자 이상 입력해 주세요."
          value={form.password} disabled={submitting} onChange={(event) => update("password", event.target.value)}
          error={form.password && !valid.password ? "영문 대소문자, 숫자, 특수문자(!@#$%^&*)를 포함해 8자 이상 입력해 주세요." : undefined} />
        <AccountField label="비밀번호 확인" id="password-confirm" type="password" autoComplete="new-password"
          placeholder="다시 입력" value={form.passwordConfirm} disabled={submitting} onChange={(event) => update("passwordConfirm", event.target.value)}
          error={form.passwordConfirm && !valid.passwordConfirm ? "비밀번호가 일치하지 않아요." : undefined} />
        {submitError && <p role="alert" className="text-sm text-red-600">{submitError}</p>}
        <button className={primaryButton} disabled={!canSubmit || submitting}>{submitting ? "가입 중" : "가입하기"}</button>
      </form>
      <p className="mt-5 text-center text-sm text-gray-500">이미 계정이 있나요? <Link to="/login" className="font-semibold text-blue-600">로그인</Link></p>
    </AccountPanel>
  );
}

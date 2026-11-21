import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/utils/cn";
import { checkEmailDuplicate } from "@/api/members/check-email-duplicate";
import { checkNicknameDuplicate } from "@/api/members/check-nickname-duplicate";
import { signup } from "@/api/members/signup";
// /login 라우트가 생기면 주석 해제
// import { useNavigate } from "@tanstack/react-router";

const DEFAULT_DUPLICATE_CHECK = {
  isChecking: false,
  isAvailable: false,
};

type DuplicateCheckKey = "email" | "nickname";

const DUPLICATE_CHECK_LABEL: Record<DuplicateCheckKey, string> = {
  email: "이메일",
  nickname: "닉네임",
};
// 이메일 형식 검사
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 영문 대소문자, 숫자, 특수문자(!@#$%^&*)를 모두 포함해 8자 이상
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;

const DEFAULT_FORM = {
  email: "",
  nickname: "",
  password: "",
  passwordConfirm: "",
};

type DefaultFormKey = keyof typeof DEFAULT_FORM;
type DefaultFormValue = (typeof DEFAULT_FORM)[DefaultFormKey];

const inputBoxClass =
  "flex h-12 w-full items-center gap-3 rounded-lg border border-line bg-white px-4";
const inputClass =
  "min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-subtle";
const labelClass = "text-sm font-bold text-ink";
const checkButtonClass =
  "shrink-0 cursor-pointer text-sm font-bold whitespace-nowrap text-brand disabled:cursor-not-allowed disabled:opacity-40";
const errorClass = "text-xs text-red-500";

export function SignupPage() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [duplicateCheck, setDuplicateCheck] = useState({
    email: DEFAULT_DUPLICATE_CHECK,
    nickname: DEFAULT_DUPLICATE_CHECK,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const navigate = useNavigate();

  // 입력값의 유효성 검사
  const isEmailValid = EMAIL_REGEX.test(form.email.trim());
  const isNicknameValid =
    form.nickname.trim().length >= 2 && form.nickname.trim().length <= 12;
  const isPasswordValid = PASSWORD_REGEX.test(form.password);
  const isPasswordConfirmValid =
    form.passwordConfirm.length > 0 && form.password === form.passwordConfirm;

  // 입력을 시작한 필드에만 오류 표시
  const showEmailError = form.email.length > 0 && !isEmailValid;
  const showNicknameError = form.nickname.length > 0 && !isNicknameValid;
  const showPasswordError = form.password.length > 0 && !isPasswordValid;
  const showPasswordConfirmError =
    form.passwordConfirm.length > 0 && !isPasswordConfirmValid;

  // 모든 입력값이 유효하면 제출 버튼 활성화
  const isFormValid =
    isEmailValid &&
    isNicknameValid &&
    isPasswordValid &&
    isPasswordConfirmValid;

  // 형식이 유효하고 이메일·닉네임 중복 확인까지 통과해야 제출 가능
  const canSubmit =
    isFormValid &&
    duplicateCheck.email.isAvailable &&
    duplicateCheck.nickname.isAvailable;

  const handleChangeField = (key: DefaultFormKey, value: DefaultFormValue) => {
    if (key === "email" || key === "nickname") {
      // 중복 확인 요청 중에는 입력을 무시
      if (duplicateCheck[key].isChecking) return;

      // 값이 바뀌면 이전 중복 확인 결과는 더 이상 유효하지 않음
      setDuplicateCheck((prev) => ({ ...prev, [key]: DEFAULT_DUPLICATE_CHECK }));
    }

    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCheckDuplicate = async (key: DuplicateCheckKey) => {
    const isValid = key === "email" ? isEmailValid : isNicknameValid;
    if (!isValid || duplicateCheck[key].isChecking) return;

    const label = DUPLICATE_CHECK_LABEL[key];
    const value = form[key].trim();

    setDuplicateCheck((prev) => ({
      ...prev,
      [key]: { ...prev[key], isChecking: true },
    }));

    try {
      const { available } =
        key === "email"
          ? await checkEmailDuplicate(value)
          : await checkNicknameDuplicate(value);

      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: { ...prev[key], isAvailable: available },
      }));
      alert(
        available
          ? `사용할 수 있는 ${label}이에요.`
          : `이미 사용 중인 ${label}이에요.`,
      );
    } catch {
      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: { ...prev[key], isAvailable: false },
      }));
      alert("중복 확인에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: { ...prev[key], isChecking: false },
      }));
    }
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    // 폼 제출 시 페이지 새로고침 방지
    e.preventDefault();

    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // passwordConfirm은 화면 검증용이라 서버로 보내지 않음
      const response = await signup({
        email: form.email.trim(),
        nickname: form.nickname.trim(),
        password: form.password,
      });
      alert(response.message);
      // navigate({ to: "/login" });
    } catch {
      alert("회원가입에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // noValidate는 폼 제출 시 브라우저의 기본 유효성 검사를 끔
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex w-[430px] max-w-full flex-col"
      >
        <h1 className="mb-6 text-[38px]/[44px] font-bold tracking-[-1.71px] text-ink">
          회원가입
        </h1>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="signup-email" className={labelClass}>
              이메일
            </label>
            <div className={inputBoxClass}>
              <input
                id="signup-email"
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) => handleChangeField("email", e.target.value)}
                disabled={duplicateCheck.email.isChecking}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => handleCheckDuplicate("email")}
                disabled={!isEmailValid || duplicateCheck.email.isChecking}
                className={checkButtonClass}
              >
                {duplicateCheck.email.isChecking ? "확인 중" : "중복 확인"}
              </button>
            </div>
            {showEmailError && <p className={errorClass}>올바른 이메일 형식이 아니에요.</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="signup-nickname" className={labelClass}>
              닉네임
            </label>
            <div className={inputBoxClass}>
              <input
                id="signup-nickname"
                type="text"
                placeholder="2-12자"
                value={form.nickname}
                onChange={(e) => handleChangeField("nickname", e.target.value)}
                disabled={duplicateCheck.nickname.isChecking}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => handleCheckDuplicate("nickname")}
                disabled={!isNicknameValid || duplicateCheck.nickname.isChecking}
                className={checkButtonClass}
              >
                {duplicateCheck.nickname.isChecking ? "확인 중" : "중복 확인"}
              </button>
            </div>
            {showNicknameError && (
              <p className={errorClass}>닉네임은 2자 이상 12자 이하로 입력해 주세요.</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="signup-password" className={labelClass}>
              비밀번호
            </label>
            <div className={inputBoxClass}>
              <input
                id="signup-password"
                type="password"
                placeholder="8자 이상"
                value={form.password}
                onChange={(e) => handleChangeField("password", e.target.value)}
                className={inputClass}
              />
            </div>
            <p className={cn("text-xs", showPasswordError ? "text-red-500" : "text-subtle")}>
              영문 대·소문자, 숫자, 특수문자를 모두 포함해 8자 이상 입력해 주세요
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="signup-password-confirm" className={labelClass}>
              비밀번호 확인
            </label>
            <div className={inputBoxClass}>
              <input
                id="signup-password-confirm"
                type="password"
                placeholder="다시 입력"
                value={form.passwordConfirm}
                onChange={(e) => handleChangeField("passwordConfirm", e.target.value)}
                className={inputClass}
              />
            </div>
            {showPasswordConfirmError && (
              <p className={errorClass}>비밀번호가 일치하지 않아요.</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="mt-7 h-[46px] w-full cursor-pointer rounded-lg bg-brand text-base font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "가입 중" : "가입하기"}
        </button>

        <p className="mt-6 text-center text-sm text-muted">
          이미 계정이 있나요?{" "}
          <Link to="/login" className="font-bold text-brand">
            로그인
          </Link>
        </p>
      </form>
    </main>
  );
}
import { Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { checkEmailDuplicate } from "../../api/members/check-email-duplicate";
import { checkNicknameDuplicate } from "../../api/members/check-nickname-duplicate";
import { signup } from "../../api/members/signup";

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

const DEFAULT_DUPLICATE_CHECK = {
  isChecking: false,
  isAvailable: false,
};

type DuplicateCheckKey = "email" | "nickname";

export function SignupPage() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [duplicateCheck, setDuplicateCheck] = useState({
    email: DEFAULT_DUPLICATE_CHECK,
    nickname: DEFAULT_DUPLICATE_CHECK,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1) 입력값 유효성 검사
  const isEmailValid = EMAIL_REGEX.test(form.email.trim());
  const isNicknameValid =
    form.nickname.trim().length >= 2 && form.nickname.trim().length <= 12;
  const isPasswordValid = PASSWORD_REGEX.test(form.password);
  const isPasswordConfirmValid =
    form.passwordConfirm.length > 0 && form.password === form.passwordConfirm;

  // 2) 입력을 시작한 칸에만 오류 표시
  const showEmailError = form.email.length > 0 && !isEmailValid;
  const showNicknameError = form.nickname.length > 0 && !isNicknameValid;
  const showPasswordError = form.password.length > 0 && !isPasswordValid;
  const showPasswordConfirmError =
    form.passwordConfirm.length > 0 && !isPasswordConfirmValid;

  // 3) 형식이 다 맞고 + 중복 확인 둘 다 통과해야 가입 가능
  const isFormValid =
    isEmailValid && isNicknameValid && isPasswordValid && isPasswordConfirmValid;
  const canSubmit =
    isFormValid &&
    duplicateCheck.email.isAvailable &&
    duplicateCheck.nickname.isAvailable;

  const handleChangeField = (key: DefaultFormKey, value: DefaultFormValue) => {
    if (key === "email" || key === "nickname") {
      if (duplicateCheck[key].isChecking) return;
      // 확인한 값을 바꾸면 다시 중복 확인해야 함
      setDuplicateCheck((prev) => ({ ...prev, [key]: DEFAULT_DUPLICATE_CHECK }));
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCheckDuplicate = async (key: DuplicateCheckKey) => {
    const isValid = key === "email" ? isEmailValid : isNicknameValid;
    if (!isValid || duplicateCheck[key].isChecking) return;

    const label = key === "email" ? "이메일" : "닉네임";
    setDuplicateCheck((prev) => ({
      ...prev,
      [key]: { isChecking: true, isAvailable: false },
    }));

    try {
      const response =
        key === "email"
          ? await checkEmailDuplicate(form.email.trim())
          : await checkNicknameDuplicate(form.nickname.trim());
      const isAvailable = response.available;
      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: { ...prev[key], isAvailable },
      }));
      alert(
        isAvailable
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 폼 제출 시 페이지 새로고침 방지
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await signup({
        email: form.email.trim(),
        nickname: form.nickname.trim(),
        password: form.password,
      });
      alert(response.message);
    } catch {
      alert("회원가입에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded border border-neutral-300 px-4 py-2 disabled:bg-neutral-100";
  const checkButtonClass =
    "shrink-0 rounded border border-neutral-900 px-4 py-2 text-sm font-bold disabled:opacity-40";

  return (
    <main className="mx-auto max-w-md px-8 py-12">
      <h1 className="mb-8 text-2xl font-bold">회원가입</h1>

      {/* noValidate: 브라우저 기본 검사 대신 우리가 만든 검사를 써요 */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {/* 이메일 */}
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-bold">이메일</label>
          <div className="flex gap-2">
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => handleChangeField("email", e.target.value)}
              disabled={duplicateCheck.email.isChecking}
              placeholder="example@umc.com"
              className={inputClass}
            />
            <button
              type="button"
              disabled={!isEmailValid || duplicateCheck.email.isChecking}
              onClick={() => handleCheckDuplicate("email")}
              className={checkButtonClass}
            >
              {duplicateCheck.email.isChecking ? "확인 중" : "중복 확인"}
            </button>
          </div>
          {showEmailError && (
            <p className="text-sm text-red-500">올바른 이메일 형식이 아니에요.</p>
          )}
          {duplicateCheck.email.isAvailable && (
            <p className="text-sm text-green-600">사용할 수 있는 이메일이에요.</p>
          )}
        </div>

        {/* 닉네임 */}
        <div className="flex flex-col gap-1">
          <label htmlFor="nickname" className="text-sm font-bold">닉네임</label>
          <div className="flex gap-2">
            <input
              id="nickname"
              value={form.nickname}
              onChange={(e) => handleChangeField("nickname", e.target.value)}
              disabled={duplicateCheck.nickname.isChecking}
              placeholder="2~12자"
              className={inputClass}
            />
            <button
              type="button"
              disabled={!isNicknameValid || duplicateCheck.nickname.isChecking}
              onClick={() => handleCheckDuplicate("nickname")}
              className={checkButtonClass}
            >
              {duplicateCheck.nickname.isChecking ? "확인 중" : "중복 확인"}
            </button>
          </div>
          {showNicknameError && (
            <p className="text-sm text-red-500">닉네임은 2자 이상 12자 이하로 입력해 주세요.</p>
          )}
          {duplicateCheck.nickname.isAvailable && (
            <p className="text-sm text-green-600">사용할 수 있는 닉네임이에요.</p>
          )}
        </div>

        {/* 비밀번호 */}
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-bold">비밀번호</label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => handleChangeField("password", e.target.value)}
            placeholder="영문 대소문자, 숫자, 특수문자 포함 8자 이상"
            className={inputClass}
          />
          {showPasswordError && (
            <p className="text-sm text-red-500">
              영문 대소문자, 숫자, 특수문자(!@#$%^&*)를 모두 포함해 8자 이상 입력해 주세요.
            </p>
          )}
        </div>

        {/* 비밀번호 확인 */}
        <div className="flex flex-col gap-1">
          <label htmlFor="passwordConfirm" className="text-sm font-bold">비밀번호 확인</label>
          <input
            id="passwordConfirm"
            type="password"
            value={form.passwordConfirm}
            onChange={(e) => handleChangeField("passwordConfirm", e.target.value)}
            placeholder="비밀번호를 한 번 더 입력해 주세요"
            className={inputClass}
          />
          {showPasswordConfirmError && (
            <p className="text-sm text-red-500">비밀번호가 일치하지 않아요.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="mt-2 rounded bg-neutral-900 py-3 font-bold text-white disabled:opacity-40"
        >
          {isSubmitting ? "가입 중" : "가입하기"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        이미 계정이 있나요?{" "}
        <Link to="/login" className="font-bold text-neutral-900 underline">
          로그인
        </Link>
      </p>
    </main>
  );
}
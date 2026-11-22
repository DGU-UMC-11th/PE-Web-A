import { Link } from "@tanstack/react-router";
import { useState, type SubmitEvent } from "react";
import { checkEmailDuplicate } from "../../api/members/check-email-duplicate";
import { checkNicknameDuplicate } from "../../api/members/check-nickname-duplicate";
import { useSignupMutation } from "../../hooks/use-signup-mutation";
import "./signup-page.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;

const DEFAULT_FORM = {
  email: "",
  nickname: "",
  password: "",
  passwordConfirm: "",
};

const DEFAULT_DUPLICATE_CHECK = {
  isChecking: false,
  isAvailable: false,
};

type DefaultFormKey = keyof typeof DEFAULT_FORM;
type DefaultFormValue = (typeof DEFAULT_FORM)[DefaultFormKey];
type DuplicateCheckKey = "email" | "nickname";

export function SignupPage() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const signupMutation = useSignupMutation();
  const [duplicateCheck, setDuplicateCheck] = useState({
    email: DEFAULT_DUPLICATE_CHECK,
    nickname: DEFAULT_DUPLICATE_CHECK,
  });

  const isEmailValid = EMAIL_REGEX.test(form.email.trim());
  const isNicknameValid =
    form.nickname.trim().length >= 2 && form.nickname.trim().length <= 12;
  const isPasswordValid = PASSWORD_REGEX.test(form.password);
  const isPasswordConfirmValid =
    form.passwordConfirm.length > 0 && form.password === form.passwordConfirm;

  const isFormValid =
    isEmailValid &&
    isNicknameValid &&
    isPasswordValid &&
    isPasswordConfirmValid;

  const canSubmit =
    isFormValid &&
    duplicateCheck.email.isAvailable &&
    duplicateCheck.nickname.isAvailable;

  const fields = [
    {
      key: "email",
      label: "이메일",
      type: "email",
      autoComplete: "email",
      isValid: isEmailValid,
      message: "올바른 이메일 형식으로 입력해 주세요.",
    },
    {
      key: "nickname",
      label: "닉네임",
      type: "text",
      autoComplete: "nickname",
      isValid: isNicknameValid,
      message: "닉네임은 2~12자로 입력해 주세요.",
    },
    {
      key: "password",
      label: "비밀번호",
      type: "password",
      autoComplete: "new-password",
      isValid: isPasswordValid,
      message: "영문 대·소문자, 숫자, 특수문자(!@#$%^&*)를 포함해 8자 이상",
    },
    {
      key: "passwordConfirm",
      label: "비밀번호 확인",
      type: "password",
      autoComplete: "new-password",
      isValid: isPasswordConfirmValid,
      message: "비밀번호가 일치하지 않아요.",
    },
  ] as const;

  const handleChangeField = (key: DefaultFormKey, value: DefaultFormValue) => {
    if (key === "email" || key === "nickname") {
      if (duplicateCheck[key].isChecking) return;

      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: DEFAULT_DUPLICATE_CHECK,
      }));
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

      if (typeof response.available !== "boolean") {
        throw new Error("중복 확인 응답 형식이 올바르지 않아요.");
      }

      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: { isChecking: false, isAvailable: response.available },
      }));

      window.alert(
        response.available
          ? `사용할 수 있는 ${label}이에요.`
          : `이미 사용 중인 ${label}이에요.`,
      );
    } catch {
      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: DEFAULT_DUPLICATE_CHECK,
      }));

      window.alert("중복 확인에 실패했어요. 다시 시도해 주세요.");
    }
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || signupMutation.isPending) return;

    signupMutation.mutate({
      email: form.email.trim(),
      nickname: form.nickname.trim(),
      password: form.password,
    });
  };

  return (
    <main className="signup-page">
      <section className="signup-panel" aria-labelledby="signup-title">
        <h1 id="signup-title" className="signup-title">
          회원가입
        </h1>

        <form className="signup-form" onSubmit={handleSubmit} noValidate>
          {fields.map(({ key, label, type, autoComplete, isValid, message }) => {
            const id = `signup-${key}`;
            const check =
              key === "email" || key === "nickname"
                ? duplicateCheck[key]
                : undefined;

            const showError = form[key].length > 0 && !isValid;
            const showMessage = showError || key === "password";

            return (
              <div className="signup-field" key={key}>
                <label htmlFor={id}>{label}</label>

                <div className="signup-input-row">
                  <input
                    id={id}
                    name={key}
                    type={type}
                    autoComplete={autoComplete}
                    placeholder={`${label} 입력`}
                    value={form[key]}
                    disabled={check?.isChecking}
                    onChange={(event) =>
                      handleChangeField(key, event.target.value)
                    }
                    aria-invalid={showError}
                    aria-describedby={showMessage ? `${id}-message` : undefined}
                  />

                  {(key === "email" || key === "nickname") && (
                    <button
                      className="signup-check"
                      type="button"
                      disabled={!isValid || duplicateCheck[key].isChecking}
                      onClick={() => handleCheckDuplicate(key)}
                    >
                      {duplicateCheck[key].isChecking
                        ? "확인 중"
                        : duplicateCheck[key].isAvailable
                          ? "확인 완료"
                          : "중복 확인"}
                    </button>
                  )}
                </div>

                {showMessage && (
                  <p
                    id={`${id}-message`}
                    className={showError ? "signup-error" : "signup-hint"}
                  >
                    {message}
                  </p>
                )}
              </div>
            );
          })}

          <button
            className="signup-submit"
            type="submit"
            disabled={!canSubmit || signupMutation.isPending}
          >
            {signupMutation.isPending ? "가입 중" : "가입하기"}
          </button>
        </form>

        <p className="signup-login">
          이미 계정이 있으신가요?{" "}
          <Link to="/login">
            <span>로그인</span>
          </Link>
        </p>
      </section>
    </main>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useProfileStore } from "../../stores/profile-store";

import "../../components/signup-page.css";

import { checkEmailDuplicate } from "../../api/members/check-email-duplicate";
import { checkNicknameDuplicate } from "../../api/members/check-nickname-duplicate";
import { signup } from "../../api/members/signup";

// 이메일 형식 검사
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 영문 대소문자, 숫자, 특수문자를 포함한 8자 이상
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

type DuplicateCheckKey = "email" | "nickname";
type DefaultFormKey = keyof typeof DEFAULT_FORM;

export function SignupPage() {
  const setMember = useProfileStore((state) => state.setMember);
  const router = useRouter();
  // 회원가입 입력 상태
  const [form, setForm] = useState(DEFAULT_FORM);

  // 이메일 및 닉네임 중복 확인 상태
  const [duplicateCheck, setDuplicateCheck] = useState({
    email: { ...DEFAULT_DUPLICATE_CHECK },
    nickname: { ...DEFAULT_DUPLICATE_CHECK },
  });

  // 회원가입 요청 진행 상태
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 입력값 유효성 검사
  const isEmailValid = EMAIL_REGEX.test(form.email.trim());

  const isNicknameValid =
    form.nickname.trim().length >= 2 &&
    form.nickname.trim().length <= 12;

  const isPasswordValid = PASSWORD_REGEX.test(form.password);

  const isPasswordConfirmValid =
    form.passwordConfirm.length > 0 &&
    form.password === form.passwordConfirm;

  // 오류 메시지 표시 조건
  const showEmailError =
    form.email.length > 0 && !isEmailValid;

  const showNicknameError =
    form.nickname.length > 0 && !isNicknameValid;

  const showPasswordError =
    form.password.length > 0 && !isPasswordValid;

  const showPasswordConfirmError =
    form.passwordConfirm.length > 0 &&
    !isPasswordConfirmValid;

  // 전체 입력값 유효성 검사
  const isFormValid =
    isEmailValid &&
    isNicknameValid &&
    isPasswordValid &&
    isPasswordConfirmValid;

  // 입력값 검사 + 이메일/닉네임 중복 확인
  const canSubmit =
    isFormValid &&
    duplicateCheck.email.isAvailable &&
    duplicateCheck.nickname.isAvailable;

  // 입력값 변경
  const handleChangeField = (
    key: DefaultFormKey,
    value: string,
  ) => {
    // 이메일 또는 닉네임 변경 시 중복 확인 초기화
    if (key === "email" || key === "nickname") {
      if (duplicateCheck[key].isChecking) return;

      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: { ...DEFAULT_DUPLICATE_CHECK },
      }));
    }

    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // 이메일 및 닉네임 중복 확인 API
  const handleCheckDuplicate = async (
    key: DuplicateCheckKey,
  ) => {
    const isValid =
      key === "email" ? isEmailValid : isNicknameValid;

    if (!isValid || duplicateCheck[key].isChecking) return;

    const label = key === "email" ? "이메일" : "닉네임";

    setDuplicateCheck((prev) => ({
      ...prev,
      [key]: {
        isChecking: true,
        isAvailable: false,
      },
    }));

    try {
      const response =
        key === "email"
          ? await checkEmailDuplicate(form.email.trim())
          : await checkNicknameDuplicate(form.nickname.trim());

      const isAvailable = response.available;

      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          isAvailable,
        },
      }));

      alert(
        isAvailable
          ? `사용할 수 있는 ${label}이에요.`
          : `이미 사용 중인 ${label}이에요.`,
      );
    } catch {
      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          isAvailable: false,
        },
      }));

      alert("중복 확인에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          isChecking: false,
        },
      }));
    }
  };

  // 회원가입 API 요청
  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await signup({
        email: form.email.trim(),
        nickname: form.nickname.trim(),
        password: form.password,
      });

      if (!response.isSuccess) {
        alert(response.message);
        return;
      }

      setMember({ email: response.result.email, nickname: response.result.nickname });
      alert(response.message);
      router.push("/login");
    } catch {
      alert("회원가입에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="signup-page">
      <div className="signup-container">
        <h1 className="signup-title">회원가입</h1>

        <form
          className="signup-form"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* 이메일 */}
          <div className="signup-field">
            <label className="signup-label" htmlFor="email">
              이메일
            </label>

            <div className="signup-input-wrapper">
              <input
                id="email"
                className="signup-input"
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) =>
                  handleChangeField("email", e.target.value)
                }
                disabled={duplicateCheck.email.isChecking}
              />

              <button
                className="signup-check-button"
                type="button"
                disabled={
                  !isEmailValid ||
                  duplicateCheck.email.isChecking
                }
                onClick={() => handleCheckDuplicate("email")}
              >
                {duplicateCheck.email.isChecking
                  ? "확인 중"
                  : "중복 확인"}
              </button>
            </div>

            {showEmailError && (
              <p className="signup-error">
                올바른 이메일 형식을 입력해 주세요.
              </p>
            )}
          </div>

          {/* 닉네임 */}
          <div className="signup-field">
            <label className="signup-label" htmlFor="nickname">
              닉네임
            </label>

            <div className="signup-input-wrapper">
              <input
                id="nickname"
                className="signup-input"
                type="text"
                placeholder="2~12자"
                value={form.nickname}
                onChange={(e) =>
                  handleChangeField("nickname", e.target.value)
                }
                disabled={duplicateCheck.nickname.isChecking}
              />

              <button
                className="signup-check-button"
                type="button"
                disabled={
                  !isNicknameValid ||
                  duplicateCheck.nickname.isChecking
                }
                onClick={() => handleCheckDuplicate("nickname")}
              >
                {duplicateCheck.nickname.isChecking
                  ? "확인 중"
                  : "중복 확인"}
              </button>
            </div>

            {showNicknameError && (
              <p className="signup-error">
                닉네임은 2~12자로 입력해 주세요.
              </p>
            )}
          </div>

          {/* 비밀번호 */}
          <div className="signup-field">
            <label className="signup-label" htmlFor="password">
              비밀번호
            </label>

            <div className="signup-input-wrapper">
              <input
                id="password"
                className="signup-input"
                type="password"
                placeholder="8자 이상"
                value={form.password}
                onChange={(e) =>
                  handleChangeField("password", e.target.value)
                }
              />
            </div>

            <p className="signup-helper">
              영문 대소문자, 숫자, 특수문자를 모두 포함해
              8자 이상 입력해 주세요.
            </p>

            {showPasswordError && (
              <p className="signup-error">
                비밀번호 조건을 만족하지 않습니다.
              </p>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div className="signup-field">
            <label
              className="signup-label"
              htmlFor="passwordConfirm"
            >
              비밀번호 확인
            </label>

            <div className="signup-input-wrapper">
              <input
                id="passwordConfirm"
                className="signup-input"
                type="password"
                placeholder="다시 입력"
                value={form.passwordConfirm}
                onChange={(e) =>
                  handleChangeField(
                    "passwordConfirm",
                    e.target.value,
                  )
                }
              />
            </div>

            {showPasswordConfirmError && (
              <p className="signup-error">
                비밀번호가 일치하지 않습니다.
              </p>
            )}
          </div>

          {/* 회원가입 버튼 */}
          <button
            className="signup-submit"
            type="submit"
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? "가입 중" : "가입하기"}
          </button>
        </form>

        <p className="signup-login">
          이미 계정이 있나요?{" "}
          <a href="/login">로그인</a>
        </p>
      </div>
    </main>
  );
}

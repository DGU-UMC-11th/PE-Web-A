package com.umc.movie.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.*;
import java.nio.charset.StandardCharsets;

public record SignUpRequest(
        @NotBlank(message = "이메일을 입력해주세요.")
        @Email(message = "올바른 이메일 형식이 아닙니다.")
        @Size(max = 254, message = "이메일은 254자 이하로 입력해주세요.")
        String email,
        @NotBlank(message = "비밀번호를 입력해주세요.")
        @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*]).{8,}$",
                message = "비밀번호는 대문자/소문자/숫자/특수문자(!@#$%^&*)를 포함한 8자 이상이어야 합니다.")
        String password,
        @NotBlank(message = "닉네임을 입력해주세요.")
        @Size(min = 2, max = 12, message = "닉네임은 2자 이상 12자 이하로 입력해주세요.")
        String nickname
) {
    // bcrypt의 입력 한도를 넘겨 500 오류가 발생하지 않도록 바이트 길이를 검사합니다.
    @JsonIgnore
    @AssertTrue(message = "비밀번호는 UTF-8 기준 72바이트 이하로 입력해주세요.")
    public boolean isPasswordWithinByteLimit() {
        return password == null || password.getBytes(StandardCharsets.UTF_8).length <= 72;
    }
}

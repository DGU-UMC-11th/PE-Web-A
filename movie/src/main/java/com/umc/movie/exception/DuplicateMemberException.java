package com.umc.movie.exception;

public class DuplicateMemberException extends RuntimeException {
    public enum Field {
        EMAIL("MEMBER4091", "이미 사용 중인 이메일입니다."),
        NICKNAME("MEMBER4092", "이미 사용 중인 닉네임입니다.");

        private final String code;
        private final String message;

        Field(String code, String message) {
            this.code = code;
            this.message = message;
        }

        public String code() { return code; }
        public String message() { return message; }
    }

    private final Field field;

    public DuplicateMemberException(Field field) {
        super(field.message());
        this.field = field;
    }

    public Field field() { return field; }
}

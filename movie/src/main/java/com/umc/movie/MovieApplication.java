package com.umc.movie;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MovieApplication {

	public static void main(String[] args) {

		// 환경 변수가 전달되는지 확인
		System.out.println(
				"JWT_ACCESS_EXPIRATION 존재: " +
						(System.getenv("JWT_ACCESS_EXPIRATION") != null)
		);

		SpringApplication.run(MovieApplication.class, args);
	}
}
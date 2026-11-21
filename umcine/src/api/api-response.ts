// 백엔드 공통 응답 형태 (dto/ApiResponse.java)
export interface ApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}

// 내 정보 API는 8주차에 연결한다. 그 전까지 화면 확인용으로 쓰는 임시 사용자 정보
export interface MockUser {
  nickname: string;
  email: string;
  profileImageUrl: string | null;
}

export const MOCK_USER: MockUser = {
  nickname: "gs0428",
  email: "gwangsoo@cinemalab.kr",
  profileImageUrl: null,
};

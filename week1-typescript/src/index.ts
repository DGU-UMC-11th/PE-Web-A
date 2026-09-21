// 1. 타입 정의
type MemberRole = "leader" | "member";

interface StudyMember {
  id: number;
  name: string;
  role: MemberRole;
  githubId?: string; // 선택 값
}

// 2. 서로 다른 정보를 가진 회원
const members: StudyMember[] = [
  { id: 1, name: "광수", role: "leader", githubId: "gwangsoo" },
  { id: 2, name: "지수", role: "member" }, // githubId 없음
];

// 3. 역할에 따른 안내 문구
function describeRole(role: MemberRole) {
  if (role === "leader") {
    return "스터디를 이끌어요.";
  }

  return "스터디에 참여해요.";
}

// 4. 회원 ID로 정보 찾기
function findMember(memberId: number) {
  return members.find((member) => member.id === memberId);
}

// 5. 안내 문구 만들기
function createMemberCard(memberId: number) {
  const foundMember = findMember(memberId);

  if (!foundMember) {
    return memberId + "번 회원을 찾지 못했어요.";
  }

  const displayGithubId = foundMember.githubId ?? "등록되지 않음";

  return (
    foundMember.name +
    " 님은 " +
    describeRole(foundMember.role) +
    " (GitHub: " +
    displayGithubId +
    ")"
  );
}

// 6. 결과 확인
console.log(createMemberCard(1));
console.log(createMemberCard(2));
console.log(createMemberCard(999));

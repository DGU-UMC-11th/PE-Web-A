// 1주차 필수 미션: 스터디 회원 관리
// 역할은 정해진 두 가지 값만 사용 가능
type MemberRole = "leader" | "member";

interface StudyMember {
  id: number;
  name: string;
  role: MemberRole;
  githubId?: string;
}

const members: StudyMember[] = [
  { id: 1, name: "경섭", role: "leader", githubId: "kimgs1107" },
  { id: 2, name: "일반 챌린저", role: "member" },
];

function getRoleMessage(role: MemberRole) {
  if (role === "leader") {
    return "스터디를 이끌어요.";
  }

  return "스터디에 참여해요.";
}

function createMemberMessage(memberId: number) {
  const member = members.find((member) => member.id === memberId);

  // 검색 결과가 없으면 여기서 반환하여 프로퍼티 접근 오류를 방지
  if (!member) {
    return "ID " + memberId + ": 회원을 찾지 못했어요.";
  }

  const githubId = member.githubId ?? "등록되지 않음";

  return (
    "ID " + member.id + ": " + member.name + " 님, " +
    getRoleMessage(member.role) + " GitHub: " + githubId
  );
}

// 정상 회원, GitHub 아이디가 없는 회원, 존재하지 않는 회원 확인
console.log(createMemberMessage(1));
console.log(createMemberMessage(2));
console.log(createMemberMessage(999));

// 2 미니 실습: 컴파일 오류와 런타임 오류 구분하기
// const courseName = "TypeScript 핵심 문법 및 타입 시스템";
// console.log("이번 주 학습 주제: " + courseName);

// const currentLevel: number = 1;
// console.log("현재 레벨: " + currentLevel);

// 런타임 오류 실습
// const memberNames = ["광수"];
// console.log(memberNames[5].toUpperCase());

function introduceStudent(studentName: string, currentLevel: number) {
  return studentName + " 님은 현재 " + currentLevel + "레벨이에요.";
}

console.log(introduceStudent("광수", 1));

// 3 미니 실습: 값의 종류와 추론 확인하기
// let studentName = "광수";
// let studentLevel = 1; // 변수명 currentLevel에서 studentLevel로 변경
// let isCompleted = false;

// console.log(studentName, studentLevel, isCompleted);

// const firstMember = { name: "광수" };
// const secondMember = { name: "광수" };
// const sameMember = firstMember;

// console.log(firstMember === secondMember); // false
// console.log(firstMember === sameMember); // true

// const studyMember = { name: "광수" };

// studyMember.name = "지수";

// console.log(studyMember.name); // "지수"

// // studyMember = { name: "현우" };

// const studentNames: string[] = ["광수", "지수", "현우"];
// const weeklyScores: number[] = [80, 90, 100];

// studentNames.push("수빈");
// studentNames.push(123);

let learnerName = "경섭";
let currentLevel = 1;
let isCompleted = false;

console.log(learnerName, currentLevel, isCompleted);

// 문자열 배열
const monthlyLearn: string[] = [
    "HTML",
    "CSS",
    "JavaScript",
    "TypeScript",
];

// 타입 오류 확인 후 다시 주석 처리하기
// monthlyLearn.push(123);

// 내용이 같은 두 객체 비교
const memberA = { name: "광수" };
const memberB = { name: "광수" };

console.log(memberA === memberB); // 예상: false

// // 4 미니 실습: 객체와 함수에 타입 붙이기
// type StudyMember = {
//   name: string;
//   level: number;
//   isLeader: boolean;
// };

// const member: StudyMember = {
//   name: "경섭",
//   level: 1,
//   isLeader: false,
// };

// function createMemberCard(studyMember: StudyMember) {
//   return studyMember.name + " 님, " + studyMember.level + "레벨";
// }

// console.log(createMemberCard(member));

// 5 미니 실습: 유니언 타입과 타입 좁히기
// 1. 가능한 역할을 유니언 타입으로 정의
type MemberRole = "leader" | "member";

// 2~3. 역할에 따라 안내 문구 반환
function getRoleMessage(role: MemberRole) {
  if (role === "leader") {
    return "스터디를 이끌어요.";
  }

  return "스터디에 참여해요.";
}

console.log(getRoleMessage("leader"));
console.log(getRoleMessage("member"));

// 4. 주석을 해제하고 타입 오류 확인 후 다시 주석 처리
// console.log(getRoleMessage("manager"));

// 6 미니 실습: null과 undefined를 안전하게 다루기
type StudyMember = {
  name: string;
  githubId?: string;
};

const members: StudyMember[] = [
  { name: "경섭", githubId: "kimgs1107" },
  { name: "지수" },
];

// 1. 없는 이름 검색
const foundMember = members.find((member) => member.name === "현우");
console.log(foundMember); // undefined

// 2. 의도적으로 비어 있는 상태
let selectedMember: StudyMember | null = null;
console.log(selectedMember); // null

// 3. 회원이 있을 때만 이름 출력
if (foundMember) {
  console.log(foundMember.name);
} else {
  console.log("회원을 찾지 못했어요.");
}

// 4. 학습 시간이 0일 때 기본값 비교
const studyHour: number | undefined = 0;
console.log(studyHour || 1); // 1
console.log(studyHour ?? 1); // 0

// 5. 회원은 있지만 GitHub 아이디가 없는 경우
const memberWithoutGithub = members.find((member) => member.name === "지수");
console.log(memberWithoutGithub?.githubId ?? "등록되지 않음");

// 7 미니 실습: any 대신 unknown 사용하기
function formatStudyWeek(week: unknown) {
  if (typeof week === "number") {
    return "현재 " + week + "주차예요.";
  }

  if (typeof week === "string") {
    return "입력한 주차: " + week;
  }

  return "주차를 확인할 수 없어요.";
}

console.log(formatStudyWeek(1));
console.log(formatStudyWeek("2주차"));
console.log(formatStudyWeek(false));
console.log(formatStudyWeek(null));

// 미니 실습 8: 제네릭 <T>로 타입 관계 지키기
// 1. 받은 값을 객체에 담아 반환
function createBox<T>(value: T) {
  return { value };
}

// 2. 문자열, 숫자, 회원 객체 전달
const nameBox = createBox("경섭");
const scoreBox = createBox(100);
const memberBox = createBox({
  name: "경섭",
  githubId: "kimgs1107",
  level: 1,
});

// 3. 각 value에 마우스를 올려 타입 확인
console.log(nameBox.value);
console.log(scoreBox.value);
console.log(memberBox.value);

// 미니 실습 9: strict 모드와 타입 오류 읽기
type WeeklyGoal = {
  title: string;
  targetCount: number;
};

const weeklyGoal: WeeklyGoal = {
  title: "TypeScript 예제 연습",
  targetCount: 3,
};

function printGoal(goal: WeeklyGoal): string {
  console.log(goal.title);
  return goal.title;
}

// 함수 실행
printGoal(weeklyGoal);
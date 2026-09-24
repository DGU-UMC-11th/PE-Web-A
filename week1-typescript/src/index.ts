// //미니실습1
// // function introduceStudent(studentName: string, currentLevel: number) {
// //   return studentName + " 님은 현재 " + currentLevel + "레벨이에요.";
// // }

// // introduceStudent("광수", 1);//컴파일타입 오류,앞의 배열에서는 문법 오류는 없지만 논리오류가 있어 런타임때 오류가 생긴반면 현재 예제는 문법 오류이므로 컴파일에서 오류가 발생


// // const studyMember = { name: "광수" };

// // studyMember.name = "지수";

// // console.log(studyMember.name); // "지수"

// // // studyMember = { name: "현우" };

// //미니실습
// // type StudyMember = {
// //   name: string;
// //   level: number;
// //   isLeader: boolean;
// // };

// // const member: StudyMember = {
// //   name: "광수",
// //   level: 1,
// //   isLeader: true,
// // };

// // function createMemberCard(studyMember: StudyMember) {
// //   return studyMember.name + " 님, " + studyMember.level + "레벨";
// // }

// // console.log(createMemberCard(member));


// //미니실습
// // type MemberRole = "leader" | "member";
// // type AttendanceStatus = "present" | "late" | "absent";

// // const gwangsooRole: MemberRole = "leader";
// // const todayStatus: AttendanceStatus = "present";
// // function getRoleMessage(role: MemberRole): string {
// //   if (role === "leader") {
// //     return "스터디를 이끌어요.";
// //   } else {
// //     return "스터디에 참여해요.";
// //   }
// // }
// // console.log(getRoleMessage(gwangsooRole));
// // console.log(getRoleMessage("member"));

// // type StudyMember = {
// //   name: string;
// //   githubId?: string;
// // };

// // const members: StudyMember[] = [
// //   { name: "광수", githubId: "gwangsoo" },
// //   { name: "지수" },
// // ];

// // let selectedMember: StudyMember | null = null;
// // const foundMember = members.find((member) => member.name === "현우");

// // console.log(selectedMember); // null
// // console.log(foundMember); // undefined


// type StudyMember = {
//   name: string;
//   githubId?: string;
//   studyHour: number;
// };

// const members: StudyMember[] = [
//   { name: "광수", githubId: "gwangsoo123", studyHour: 3 },
//   { name: "철수", studyHour: 0 },
// ];

// // 1. 없는 이름 찾기 → undefined
// const notFoundMember = members.find((member) => member.name === "영희");

// console.log(notFoundMember);
// // undefined


// // 2. StudyMember | null 변수에 null 넣기
// let selectedMember: StudyMember | null = null;

// console.log(selectedMember);
// // null


// // 3. 회원이 있을 때만 이름 출력
// selectedMember = members[0];

// if (selectedMember !== null) {
//   console.log(selectedMember.name);
//   // 광수
// }


// // 4. 학습 시간이 0일 때 || 와 ?? 비교
// const studyHour: number | undefined = 0;

// console.log(studyHour || 1);
// // 1

// console.log(studyHour ?? 1);
// // 0


// // 5. ?. 와 ?? 사용하기
// const member = members[1];

// console.log(member?.githubId ?? "등록되지 않음");
// // 등록되지 않음


// function formatStudyWeek(value: unknown) {
//   if (typeof value === "number") {
//     return `현재 ${value}주차예요.`;
//   }

//   if (typeof value === "string") {
//     return `입력한 주차: ${value}`;
//   }

//   return "주차를 확인할 수 없어요.";
// }

// type WeeklyGoal = {
//   title: string;
//   targetCount: number;
// };

// const weeklyGoal: WeeklyGoal = {
//   title: "TypeScript 예제 연습",
//   targetCount: 3,
// };

// function printGoal(goal: WeeklyGoal): string {
//   console.log(goal.title);
//   return goal.title;
// } //어떤 값을 반환하는지 typescript가 검사하기 위해 반환타입을 정한다.

//필수미션
type MemberRole = "leader" | "member";

type StudyMember = {
  id: number;
  name: string;
  githubId?: string;
  role: MemberRole;
};

const members: StudyMember[] = [
  {
    id: 1,
    name: "광수",
    githubId: "gwangsoo123",
    role: "leader",
  },
  {
    id: 2,
    name: "철수",
    role: "member",
  },
];

function getMemberInfo(id: number): string {
  const member = members.find((member) => member.id === id);

  if (member === undefined) {
    return "존재하지 않는 회원입니다.";
  }

  const githubId = member.githubId ?? "등록되지 않음";

  return `name: ${member.name}, role: ${member.role}, GitHub: ${githubId}`;
}

console.log(getMemberInfo(1));
console.log(getMemberInfo(2));
console.log(getMemberInfo(999));



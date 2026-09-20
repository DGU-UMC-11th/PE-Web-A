//필수 미션
type MemberRole = "leader"|"member";

type StudyMember = {
    id: number
    name: string;
    role: MemberRole;
    githubID?:string;
}

const members:StudyMember[]=[
    { 
        id: 1, 
        name: "주헌", 
        role: "leader", 
        githubID: "wngjs8114"
    },
    { 
        id: 2, 
        name: "철수", 
        role: "member", 
        githubID: "ironwater"
    },
    { 
        id: 3, 
        name: "영희",
        role: "member", 
    },
]

function getMemberInfo(id: number): string {
    const  foundMember = members.find((member) => member.id === id);

    if(!foundMember){
        return "존재하지 않는 회원입니다."
    }

    const githubID = foundMember.githubID ?? "등록되지 않음";

    return foundMember.name + "/" + foundMember.role+" / GitHub: " + githubID;
}

console.log(getMemberInfo(1));
console.log(getMemberInfo(2));
console.log(getMemberInfo(3));
console.log(getMemberInfo(999));


//선택 미션 1
type StudyMemberType = {
    id: number;
    name: string;
    role: MemberRole;
    githubID?:string;
};

interface StudyMemberInterface {
    id: number;
    name: string;
    role: MemberRole;
    githubID?:string;
}

/*
type과 interface 모두 객체가 가져야 할 프로퍼티와 타입을 정의할 수 있다. 
interface는 주로 객체의 구조를 표현하고 extends를 이용해 확장할 수 있으며, 같은 이름으로 선언하면 선언 병합이 가능하다.
type은 객체뿐 아니라 "leader" | "member" 같은 유니언 타입도 표현할 수 있고, 다른 타입과 결합할 때 & 등을 사용할 수 있다.
*/

//선택 미션 2
const studyHour: number | undefined = 0;

console.log(studyHour || 1);
console.log(studyHour ?? 1);

/*
||는 왼쪽 값이 falsy이면 오른쪽 값을 사용한다. 0은 falsy이기 때문에 studyHour || 1의 결과는 1이다.
반면 ??는 왼쪽 값이 null이나 undefined일 때만 오른쪽 값을 사용한다.
따라서 0은 정상적인 값으로 유지되어 studyHour ?? 1의 결과는 0이다.
*/

//선택 미션 3
function formatMemberId(input: unknown): string{
    if (typeof input === "number") {
        return "회원 ID: " + input;
    }

    if (typeof input === "string") {
        return "입력한 ID: " + input;
    }

    return "올바른 회원 ID가 아닙니다.";
}

console.log(formatMemberId(1));
console.log(formatMemberId("1"));
console.log(formatMemberId(true));

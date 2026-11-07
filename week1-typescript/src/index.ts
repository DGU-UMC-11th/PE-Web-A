type Role = "Plan" | "Web";
type Member = {
    id : number;
    name : string;
    role : Role;
    githubId? : string;
};
const members : Member[] = [
    {
        id : 1,
        name : "수나",
        role : "Plan",
    }, 
    {
        id : 2,
        name : "지연",
        role : "Web",
        githubId : "jiyeon0220",
    },
];
/**
 * 회원 ID에 해당하는 이름, 역할, GitHub ID를 조합한 프로필을 반환합니다.
 *
 * @param id - 조회할 회원 ID
 * @returns 회원 프로필 또는 회원이 존재하지 않는다는 안내 메시지
 */
function profile(id : number){
    const foundMember = members.find((member) => member.id == id);
    if(!foundMember){
        return "존재하지 않는 회원입니다.";
    }
    const githubID = foundMember.githubId ?? "등록되지 않음";
    return foundMember.name + "/" + foundMember.role + "/" + githubID;
}

console.log(profile(1));
console.log(profile(2));
console.log(profile(999));

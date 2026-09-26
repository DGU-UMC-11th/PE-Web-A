"use strict";
const popcorn = {
    memId: "1",
    name: "Popcorn",
    role: "leader",
    githubId: "popcorn123",
};
const goeun = {
    memId: "2",
    name: "Goeun",
    role: "member",
};
const members = [popcorn, goeun];
function getMemberMessage(memId) {
    const foundMember = members.find((member) => member.memId === memId);
    if (!foundMember) {
        return "존재하지 않는 회원입니다.";
    }
    const githubText = foundMember.githubId ?? "등록되지 않음";
    return "회원 이름: " + foundMember.name + ", GitHub ID: " + githubText;
}
console.log(getMemberMessage("1"));
console.log(getMemberMessage("2"));
console.log(getMemberMessage("999"));

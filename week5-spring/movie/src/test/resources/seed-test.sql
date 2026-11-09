DELETE FROM rating;
DELETE FROM member;
INSERT INTO member (member_id,email,password,nickname) VALUES
(1,'noco@umc.com','dummy','수현'), (2,'minseo@umc.com','dummy','민서'), (3,'empty@umc.com','dummy','빈회원');
INSERT INTO rating (rating_id,member_id,movie_id,score,comment) VALUES
(1,1,550,5,'최고의 영화!'), (2,1,155,4,'다시 봐도 명작'), (3,2,550,3,'호불호');

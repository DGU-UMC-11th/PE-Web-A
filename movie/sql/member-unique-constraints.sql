-- MySQL 8 사전 점검. SELECT만 실행하며 DB를 변경하지 않는다.
-- 대상 DB를 선택하고 실행한다. proposed_sql은 검토/승인 후 별도로 실행한다.
-- 전체 길이 단일 컬럼 UNIQUE가 정확히 하나일 때만 RENAME INDEX를 제안한다.
-- 누락, 중복, prefix UNIQUE, 이름 충돌은 자동 수정하지 않는다.
WITH expected AS (
    SELECT 'email' AS column_name, 'uk_member_email' AS target_name
    UNION ALL SELECT 'nickname', 'uk_member_nickname'
), indexes AS (
    SELECT INDEX_NAME AS index_name, MIN(NON_UNIQUE) AS non_unique,
           COUNT(*) AS column_count, MAX(COLUMN_NAME) AS column_name,
           MAX(SUB_PART) AS prefix_length
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'member'
    GROUP BY INDEX_NAME
), checked AS (
    SELECT e.column_name, e.target_name, COUNT(i.index_name) AS candidate_count,
           MAX(i.index_name) AS current_name, MAX(i.prefix_length) AS prefix_length,
           EXISTS(SELECT 1 FROM indexes t WHERE t.index_name = e.target_name) AS target_exists
    FROM expected e
    LEFT JOIN indexes i ON i.column_name = e.column_name
        AND i.column_count = 1 AND i.non_unique = 0 AND i.index_name <> 'PRIMARY'
    GROUP BY e.column_name, e.target_name
), assessed AS (
    SELECT *, CASE
        WHEN DATABASE() IS NULL THEN 'NO_DATABASE_SELECTED'
        WHEN candidate_count = 0 THEN 'MISSING_SINGLE_COLUMN_UNIQUE'
        WHEN candidate_count > 1 THEN 'MULTIPLE_UNIQUE_INDEXES_REVIEW_REQUIRED'
        WHEN prefix_length IS NOT NULL THEN 'PREFIX_UNIQUE_REVIEW_REQUIRED'
        WHEN current_name = target_name THEN 'ALREADY_NAMED'
        WHEN target_exists THEN 'TARGET_NAME_CONFLICT'
        ELSE 'RENAME_REQUIRES_APPROVAL'
    END AS review_status
    FROM checked
)
SELECT column_name, current_name, target_name, candidate_count, review_status,
       CASE WHEN review_status = 'RENAME_REQUIRES_APPROVAL' THEN
           CONCAT('ALTER TABLE `', REPLACE(DATABASE(), '`', '``'),
                  '`.`member` RENAME INDEX `', REPLACE(current_name, '`', '``'),
                  '` TO `', target_name, '`;')
       END AS proposed_sql
FROM assessed
ORDER BY column_name;

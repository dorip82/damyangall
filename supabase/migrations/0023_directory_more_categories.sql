-- 지역정보(업체 디렉터리) 카테고리 추가: 미용 · 피부/네일 · 병의원 · 운동 · 학원 · 자동차 · 생활서비스.
-- enum 에 값만 더하므로 기존 업체 데이터는 바뀌지 않는다.
alter type directory_category add value if not exists 'BEAUTY_SALON';
alter type directory_category add value if not exists 'SKIN_CARE';
alter type directory_category add value if not exists 'HOSPITAL';
alter type directory_category add value if not exists 'FITNESS';
alter type directory_category add value if not exists 'ACADEMY';
alter type directory_category add value if not exists 'AUTO_SERVICE';
alter type directory_category add value if not exists 'LIFE_SERVICE';

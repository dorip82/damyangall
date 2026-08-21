-- 사이트 전역 푸터(PortalFooter) 문구를 관리자 페이지(메인 페이지 관리)에서
-- 편집할 수 있도록 main_page_settings에 컬럼을 추가한다. 기본값은 현재
-- PortalFooter.tsx에 하드코딩되어 있던 문구 그대로.
alter table public.main_page_settings
  add column if not exists footer_title text not null default '올담',
  add column if not exists footer_description text not null default '담양의 모든 이야기를 담다. 담양군민, 동아리·동호회, 기업·소상공인, 기관·단체가 함께 만들어가는 지역 통합 플랫폼입니다.';

# 소리향기 (ALLDAM Phase 0)

담양 오카리나 동아리 "소리향기"의 공식 홈페이지. ALLDAM(올담) 지역 통합 플랫폼의 첫 단계로,
`damyangall.kr`의 서브도메인(`sorihyanggi.damyangall.kr`)에서 서비스되는 단일 동아리 사이트다.
자세한 배경과 향후 확장 방향은 `ALLDAM_MASTER_SPEC.md`, 이번 범위의 구현 계획은
`docs/PLAN.md`를 참고한다.

## 스택

Next.js (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · Supabase (Postgres/Auth) · Pretendard

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. Supabase 프로젝트 준비

1. [supabase.com](https://supabase.com)에서 새 프로젝트 생성 (리전 예: Northeast Asia (Seoul))
2. `.env.example`을 복사해 `.env.local` 생성 후 값 채우기:

```bash
cp .env.example .env.local
```

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`: Supabase 프로젝트 설정 → API에서 확인
- `NEXT_PUBLIC_KAKAO_MAP_KEY`: 아직 없으면 비워둬도 됨 (지도 블록은 키가 없으면 준비 중 안내로 대체됨)
- `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_ROOT_DOMAIN`: 기본값 그대로 사용 가능

### 3. DB 마이그레이션 적용

Supabase CLI로 프로젝트를 연결한 뒤 마이그레이션을 적용한다.

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
```

(또는 Supabase 대시보드의 SQL Editor에서 `supabase/migrations/*.sql`을 순서대로 직접 실행해도 된다.)

적용 후 확인:

```sql
select relname, relrowsecurity from pg_class
where relname in ('sites','site_pages','site_posts') ;
-- relrowsecurity가 모두 true여야 한다
```

### 4. 시드 데이터 생성

`sites`, `site_pages`, `site_posts` 등 소리향기 사이트의 초기 데이터와 관리자 계정을 생성한다.

```bash
npm run seed
```

실행 결과에 표시되는 **관리자 이메일/임시 비밀번호를 반드시 기록**해둔다 (다시 출력되지 않음).
이미 `sorihyanggi` slug의 사이트가 있으면 시드는 건너뛴다.

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저(Chrome/Edge/Firefox)는 `*.localhost`를 별도 hosts 설정 없이 loopback으로 처리하므로:

- 동아리 홈페이지: <http://sorihyanggi.localhost:3000>
- 관리자: <http://sorihyanggi.localhost:3000/admin> (시드로 생성된 계정으로 로그인)
- 루트(서브도메인 없음): <http://localhost:3000> — 올담 메인 포털 자리, 지금은 "준비 중" 안내만 표시

## 프로젝트 구조 요점

- `proxy.ts` — 서브도메인(`[slug].damyangall.kr`)을 감지해 `x-site-slug` 헤더를 붙이고, 공개
  페이지 요청을 내부적으로 `/site/...`로 rewrite한다. 브라우저 주소창에는 영향 없음.
- `app/page.tsx` — 루트 도메인(서브도메인 없음)용 자리 표시자. 향후 올담 메인 포털이 들어갈 자리.
- `app/site/**` — 동아리 공개 페이지 (홈/서브페이지/활동내역), `site-theme` 색상 테마 적용.
- `app/admin/**` — 로그인 게이트가 걸린 사이트별 관리자 화면. `(protected)` 하위는 인증 +
  `site_members` 권한을 서버에서 재검증한 뒤에만 렌더링된다.
- `components/blocks/**` — JSONB 블록 렌더러 (`site_pages.content`, `site_posts.content`).
- `supabase/migrations/**` — 스키마 + RLS 정책 + 인덱스. `supabase/seed.ts` — 초기 데이터.

## 남은 작업 (미해결 항목)

- **운영 배포**: Vercel에 `damyangall.kr` + `*.damyangall.kr` 와일드카드 도메인을 연결해야 함 (아직 미설정).
- **Kakao Maps 키**: 없으면 지도 블록은 "준비 중" 카드로 대체됨.
- **실제 콘텐츠**: 소개 문구, 회원 수, 모임 일정, 연락처, SNS, 실제 사진(히어로/갤러리/로고)이
  모두 placeholder 상태 — `/admin`에서 직접 채워 넣거나 `supabase/seed.ts` 수정 후 재시드.
- **관리자 비밀번호**: 시드가 출력한 임시 비밀번호는 최초 로그인 후 반드시 변경.

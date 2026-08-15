# 소리향기(Sori-hyanggi) 동아리 홈페이지 — ALLDAM Phase 0

## Context

`ALLDAM_MASTER_SPEC.md`는 담양 지역 전체를 아우르는 대형 멀티사이트 플랫폼(올담)의 최종 설계도다. 하지만 지금 실제로 준비된 것은 도메인 `damyangall.kr` 하나뿐이고, 사용자가 지금 원하는 것은 그 전체 플랫폼이 아니라 **동아리 "소리향기"(오카리나 동아리, 담양관내 행사 공연 위주) 하나의 홈페이지**다. 다만 이후 다른 동아리/업체 사이트가 추가될 때 구조를 갈아엎지 않도록, 스펙의 멀티사이트 원칙(`site_id` 중심 설계, JSONB 블록 시스템, RLS 기반 권한 분리)은 처음부터 따른다.

확정된 범위 (사용자 확인 완료):
- 지금은 소리향기 동아리 사이트(메인페이지 + 서브페이지 몇 개)만 만든다. 올담 메인 포털(뉴스/커뮤니티/광고 등)은 만들지 않는다.
- 배포 형태는 **서브도메인**: `sorihyanggi.damyangall.kr` (경로 기반 `/site/[slug]`가 아님).
- 지금 Supabase까지 함께 설정한다 (DB + Auth + RLS).
- 로그인 후 콘텐츠를 고칠 수 있는 **간단한 관리자 편집 화면**도 필요하다 (완전한 드래그앤드롭 블록 빌더는 이후 단계).
- 동아리 실제 정보: 이름 "소리향기", 오카리나 동아리, 담양관내 행사에서 주로 공연. 그 외(소개 문구, 연락처, 사진 등)는 아직 없으므로 "준비 중" 표시가 있는 placeholder로 시작하고 나중에 실제 정보로 교체한다.

목표: 위 범위를 스펙과 일관된 최소 구조로 구현해, 나중에 올담 플랫폼 전체로 확장할 때 이 사이트 하나를 갈아엎지 않고 그대로 편입시킬 수 있게 한다.

---

## 1. 프로젝트 스캐폴드 및 디렉터리 구조

```
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*"
npx shadcn@latest init
npm i @supabase/supabase-js @supabase/ssr zod react-hook-form @hookform/resolvers lucide-react tsx
```

스펙 5장 구조를 축소 적용 (news/events/directory/community/clubs/search, 통합관리자 전체 트리는 제외):

```
WEB/
├── app/
│   ├── layout.tsx                  # 폰트, CSS 변수 — 시각적 chrome 없음
│   ├── globals.css                 # Tailwind + 색상 토큰 + Pretendard
│   ├── page.tsx                    # 루트 도메인(subdomain 없음)용 "준비 중" 안내 페이지
│   ├── not-found.tsx
│   ├── (site)/
│   │   ├── layout.tsx              # SiteHeader/SiteFooter/SiteNavigation, site+settings+menus 조회
│   │   ├── page.tsx                # 홈 (is_home 페이지)
│   │   ├── [pageSlug]/page.tsx     # 소개, 오시는길·문의 등 서브페이지
│   │   └── posts/
│   │       ├── page.tsx            # 활동내역 목록
│   │       └── [postId]/page.tsx   # 활동내역 상세
│   ├── admin/
│   │   ├── layout.tsx              # 인증 + 사이트 멤버십 서버 체크
│   │   ├── login/page.tsx
│   │   ├── page.tsx                # 대시보드 lite
│   │   ├── site-info/page.tsx      # sites + site_settings 편집
│   │   ├── pages/page.tsx
│   │   ├── pages/[pageId]/page.tsx # 블록 props 폼 편집
│   │   └── posts/{page.tsx,new/page.tsx,[postId]/page.tsx}
│   └── auth/callback/route.ts
├── components/
│   ├── ui/                         # shadcn 기본 컴포넌트
│   ├── site/{SiteHeader,SiteFooter,SiteNavigation}.tsx
│   ├── blocks/
│   │   ├── BlockRenderer.tsx
│   │   └── {Hero,Text,Image,Gallery,Card,Map,Contact,Sns,Divider,Spacer}Block.tsx
│   └── admin/
│       ├── {AdminSidebar,AdminHeader}.tsx
│       └── block-forms/{Hero,Text,Image,Gallery,Card,Map,Contact,Sns}BlockForm.tsx
├── lib/
│   ├── supabase/{client.ts,server.ts,admin.ts}
│   ├── site/{get-site-by-slug.ts,current-site.ts}
│   ├── blocks/{types.ts,validate.ts}
│   ├── auth/require-site-role.ts
│   └── utils/domain.ts
├── types/{database.ts,site.ts}
├── supabase/
│   ├── migrations/{0001_init_core.sql,0002_rls_policies.sql,0003_indexes.sql}
│   ├── seed.ts
│   └── config.toml
├── middleware.ts
├── .env.example
└── README.md
```

`/admin`은 `/site/[slug]/admin`이 아니라 사이트 서브도메인 아래 그대로 둔다 — 서브도메인 자체가 이미 사이트를 특정하므로 경로에 slug를 또 넣을 필요가 없고, 실제 운영 URL(`sorihyanggi.damyangall.kr/admin`)과도 정확히 일치한다.

---

## 2. 서브도메인 미들웨어

처리할 호스트 패턴:
- `damyangall.kr`, `www.damyangall.kr` → 사이트 없음, `app/page.tsx`(추후 올담 메인 포털 자리, 지금은 "준비 중" 안내)
- `sorihyanggi.damyangall.kr` → `(site)` 라우트 그룹, slug=`sorihyanggi`
- 로컬 개발: `sorihyanggi.localhost:3000` — Chrome/Edge/Firefox가 hosts 파일 수정 없이 `*.localhost`를 loopback으로 처리
- 존재하지 않는 서브도메인 → "사이트를 찾을 수 없습니다" (루트로 조용히 폴백하지 않음)

`middleware.ts`는 호스트에서 서브도메인을 파싱해 **`x-site-slug` 요청 헤더로 부착**하는 것이 핵심 역할이다. Next.js 라우트 그룹 `(site)`는 URL 세그먼트를 추가하지 않으므로 실제 경로를 rewrite할 필요는 없다 — 항상 `NextResponse.next({ request: { headers } })`로 헤더만 얹으면 된다 (경로별로 rewrite/next를 분기했던 초안은 불필요한 구분이라 단순화).

```ts
import { NextResponse, type NextRequest } from "next/server";

function resolveSubdomain(hostHeader: string, rootDomain: string): string | null {
  const host = hostHeader.split(":")[0].toLowerCase();

  if (host.endsWith(".localhost")) {
    const sub = host.replace(".localhost", "");
    return sub && sub !== "www" ? sub : null;
  }
  if (host === "localhost" || host === "127.0.0.1") return null;

  if (host === rootDomain || host === `www.${rootDomain}`) return null;
  if (host.endsWith(`.${rootDomain}`)) {
    const sub = host.slice(0, -(`.${rootDomain}`.length + 1));
    if (sub.includes(".")) return null; // multi-level subdomain: 지원 안 함
    return sub;
  }
  return null; // vercel.app preview 등 인식 못하는 호스트는 루트로 취급
}

export function middleware(req: NextRequest) {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "damyangall.kr";
  const subdomain = resolveSubdomain(req.headers.get("host") ?? "", rootDomain);
  if (!subdomain) return NextResponse.next();

  const headers = new Headers(req.headers);
  headers.set("x-site-slug", subdomain);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|icons|fonts).*)"],
};
```

`lib/site/current-site.ts`:
```ts
import { headers } from "next/headers";
export function getCurrentSiteSlug(): string | null {
  return headers().get("x-site-slug");
}
```

`(site)/layout.tsx`와 `admin/layout.tsx` 모두 `getCurrentSiteSlug()`가 null이면(=루트 도메인) 각각 `notFound()` / 안내 후 리다이렉트. 실제 "사이트 없음" 처리는 `getSiteBySlug()`가 RLS로 걸러진 결과가 없을 때 `notFound()`를 호출하는 방식으로 구현한다.

---

## 3. Supabase

### 3.1 클라이언트 (`lib/supabase/`)
- `client.ts`: `createBrowserClient` (anon key)
- `server.ts`: `createServerClient` (cookies, `@supabase/ssr`) — 모든 서버 조회/쓰기는 이 RLS 적용 클라이언트를 사용
- `admin.ts`: service role — **브라우저에 번들되는 어떤 파일에서도 import 금지**, `supabase/seed.ts`에서만 사용

### 3.2 `.env.example`
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_KAKAO_MAP_KEY=
NEXT_PUBLIC_SITE_URL=http://sorihyanggi.localhost:3000
NEXT_PUBLIC_ROOT_DOMAIN=damyangall.kr
```
(`NEXT_PUBLIC_ROOT_DOMAIN`은 미들웨어 때문에 필요한 이번 범위 전용 추가 항목.)

### 3.3 최소 테이블 (스펙 9장/11.1 부분집합)
지금 필요한 것만: `users`, `site_templates`, `sites`, `site_members`, `site_settings`, `site_pages`, `site_menus`, `site_posts`. news/events/community/ads/reports/notifications/audit_logs/comments/likes는 이번 범위 아님.

`0001_init_core.sql` 주요 내용 (순서: enum → users → site_templates → sites → site_members → site_settings → site_pages → site_menus → site_posts):
- enum: `user_role`, `user_status`, `site_status`, `site_member_role`, `site_member_status`, `site_template_category`, `post_status`, `menu_type`
- 각 테이블 컬럼은 스펙 9.1~9.7, 11.1과 동일하게 구성 (담당 Plan 에이전트가 작성한 전체 SQL을 그대로 사용 — 아래 "세부 SQL" 참고)
- `site_pages`에 사이트당 홈페이지 1개 제약: `create unique index site_pages_one_home_per_site on public.site_pages (site_id) where (is_home);`
- `set_updated_at()` 트리거를 모든 테이블에 부착
- `auth.users` insert 시 `public.users` 행을 자동 생성하는 `handle_new_auth_user()` 트리거 (security definer)

전체 SQL 원문은 Plan 에이전트 산출물의 §3.3에 이미 확정되어 있으므로 그대로 파일에 옮겨 적는다 (아래 "세부 SQL" 섹션 참고).

### 3.4 RLS (`0002_rls_policies.sql`)
원칙: 모든 테이블 RLS 활성화. 공개 조회는 `status='ACTIVE'`인 사이트에 속한 게시(published) 콘텐츠만. 쓰기는 `site_members`에서 해당 `site_id`에 대해 `SITE_ADMIN`/`EDITOR` 권한을 가진 사용자만 (콘텐츠는 EDITOR 이상, 사이트 정보/설정/멤버/메뉴는 SITE_ADMIN만 — 스펙 7.2/8과 일치). `public.users.role='SUPER_ADMIN'`인 경우 전체 우회하는 `is_super_admin()` 헬퍼도 지금부터 넣어둔다 (지금은 쓸 UI가 없지만 이후 플랫폼 확장 시 정책을 다시 쓸 필요가 없도록).

헬퍼 함수: `is_super_admin()`, `is_site_editor(site_id)`, `is_site_admin(site_id)` (모두 `security definer`, `stable`).

테이블별 정책 요지:
- `users`: 본인 행만 select/update
- `sites`: `status='ACTIVE'` 또는 해당 사이트 editor 이상만 select; update는 site admin만; insert/delete는 super admin만 (사이트 생성은 이번 범위 밖 — seed로만 생성)
- `site_members`: 본인 행 또는 해당 사이트 admin만 select; 쓰기는 site admin만
- `site_settings`: 활성 사이트는 공개 select, 쓰기는 site admin만
- `site_templates`: `is_active`면 전체 공개 select (쓰기는 서비스 롤/시드만)
- `site_pages`: `is_published`이고 사이트가 ACTIVE면 공개 select, editor 이상은 항상 select 가능; 쓰기는 editor 이상
- `site_menus`: `is_visible`이고 사이트가 ACTIVE면 공개 select; 쓰기는 site admin만 (메뉴 구성은 디자인 성격으로 판단 — EDITOR도 메뉴를 고칠 수 있어야 하면 이후 조정)
- `site_posts`: `status='PUBLISHED'`이고 사이트가 ACTIVE면 공개 select; 쓰기는 editor 이상

전체 정책 SQL은 Plan 에이전트 산출물 §3.4에 확정되어 있으므로 그대로 옮겨 적는다.

### 3.5 인덱스 (`0003_indexes.sql`)
스펙 50장 중 이번 범위 테이블에 해당하는 것만: `sites.slug/status/category`, `site_members.site_id/user_id`, `site_pages.site_id/slug`, `site_posts.site_id/published_at`, `site_menus.site_id`.

---

## 4. 시드 데이터 (소리향기)

`supabase/seed.ts` (raw SQL이 아니라 TS 스크립트 — `supabase.auth.admin.createUser`로 인증 유저를 먼저 만들어야 `site_members`가 참조할 수 있음). `tsx supabase/seed.ts`로 로컬에서 1회 실행, service role key 사용.

순서:
1. `site_templates`: `{ name: '동아리 기본형', category: 'CLUB', schema: {...}, is_active: true }`
2. `auth.admin.createUser`로 관리자 계정 생성 (랜덤 비밀번호, 콘솔에 1회 출력, 커밋 금지)
3. `public.users` 행 (role='SITE_ADMIN' — 설명용, 실제 권한은 site_members가 담당)
4. `sites` 행: name='소리향기', slug='sorihyanggi', category='동아리', subcategory='오카리나', description은 실제 정보(오카리나 동아리, 담양관내 행사 공연 위주)로 채우고 phone/email/address/business_hours/instagram_url은 null(관리자 화면에서 채우도록 placeholder), status='ACTIVE'
5. `site_members`: SITE_ADMIN 연결
6. `site_settings`: 스펙 27장 색상 토큰 기본값, seo_title/description 채움
7. 홈 `site_pages` (slug='home', is_home=true, is_published=true): hero + text(소개, 실제 정보 반영) + card(활동소식 site_posts 연동) + contact(placeholder) + sns(placeholder) 블록
8. 서브페이지 2개: `about`(소개, 준비중 표시 포함), `contact`(오시는길·문의, map+contact)
9. `site_menus`: 홈/소개/활동내역/오시는길·문의
10. `site_posts` 3개 placeholder ("[샘플] 담양 OO축제 공연" 형태, 명확히 준비중 표시)

동아리 이름/종류/활동 내용처럼 실제로 확인된 정보는 그대로 쓰고, 연락처·사진·상세 소개처럼 아직 없는 항목만 "준비 중"이 드러나는 placeholder로 표시한다.

---

## 5. 공개 페이지 (축소된 Block System)

`lib/blocks/types.ts`에 `BlockType = hero|text|image|gallery|card|map|contact|sns|divider|spacer` 및 `Block`/`PageContent` 타입 정의.

`BlockRenderer`는 `type`에 따라 분기, 알 수 없는 타입은 렌더링하지 않고 dev 환경에서만 경고 로그 (콘텐츠가 JSONB라 방어적으로 처리).

라우트:
- `(site)/layout.tsx`: `x-site-slug` 헤더로 사이트 조회(RLS 적용 anon 클라이언트) → 없으면 `notFound()`. `site_settings`(CSS 변수 오버라이드), `site_menus` 조회 → `SiteHeader`+children+`SiteFooter`
- `(site)/page.tsx`: `is_home=true` 페이지를 `BlockRenderer`로 렌더
- `(site)/[pageSlug]/page.tsx`: `(site_id, slug, is_published=true)`로 조회, 없으면 404
- `(site)/posts/page.tsx`: `site_posts` published 목록, 페이지네이션
- `(site)/posts/[postId]/page.tsx`: 상세 + 조회수 증가(server action)

`MapBlock`은 `NEXT_PUBLIC_KAKAO_MAP_KEY` 없으면 깨진 스크립트 대신 "지도가 준비되면 표시됩니다" placeholder 카드 렌더.

---

## 6. 최소 관리자 화면

- `/admin/login`: 이메일/비밀번호 폼 (`signInWithPassword`)
- `/admin/layout.tsx` (서버): ① slug 없으면 리다이렉트 ② 미로그인이면 `/admin/login`으로 ③ `site_members`에서 `(site.id, user.id)` + role in (SITE_ADMIN,EDITOR) + status=ACTIVE 조회 — 이 조회 자체가 RLS로 보호되므로 비멤버는 UI와 무관하게 데이터를 못 받음 (스펙 4.4 원칙)
- `/admin/site-info`: `sites`+`site_settings` 폼 편집 (server action, site admin만 DB 레벨에서 통과)
- `/admin/pages`, `/admin/pages/[pageId]`: 페이지 목록 + 블록 타입별 소형 폼(react-hook-form + zod)으로 `props`만 편집 — 드래그앤드롭/블록 추가삭제/순서변경은 이번 범위 밖 (스펙 57장 전체 빌더는 다음 단계)
- `/admin/posts` 등: `site_posts` 표준 CRUD 폼 (제목/카테고리/내용/썸네일/상태/게시일)
- 모든 admin server action은 `requireSiteRole(siteId, [...])` 헬퍼로 서버에서 재검증 + RLS 이중 방어

---

## 7. 구현 순서 (단계별 검증)

1. 스캐폴드 (create-next-app, Tailwind, shadcn, Pretendard, 스펙 27장 CSS 변수) → `npm run dev`/`build`/`tsc --noEmit` 통과 확인
2. 디자인 토큰 + `prefers-reduced-motion` 처리 확인
3. Supabase 프로젝트 생성(사용자) + env 채움 + `lib/supabase/client.ts,server.ts` → 임시 쿼리로 연결 확인
4. 마이그레이션 3개 작성/적용 → 테이블/enum/RLS 활성화 여부 확인
5. `seed.ts` 작성/실행 → `sites`/`site_pages` 행 확인, 관리자 비밀번호 기록(커밋 금지)
6. **RLS 검증**: anon으로 select(성공)/update(거부), 시드 admin으로 update(성공) — UI 만들기 전에 먼저 검증
7. `middleware.ts` + `current-site.ts` → `sorihyanggi.localhost:3000`에서 헤더 확인, `localhost:3000`은 루트 placeholder
8. BlockRenderer + TextBlock 하나로 end-to-end 렌더 확인 → 나머지 블록 하나씩 추가하며 매번 TS/build 확인
9. SiteHeader/SiteFooter/SiteNavigation (site_menus/site_settings 연동)
10. 서브페이지 라우트 + posts 목록/상세 → `/about`,`/contact`,`/posts`,`/posts/[id]` 확인, 미게시/미존재 404 확인
11. 인증(`/admin/login`, `/auth/callback`) → 로그인 후 세션 쿠키 확인
12. admin layout 역할 게이트 → 비로그인/비멤버 차단 확인
13. site-info 폼 → 수정 즉시 공개 페이지 반영 확인
14. 페이지 블록 폼 편집 (Text/Hero 먼저) → 저장 라운드트립 확인 후 나머지 블록 폼 추가
15. site_posts CRUD → RLS로 비멤버 직접 호출 차단 확인
16. 모바일 반응형 점검 (360/390/768/1024/1440, 스펙 46장 기준 — 단, 스펙 34장의 하단 고정 네비는 올담 메인포털 전용이라 이번 범위에서는 제외하고 반응형 상단 nav/hamburger로 충분)
17. `npm run build` + `npm run lint` + `tsc --noEmit` 전체 통과, RLS 재확인
18. README에 로컬 서브도메인 개발법, env 설정, 마이그레이션/시드 명령, 아래 미해결 항목 기록

---

## 8. 사용자 확인이 더 필요한 미해결 항목

- **운영 배포처**: Vercel 가정(스펙 3.1) — `damyangall.kr`/`*.damyangall.kr` DNS를 Vercel로 연결하고 와일드카드 도메인을 등록해야 함. 아직 호스팅 계정 없음 — 나중에 진행.
- **Kakao Maps 키**: 없음 — `MapBlock`은 키 없을 때 placeholder로 대체.
- **실제 콘텐츠**: 소개 문구, 회원 수, 모임 일정, 정확한 연락처, SNS, 실제 사진(히어로/갤러리/로고) 전부 placeholder. 관리자 화면 완성 후 직접 입력하거나 `seed.ts` 수정 후 재실행.
- **Supabase 프로젝트**: 아직 미생성 — 사용자가 프로젝트 생성 후 URL/anon key/service role key 전달 필요 (리전은 `ap-northeast-2` 등 권장).
- **시드 관리자 비밀번호**: 랜덤 생성 후 1회 출력만, 최초 로그인 후 변경 권장. 이번 범위에는 셀프 비밀번호 재설정 플로우 없음.
- **메뉴 편집 권한**: 지금은 `site_menus` 쓰기를 SITE_ADMIN만 허용 (EDITOR도 메뉴를 고칠 수 있어야 하면 조정 필요).

---

## 세부 SQL (Plan 에이전트 확정본 그대로 사용)

`0001_init_core.sql`, `0002_rls_policies.sql`, `0003_indexes.sql`의 전체 SQL은 이번 계획 수립 과정에서 이미 확정되었다 — 구현 시 위 §3.3~3.5에서 설명한 테이블/정책/인덱스 목록 그대로, 아래 순서를 지켜 작성한다:

1. enum 8종 정의
2. `users` → `site_templates` → `sites` → `site_members` → `site_settings` → `site_pages`(+ home 유니크 인덱스) → `site_menus` → `site_posts` 순서로 테이블 생성 (FK 순서 때문에 필수)
3. `set_updated_at()` 트리거 함수 + 전 테이블 부착
4. `handle_new_auth_user()` + `auth.users` insert 트리거
5. 전 테이블 `enable row level security`
6. `is_super_admin()` / `is_site_editor(uuid)` / `is_site_admin(uuid)` 헬퍼 함수 (security definer, stable)
7. 테이블별 select/insert/update/delete 정책 (§3.4 요지대로)
8. 인덱스 (§3.5 목록대로)

---

## 검증 방법 요약

- 각 마이그레이션 후: Supabase SQL Editor 또는 CLI로 `select relrowsecurity from pg_class where relname=...`, `\d+ sites` 등으로 스키마/RLS 확인
- 시드 후: `select * from sites where slug='sorihyanggi'`, `select * from site_pages where is_home`
- RLS: anon 키로 클라이언트 만들어 select/update 테스트, 시드 admin 세션으로 update 성공 테스트
- 앱: `npm run dev` 후 `http://sorihyanggi.localhost:3000` (홈/소개/활동내역/오시는길), `http://sorihyanggi.localhost:3000/admin` (로그인 → 편집 → 공개 페이지 반영 확인), `http://localhost:3000` (루트 placeholder)
- 매 단계 후 `npm run build` + `tsc --noEmit` + `npm run lint` 클린 상태 유지

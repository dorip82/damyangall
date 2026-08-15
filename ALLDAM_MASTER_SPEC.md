# ALLDAM_MASTER_SPEC.md
# 올담(ALLDAM) 담양 지역 통합 웹 플랫폼 — 개발 마스터 명세서

> 문서 버전: 1.0.0
> 작성 기준: 2026-08-14
> 프로젝트 코드명: ALLDAM
> 서비스명: 올담
> 슬로건: 담양의 모든 이야기를 담다.

---

## 0. 문서 목적

본 문서는 「담양 지역 통합 웹 플랫폼 올담」을 실제 개발하기 위한 단일 기준 문서(Single Source of Truth)다.

Claude Code 또는 개발자가 본 문서를 기준으로 다음을 일관되게 구현해야 한다.

- 메인 지역 포털
- 담양소식
- 지역정보 디렉터리
- 군민 커뮤니티
- 동아리·동호회
- 기업·소상공인·기관의 서브홈페이지
- 템플릿 + 블록 기반 홈페이지 빌더
- 통합관리자
- 사이트별 관리자
- 광고 플랫폼
- 통계
- 신고/알림/감사 로그
- 향후 AI 홈페이지 생성 기능을 확장할 수 있는 구조

### 핵심 원칙

1. 올담은 단일 홈페이지가 아니라 멀티사이트 플랫폼이다.
2. 통합관리자는 모든 사이트와 전체 데이터를 관리한다.
3. 사이트 운영자는 자신의 사이트만 관리한다.
4. 일반회원은 올담 커뮤니티와 사이트를 이용한다.
5. 군민 사용성이 최우선이다.
6. 디자인은 현대적인 프리미엄 감성과 담양의 자연을 결합한다.
7. 모바일 사용성을 처음부터 고려한다.
8. 보안과 권한 분리를 DB 레벨에서 보장한다.
9. 초기에는 MVP를 우선 구현하고 이후 AI/예약/결제 등을 확장한다.
10. 실제 콘텐츠가 없으므로 개발 단계에서는 샘플 데이터를 사용한다.

---

# 1. 서비스 정의

## 1.1 서비스 개요

올담은 민간에서 운영하는 담양 지역 통합 플랫폼이다.

담양군민이 지역소식, 행사, 생활정보, 커뮤니티를 이용하고, 담양에서 활동하는 기업·소상공인·동아리·동호회·기관·단체가 자신만의 서브홈페이지를 운영할 수 있도록 한다.

또한 광고주가 올담 메인 및 서브사이트에 배너광고를 등록할 수 있도록 하며, 통합관리자는 전체 플랫폼을 하나의 관리자 시스템에서 관리한다.

## 1.2 핵심 가치

- 지역성
- 신뢰성
- 참여성
- 연결성
- 확장성
- 운영 편의성

## 1.3 사용자 우선순위

1. 담양군민
2. 동아리 및 동호회
3. 기업 및 소상공인
4. 기관 및 단체
5. 광고주

광고 수익을 목적으로 하더라도 사용자 경험을 광고보다 우선한다.

---

# 2. 서비스 영역

```text
올담
├── 메인
├── 담양소식
│   ├── 지역소식
│   ├── 행사
│   ├── 생활정보
│   └── 군민제보
├── 지역정보
│   ├── 기업
│   ├── 음식점
│   ├── 카페
│   ├── 숙박
│   ├── 학원
│   ├── 공방
│   ├── 체육
│   ├── 종교
│   ├── 사회단체
│   ├── 청년
│   ├── 주민모임
│   ├── 동아리
│   ├── 동호회
│   └── 기관
├── 동아리·동호회
├── 커뮤니티
│   ├── 자유게시판
│   ├── 지역정보
│   ├── 맛집추천
│   ├── 여행정보
│   ├── 구인구직
│   ├── 중고거래
│   ├── 동호회모집
│   ├── 행사정보
│   └── 지역제보
├── 통합검색
├── 광고
└── 관리자
```

---

# 3. 기술 스택

## 3.1 권장 기술

### Frontend / Full-stack
- Next.js
- TypeScript
- React

### UI
- Tailwind CSS
- shadcn/ui
- Lucide Icons

### Backend
- Next.js Server Actions
- Route Handlers
- Supabase

### Database
- PostgreSQL via Supabase

### Authentication
- Supabase Auth
- Google
- Kakao
- Naver
- Email/Password 또는 Magic Link

### Storage
- Supabase Storage

### Rich Text / Block Editor
- TipTap
- 자체 JSON Block Schema

### Maps
- Kakao Maps API

### Deployment
- Vercel

### Search
MVP:
- PostgreSQL Full Text Search

향후:
- Meilisearch 또는 Elasticsearch

### PWA
Phase 3에서 검토

---

# 4. 개발 원칙

## 4.1 TypeScript

- `any` 사용 최소화
- 모든 DB 응답 타입 정의
- 공통 타입은 `/types`에 관리
- Server/Client 경계를 명확하게 구분

## 4.2 Component

- 작은 단위의 재사용 가능한 컴포넌트 작성
- UI 컴포넌트와 비즈니스 로직 분리
- 관리자와 사용자 UI 컴포넌트 분리

## 4.3 데이터 접근

클라이언트에서 Supabase Service Role Key를 절대 사용하지 않는다.

- Browser Client: public anon/publishable key
- Server: 서버 전용 클라이언트
- Service Role: 서버의 제한된 관리자 작업에서만 사용

## 4.4 보안

RLS를 반드시 활성화한다.

UI에서 권한을 숨기는 것만으로 권한 통제를 끝내지 않는다.

모든 핵심 테이블은 DB 정책으로 접근을 제한한다.

---

# 5. 프로젝트 구조

권장 구조:

```text
alldam/
├── app/
│   ├── (main)/
│   │   ├── page.tsx
│   │   ├── news/
│   │   ├── events/
│   │   ├── directory/
│   │   ├── community/
│   │   ├── clubs/
│   │   └── search/
│   ├── site/
│   │   └── [slug]/
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── sites/
│   │   ├── users/
│   │   ├── news/
│   │   ├── community/
│   │   ├── ads/
│   │   ├── statistics/
│   │   ├── reports/
│   │   └── system/
│   ├── auth/
│   └── api/
├── components/
│   ├── ui/
│   ├── main/
│   ├── site/
│   ├── admin/
│   ├── blocks/
│   └── common/
├── lib/
│   ├── supabase/
│   ├── auth/
│   ├── permissions/
│   ├── blocks/
│   ├── search/
│   └── utils/
├── types/
├── hooks/
├── config/
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── config.toml
├── docs/
├── middleware.ts
├── .env.example
├── package.json
└── README.md
```

---

# 6. URL 구조

## 메인

```text
/
```

## 담양소식

```text
/news
/news/[slug]
/news/category/[category]
```

## 행사

```text
/events
/events/[id]
```

## 지역정보

```text
/directory
/directory/[category]
/directory/[category]/[slug]
```

## 커뮤니티

```text
/community
/community/[board]
/community/[board]/[postId]
```

## 동아리/동호회

```text
/clubs
/clubs/[slug]
```

## 통합검색

```text
/search?q=
```

## 서브홈페이지

```text
/site/[slug]
/site/[slug]/[page]
/site/[slug]/posts
/site/[slug]/posts/[postId]
```

향후 개별 도메인 또는 서브도메인을 지원할 수 있도록 사이트 식별 로직을 `site_id` 중심으로 설계한다.

---

# 7. 사용자 및 권한

## 7.1 역할

```text
SUPER_ADMIN
SITE_ADMIN
EDITOR
USER
```

## 7.2 역할 정의

### SUPER_ADMIN
전체 플랫폼 관리자.

권한:
- 전체 사이트 관리
- 회원 관리
- 사이트 승인/반려/삭제
- 콘텐츠 관리
- 커뮤니티 관리
- 광고 관리
- 통계
- 시스템 설정
- 관리자 권한 관리
- 감사 로그 확인

### SITE_ADMIN
자신이 운영하는 사이트 관리자.

권한:
- 사이트 기본정보
- 디자인
- 메뉴
- 페이지
- 게시물
- 갤러리
- 이벤트
- 사이트 회원

### EDITOR
사이트 콘텐츠 편집자.

권한:
- 게시물
- 갤러리
- 이벤트 등 콘텐츠 관리

### USER
일반회원.

권한:
- 커뮤니티
- 댓글
- 좋아요
- 제보
- 동호회 가입
- 사이트 이용

---

# 8. 권한 매트릭스

| 기능 | SUPER_ADMIN | SITE_ADMIN | EDITOR | USER |
|---|---:|---:|---:|---:|
| 전체 사이트 조회 | O | X | X | X |
| 사이트 생성 승인 | O | X | X | X |
| 사이트 삭제 | O | X | X | X |
| 내 사이트 관리 | O | O | O | X |
| 사이트 디자인 | O | O | X | X |
| 페이지 관리 | O | O | X | X |
| 게시물 작성 | O | O | O | X |
| 게시물 삭제 | O | O | O | X |
| 담양소식 관리 | O | X | X | X |
| 커뮤니티 관리 | O | X | X | X |
| 광고 관리 | O | X | X | X |
| 전체 통계 | O | X | X | X |
| 사이트 통계 | O | O | O | X |
| 시스템 설정 | O | X | X | X |

---

# 9. 데이터베이스

## 9.1 users

```sql
users
- id uuid PK
- email text
- name text
- nickname text
- phone text
- profile_image_url text
- role text
- status text
- created_at timestamptz
- updated_at timestamptz
- last_login_at timestamptz
```

권장 enum:

```text
user_role:
SUPER_ADMIN
SITE_ADMIN
EDITOR
USER

user_status:
ACTIVE
SUSPENDED
PENDING
DELETED
```

Supabase Auth의 `auth.users.id`와 public.users.id를 연계한다.

---

## 9.2 sites

```sql
sites
- id uuid PK
- owner_id uuid FK users.id
- name text
- slug text UNIQUE
- category text
- subcategory text
- description text
- logo_url text
- thumbnail_url text
- cover_url text
- phone text
- email text
- address text
- latitude numeric
- longitude numeric
- business_hours jsonb
- website_url text
- instagram_url text
- facebook_url text
- status text
- template_id uuid
- created_at timestamptz
- updated_at timestamptz
- published_at timestamptz
```

site status:

```text
DRAFT
PENDING
ACTIVE
REJECTED
SUSPENDED
ARCHIVED
```

---

## 9.3 site_members

```sql
site_members
- id uuid PK
- site_id uuid FK
- user_id uuid FK
- role text
- status text
- joined_at timestamptz
```

site role:

```text
SITE_ADMIN
EDITOR
MEMBER
```

---

## 9.4 site_settings

```sql
site_settings
- id uuid PK
- site_id uuid UNIQUE FK
- primary_color text
- secondary_color text
- accent_color text
- font_family text
- header_style text
- footer_style text
- show_logo boolean
- show_phone boolean
- show_address boolean
- show_map boolean
- seo_title text
- seo_description text
- og_image text
- settings jsonb
- created_at timestamptz
- updated_at timestamptz
```

---

## 9.5 site_templates

```sql
site_templates
- id uuid PK
- name text
- category text
- description text
- preview_image text
- schema jsonb
- is_active boolean
- created_at timestamptz
- updated_at timestamptz
```

초기 템플릿:

```text
BUSINESS
RESTAURANT
CAFE
ACCOMMODATION
ACADEMY
WORKSHOP
SPORTS
ORGANIZATION
CLUB
COMMUNITY
INSTITUTION
```

---

## 9.6 site_pages

```sql
site_pages
- id uuid PK
- site_id uuid FK
- title text
- slug text
- page_type text
- content jsonb
- sort_order integer
- is_home boolean
- is_published boolean
- created_at timestamptz
- updated_at timestamptz
```

UNIQUE(site_id, slug)

---

## 9.7 site_menus

```sql
site_menus
- id uuid PK
- site_id uuid FK
- title text
- url text
- menu_type text
- parent_id uuid nullable
- sort_order integer
- is_visible boolean
- created_at timestamptz
- updated_at timestamptz
```

---

# 10. Block System

## 10.1 목적

서브홈페이지를 템플릿 + 블록 조립 방식으로 구축한다.

페이지의 `content`는 JSONB로 저장한다.

## 10.2 Block 타입

```text
hero
text
image
gallery
video
card
button
notice
post
event
map
contact
sns
banner
divider
spacer
```

향후:

```text
product
menu
reservation
member
coupon
review
```

## 10.3 기본 JSON 예

```json
{
  "version": 1,
  "blocks": [
    {
      "id": "block-001",
      "type": "hero",
      "props": {
        "title": "담양에서 만나는 작은 쉼",
        "subtitle": "○○카페",
        "image": "/images/sample-cafe.jpg",
        "overlay": 0.35
      }
    },
    {
      "id": "block-002",
      "type": "text",
      "props": {
        "title": "카페 소개",
        "content": "담양의 여유를 느낄 수 있는 공간입니다."
      }
    }
  ]
}
```

## 10.4 Block 개발 규칙

각 Block은 다음 인터페이스를 갖는다.

```ts
type BlockProps = {
  id: string;
  type: string;
  props: Record<string, unknown>;
};
```

렌더러:

```text
BlockRenderer
 ├─ HeroBlock
 ├─ TextBlock
 ├─ ImageBlock
 ├─ GalleryBlock
 ├─ CardBlock
 ├─ EventBlock
 ├─ MapBlock
 └─ ...
```

---

# 11. 콘텐츠

## 11.1 site_posts

```sql
site_posts
- id uuid PK
- site_id uuid FK
- author_id uuid FK
- category text
- title text
- content jsonb
- thumbnail_url text
- view_count integer
- like_count integer
- status text
- published_at timestamptz
- created_at timestamptz
- updated_at timestamptz
```

---

# 12. 담양소식

## news

```sql
news
- id uuid PK
- author_id uuid FK
- category text
- title text
- summary text
- content jsonb
- thumbnail_url text
- source_type text
- source_url text
- status text
- view_count integer
- published_at timestamptz
- created_at timestamptz
- updated_at timestamptz
```

source_type:

```text
ADMIN
EXTERNAL
USER_SUBMISSION
```

제보 콘텐츠는 반드시 관리자 검수를 거친 후 게시한다.

---

# 13. 행사

```sql
events
- id uuid PK
- site_id uuid nullable
- title text
- description text
- start_at timestamptz
- end_at timestamptz
- location text
- latitude numeric
- longitude numeric
- image_url text
- category text
- status text
- created_by uuid FK
- created_at timestamptz
- updated_at timestamptz
```

`site_id IS NULL`이면 올담 전체 행사.

---

# 14. 커뮤니티

## community_boards

```sql
community_boards
- id uuid PK
- name text
- slug text UNIQUE
- description text
- sort_order integer
- is_active boolean
- created_at timestamptz
```

초기 게시판:

```text
자유게시판
지역정보
맛집추천
여행정보
구인구직
중고거래
동호회모집
행사정보
지역제보
```

## community_posts

```sql
community_posts
- id uuid PK
- board_id uuid FK
- author_id uuid FK
- title text
- content jsonb
- thumbnail_url text
- view_count integer
- like_count integer
- comment_count integer
- status text
- created_at timestamptz
- updated_at timestamptz
```

---

# 15. 댓글

```sql
comments
- id uuid PK
- author_id uuid FK
- target_type text
- target_id uuid
- parent_id uuid nullable
- content text
- status text
- created_at timestamptz
- updated_at timestamptz
```

target_type:

```text
NEWS
COMMUNITY_POST
SITE_POST
```

대댓글을 위해 `parent_id`를 지원한다.

---

# 16. 좋아요

MVP에서는 다음과 같은 별도 테이블을 권장한다.

```sql
likes
- id uuid PK
- user_id uuid FK
- target_type text
- target_id uuid
- created_at timestamptz
```

UNIQUE(user_id, target_type, target_id)

---

# 17. 광고

## advertisers

```sql
advertisers
- id uuid PK
- user_id uuid FK
- company_name text
- contact_name text
- phone text
- email text
- business_number text
- status text
- created_at timestamptz
```

## ad_slots

```sql
ad_slots
- id uuid PK
- name text
- location text
- width integer
- height integer
- description text
- is_active boolean
- created_at timestamptz
```

초기 슬롯:

```text
MAIN_TOP
MAIN_MIDDLE
MAIN_BOTTOM
CATEGORY_TOP
SEARCH
SITE_TOP
SITE_BOTTOM
```

## advertisements

```sql
advertisements
- id uuid PK
- advertiser_id uuid FK
- title text
- image_url text
- target_url text
- slot_id uuid FK
- start_at timestamptz
- end_at timestamptz
- priority integer
- status text
- created_at timestamptz
- updated_at timestamptz
```

상태:

```text
DRAFT
PENDING
APPROVED
REJECTED
ACTIVE
EXPIRED
PAUSED
```

---

# 18. 광고 통계

```sql
ad_statistics
- id uuid PK
- advertisement_id uuid FK
- date date
- impressions integer
- clicks integer
```

CTR:

```text
clicks / impressions * 100
```

0으로 나누는 경우를 반드시 처리한다.

---

# 19. 통계

## site_statistics

```sql
site_statistics
- id uuid PK
- site_id uuid FK
- date date
- visitors integer
- page_views integer
- new_visitors integer
- returning_visitors integer
```

향후 확장:

- 유입경로
- 인기 페이지
- 검색어
- 디바이스
- 지역
- 브라우저

---

# 20. 신고

```sql
reports
- id uuid PK
- reporter_id uuid FK
- target_type text
- target_id uuid
- reason text
- description text
- status text
- processed_by uuid nullable
- processed_at timestamptz nullable
- created_at timestamptz
```

target_type:

```text
POST
COMMENT
USER
SITE
ADVERTISEMENT
```

status:

```text
PENDING
REVIEWING
RESOLVED
REJECTED
```

---

# 21. 알림

```sql
notifications
- id uuid PK
- user_id uuid FK
- type text
- title text
- message text
- link text
- is_read boolean
- created_at timestamptz
```

알림 예:

```text
SITE_APPROVED
SITE_REJECTED
COMMENT
LIKE
MEMBERSHIP
ADVERTISEMENT
REPORT
SYSTEM
```

---

# 22. 감사 로그

```sql
audit_logs
- id uuid PK
- user_id uuid nullable
- action text
- target_type text
- target_id uuid nullable
- description text
- ip_address inet nullable
- user_agent text nullable
- created_at timestamptz
```

중요 작업은 반드시 기록한다.

예:

```text
SITE_APPROVE
SITE_REJECT
SITE_DELETE
USER_SUSPEND
POST_DELETE
ADVERTISEMENT_APPROVE
SYSTEM_SETTING_CHANGE
```

---

# 23. Supabase RLS

## 원칙

### 일반 사용자
공개 상태의 데이터만 조회 가능.

### SITE_ADMIN
`site_members.site_id`를 통해 자신이 관리하는 사이트 데이터만 CRUD 가능.

### EDITOR
자신의 사이트 콘텐츠만 수정.

### SUPER_ADMIN
모든 플랫폼 데이터에 접근.

## 핵심 정책 개념

사이트 데이터 접근 시 다음 조건을 기준으로 한다.

```sql
exists (
  select 1
  from site_members sm
  where sm.site_id = target_site_id
    and sm.user_id = auth.uid()
    and sm.role in ('SITE_ADMIN', 'EDITOR')
)
```

단, 실제 SQL에서는 역할별 INSERT/UPDATE/DELETE 정책을 분리한다.

SUPER_ADMIN은 public.users의 role 또는 별도 안전한 관리자 권한 테이블을 기준으로 판단한다.

---

# 24. 회원가입

## 로그인

지원:

- Google
- Kakao
- Naver
- Email

## 신규 회원

기본 role:

```text
USER
```

## 홈페이지 운영 신청

```text
USER
 ↓
홈페이지 만들기
 ↓
사이트 신청
 ↓
PENDING
 ↓
SUPER_ADMIN 검수
 ↓
ACTIVE
```

---

# 25. 홈페이지 생성 UX

## Step 1
업종 선택

```text
기업
음식점
카페
숙박
학원
공방
체육
종교
사회
청년
주민
동아리
동호회
기관
기타
```

## Step 2
템플릿 선택

미리보기 이미지 제공.

## Step 3
기본정보

- 이름
- 설명
- 전화번호
- 주소
- 영업시간
- SNS
- 로고
- 대표 이미지

## Step 4
홈페이지 메뉴 설정

## Step 5
검토

## Step 6
관리자 승인

---

# 26. 메인 홈페이지 디자인

## 디자인 콘셉트

**현대적인 프리미엄 + 담양의 자연**

담양의 다음 이미지를 연상:

- 죽녹원
- 관방제림
- 메타세쿼이아길

단순한 관광 홈페이지가 아니라 지역 플랫폼이므로 자연 이미지를 배경/분위기로 활용하고 콘텐츠 가독성을 유지한다.

## 키워드

```text
Premium
Natural
Calm
Local
Editorial
```

---

# 27. 색상

```text
Forest:        #24483A
Deep Forest:   #18251F
Natural Green: #3F6650
Ivory:         #F5F2E9
Wood:          #C8B88A
Gold:          #B99B5F
White:         #FFFFFF
```

CSS 변수로 관리한다.

---

# 28. 타이포그래피

기본:

- Pretendard

제목:
- 600~800

본문:
- 400~500

메인 Hero:
- 큰 크기 + 넓은 자간
- 모바일에서 자동 축소

---

# 29. 메인 페이지 구조

```text
Hero
↓
담양소식
↓
오늘의 담양
↓
지역정보
↓
추천 홈페이지
↓
동아리·동호회
↓
커뮤니티
↓
행사
↓
광고
↓
Footer
```

---

# 30. Hero

문구:

```text
담양의 모든 이야기를 담다.
```

검색창:

```text
무엇을 찾고 계신가요?
업체 · 맛집 · 행사 · 동호회
```

배경:

- 담양 자연 이미지
- 느린 Zoom
- 어두운 Overlay
- 텍스트 Fade-in

---

# 31. 오늘의 담양

지표:

```text
행사
축제
모임
새로운 소식
```

향후 AI 추천:

```text
오늘 담양에서 뭐 하지?
```

---

# 32. 카드 디자인

지역정보 카드는 이미지 중심.

```text
┌─────────────────────────┐
│                         │
│       대표 이미지        │
│                         │
├─────────────────────────┤
│ CAFE                    │
│                         │
│ ○○카페                  │
│ 담양의 작은 쉼          │
│                         │
│ 담양읍 · 카페       →   │
└─────────────────────────┘
```

과도한 border-radius를 사용하지 않는다.

---

# 33. 애니메이션

기본:

```text
Fade In: 0.6s
Slide Up: 0.7s
Image Zoom: 1.2s
Hover: 0.3s
```

애니메이션은 콘텐츠를 방해하지 않아야 한다.

`prefers-reduced-motion`을 지원한다.

---

# 34. 모바일

하단 고정 네비게이션:

```text
홈
소식
검색
커뮤니티
MY
```

모바일에서 가장 중요한 기능:

1. 소식
2. 검색
3. 커뮤니티
4. 지역정보
5. 내 활동

---

# 35. 관리자 UI

관리자는 감성적인 홈페이지와 분리한다.

## Dashboard

```text
오늘 방문자
전체 회원
전체 사이트
신규 사이트
활성 광고
신고 처리 대기
```

## 관리자 메뉴

```text
Dashboard
홈페이지 관리
회원 관리
담양소식
커뮤니티
동아리/동호회
광고
통계
신고
알림
시스템
감사 로그
```

---

# 36. 관리자 홈페이지 관리

목록:

```text
사이트명
카테고리
운영자
상태
등록일
최근 수정
방문자
```

필터:

- 카테고리
- 상태
- 날짜
- 운영자

검색 제공.

---

# 37. 관리자 사이트 상세

```text
기본정보
디자인
메뉴
페이지
게시물
갤러리
이벤트
회원
통계
```

버튼:

```text
사이트 보기
관리자 모드
비공개
승인
반려
삭제
```

통합관리자가 사이트 관리자로 접근하는 경우에도 감사 로그를 남긴다.

---

# 38. 통합검색

검색 대상:

```text
담양소식
행사
기업
매장
카페
숙박
학원
공방
동아리
동호회
커뮤니티
서브홈페이지
```

검색 결과 탭:

```text
전체
소식
업체
홈페이지
게시글
행사
```

MVP는 PostgreSQL Full Text Search로 구현.

---

# 39. SEO

각 서브홈페이지마다:

- title
- description
- OG image
- canonical URL

을 설정.

메인:

```text
담양 올담 | 담양의 모든 이야기를 담다
```

서브사이트:

```text
[사이트명] | 올담
```

---

# 40. 이미지 처리

이미지는 Supabase Storage에 저장.

권장 버킷:

```text
site-assets
user-assets
news-assets
community-assets
advertisement-assets
```

업로드 시:

- 파일 형식 검사
- 크기 제한
- 이미지 최적화
- 파일명 정규화

를 수행한다.

---

# 41. 샘플 데이터

실제 콘텐츠가 없으므로 개발 초기에는 가상 데이터 사용.

예:

```text
○○카페
○○식당
○○펜션
○○공방
○○배드민턴클럽
○○축구회
○○청년회
○○주민모임
○○체육관
○○학원
```

실제 기관/사업체로 오인되지 않도록 개발 환경에서는 `샘플` 또는 가상 이름임을 명확하게 표시할 수 있다.

---

# 42. MVP 개발 범위

## Phase 1

### 플랫폼 기본

- Next.js 초기화
- Supabase 연결
- DB Migration
- Seed
- Authentication
- RBAC
- 메인 홈페이지
- 담양소식
- 지역정보
- 커뮤니티
- 사이트 생성
- 사이트 템플릿
- 서브홈페이지
- 사이트 관리자
- 통합관리자

## Phase 2

- 광고
- 행사
- 댓글
- 좋아요
- 신고
- 알림
- 통계
- 검색
- 이미지 관리

## Phase 3

- AI 홈페이지 생성
- AI 콘텐츠 작성
- 예약
- 쿠폰
- 결제
- 개별 도메인
- PWA

---

# 43. 개발 순서

```text
1. 프로젝트 초기화
2. 디자인 시스템
3. Supabase 연결
4. DB Migration
5. Seed Data
6. Authentication
7. RBAC
8. 메인 홈페이지
9. 지역정보
10. Multi-Site
11. Block Renderer
12. Site Admin
13. Super Admin
14. News
15. Community
16. Events
17. Advertisement
18. Statistics
19. Search
20. Mobile
21. Security Review
22. QA
23. Deployment
```

---

# 44. Claude Code 작업 규칙

Claude Code는 한 번에 전체 기능을 무리하게 구현하지 않는다.

각 Phase 완료 후:

1. TypeScript 오류 검사
2. Lint
3. Build
4. DB Migration 확인
5. RLS 확인
6. 주요 페이지 동작 확인
7. 모바일 확인

후 다음 Phase로 진행한다.

## 코드 작성 원칙

- 기존 기능을 임의로 삭제하지 않는다.
- 기존 DB 컬럼을 임의 변경하지 않는다.
- Migration 파일을 누적 관리한다.
- 환경변수를 코드에 직접 입력하지 않는다.
- Service Role Key를 클라이언트에 노출하지 않는다.
- 모든 사용자 입력을 검증한다.
- 이미지 업로드 확장자와 크기를 검증한다.
- 권한은 서버와 DB에서 모두 검증한다.
- 접근 불가능한 데이터는 UI에서만 숨기지 말고 RLS로 차단한다.
- 모바일을 항상 함께 구현한다.

---

# 45. 환경변수

`.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_KAKAO_MAP_KEY=

NEXT_PUBLIC_SITE_URL=
```

OAuth 관련 값은 Supabase Dashboard에서 관리한다.

---

# 46. 테스트

## 인증

- 회원가입
- 로그인
- 로그아웃
- OAuth
- 세션 유지

## 권한

- USER가 관리자 페이지 접근 불가
- SITE_ADMIN이 다른 사이트 접근 불가
- EDITOR가 디자인 변경 불가
- SUPER_ADMIN 전체 접근 가능

## 멀티사이트

- 사이트 생성
- 승인
- 반려
- 공개
- 비공개
- 사이트별 페이지
- 사이트별 게시물

## 커뮤니티

- 작성
- 수정
- 삭제
- 댓글
- 대댓글
- 좋아요
- 신고

## 광고

- 신청
- 승인
- 기간
- 노출
- 클릭
- 통계

## 반응형

- 360px
- 390px
- 768px
- 1024px
- 1440px

---

# 47. 보안 체크리스트

- [ ] RLS 전체 테이블 적용
- [ ] Service Role Key 서버 전용
- [ ] 인증 사용자 검증
- [ ] 관리자 권한 서버 검증
- [ ] 입력값 검증
- [ ] XSS 방어
- [ ] CSRF 고려
- [ ] 업로드 파일 검증
- [ ] 광고 URL 검증
- [ ] 외부 링크 안전 처리
- [ ] Rate Limit 적용
- [ ] 신고 기능
- [ ] 감사 로그
- [ ] 민감정보 로그 출력 금지

---

# 48. 접근성

- 키보드 접근
- 명확한 focus 상태
- 이미지 alt
- 버튼 aria-label
- 충분한 색상 대비
- reduced motion
- 모바일 터치 영역 확보

---

# 49. 성능

- Next.js Image 사용
- Lazy Loading
- Server Components 우선
- Client Components 최소화
- DB Index 설정
- Pagination
- Infinite Scroll은 필요한 화면에만 적용
- 이미지 WebP/AVIF 고려
- 불필요한 API 호출 최소화

---

# 50. DB Index

최소한 다음 인덱스를 생성한다.

```text
sites.slug
sites.status
sites.category

site_members.site_id
site_members.user_id

site_pages.site_id
site_pages.slug

site_posts.site_id
site_posts.published_at

news.category
news.status
news.published_at

events.start_at
events.status

community_posts.board_id
community_posts.created_at

comments.target_type
comments.target_id

advertisements.slot_id
advertisements.status
advertisements.start_at
advertisements.end_at

site_statistics.site_id
site_statistics.date

ad_statistics.advertisement_id
ad_statistics.date
```

---

# 51. 미래 AI 기능 설계 원칙

AI 기능을 Phase 3에서 추가할 수 있도록 현재 Block System을 AI 친화적으로 설계한다.

AI 입력:

```text
사이트 유형
사업 설명
원하는 분위기
메뉴
사진
주소
연락처
```

AI 출력:

```text
template
theme
pages
blocks
copy
navigation
```

AI가 직접 DB에 임의 쓰기하지 않고:

```text
AI 생성
→ Draft
→ Preview
→ 사용자 승인
→ 저장
→ Publish
```

과정을 거친다.

---

# 52. 향후 AI 기능 예시

사용자:

> "담양에서 운영하는 20석 규모의 카페야. 따뜻하고 고급스러운 느낌으로 홈페이지를 만들어줘."

AI:

```text
카페형 템플릿
+
Forest/Ivory 테마
+
Hero
+
카페 소개
+
대표 메뉴
+
갤러리
+
영업시간
+
지도
+
SNS
```

를 생성한다.

---

# 53. 멀티사이트 확장 원칙

모든 사이트 관련 데이터는 반드시 `site_id`를 중심으로 설계한다.

예외:

- 올담 전체 뉴스
- 올담 전체 행사
- 올담 전체 커뮤니티
- 플랫폼 설정

사이트가 10개에서 1,000개로 증가해도 구조 변경 없이 운영 가능해야 한다.

---

# 54. 디자인 시스템 컴포넌트

공통:

```text
Button
Input
Textarea
Select
Dialog
Drawer
Tabs
Dropdown
Card
Badge
Toast
Pagination
Table
Form
Avatar
Breadcrumb
Tooltip
```

올담 전용:

```text
AllDamHeader
AllDamFooter
HeroSection
NewsCard
DirectoryCard
ClubCard
CommunityList
EventCard
AdBanner
SiteHeader
SiteFooter
SiteNavigation
BlockRenderer
BlockEditor
AdminSidebar
AdminHeader
StatsCard
```

---

# 55. 메인 컴포넌트 구조

```text
HomePage
├── HeroSection
├── NewsSection
├── TodaySection
├── DirectorySection
├── FeaturedSites
├── ClubSection
├── CommunitySection
├── EventSection
├── AdvertisementSection
└── Footer
```

---

# 56. 관리자 컴포넌트

```text
AdminLayout
├── AdminSidebar
├── AdminHeader
└── AdminContent

Dashboard
├── StatsCards
├── VisitorChart
├── SiteStatusChart
├── RecentSites
├── RecentReports
└── RecentActivity
```

---

# 57. 사이트 빌더 UI

권장 화면:

```text
┌────────────────────────────────────────────┐
│ 사이트명              저장   미리보기  게시 │
├─────────────┬──────────────────────────────┤
│ 블록         │                              │
│             │         Preview              │
│ Hero        │                              │
│ Text        │                              │
│ Image       │                              │
│ Gallery     │                              │
│ Card        │                              │
│ Event       │                              │
│ Map         │                              │
│ Contact     │                              │
│             │                              │
└─────────────┴──────────────────────────────┘
```

Desktop은 좌측 Block Library + 중앙 Preview + 우측 Properties 패널을 권장한다.

모바일에서는 Bottom Sheet 또는 Drawer로 전환한다.

---

# 58. 사이트 운영자 Dashboard

```text
사이트 방문자
페이지 조회수
게시물
회원
문의
이벤트
```

메뉴:

```text
대시보드
사이트 디자인
페이지
메뉴
게시물
갤러리
이벤트
회원
문의
통계
설정
```

---

# 59. 메인 커뮤니티 운영 원칙

올담은 지역 커뮤니티이므로 신고/차단/관리 기능을 MVP부터 고려한다.

관리자가 할 수 있는 기능:

- 게시물 숨김
- 게시물 삭제
- 댓글 삭제
- 회원 정지
- 신고 처리
- 금칙어 관리

금칙어는 하드코딩하지 않고 DB 관리 가능하게 만든다.

---

# 60. 광고 운영 원칙

광고는 사용자 콘텐츠와 명확히 구분한다.

광고에는:

```text
AD
광고
```

등의 표시를 적용한다.

광고 URL 클릭 시 클릭 통계를 기록하되 외부 URL로 안전하게 redirect한다.

---

# 61. 콘텐츠 상태

공통 상태:

```text
DRAFT
PENDING
PUBLISHED
REJECTED
HIDDEN
ARCHIVED
```

콘텐츠 유형에 따라 필요한 상태만 사용한다.

---

# 62. 페이지네이션

게시판과 관리자 테이블에는 기본 Pagination을 사용한다.

기본:

```text
20 items/page
```

관리자에서는 20/50/100 선택 가능하게 한다.

---

# 63. 에러 처리

사용자에게 DB 에러 메시지를 그대로 노출하지 않는다.

예:

```text
잘못된 요청입니다.
잠시 후 다시 시도해주세요.
```

개발 환경에서는 상세 로그를 기록한다.

---

# 64. Empty State

콘텐츠가 없을 때 빈 화면을 보여주지 않는다.

예:

```text
아직 등록된 소식이 없습니다.

첫 번째 이야기를 등록해보세요.
```

관리자에서는:

```text
등록된 홈페이지가 없습니다.

[홈페이지 신청 내역 확인]
```

---

# 65. 초기 Seed 데이터

개발 시작 시 다음 데이터를 자동 생성한다.

### 관리자
```text
SUPER_ADMIN
```

실제 비밀번호는 seed에 저장하지 않는다.

### 게시판
9개 초기 게시판.

### 사이트 템플릿
11개 내외.

### 광고 슬롯
7개.

### 샘플 사이트
10개 내외.

### 샘플 뉴스
10개 내외.

### 샘플 행사
5개 내외.

### 샘플 커뮤니티 게시물
20개 내외.

---

# 66. 개발 완료 기준

다음 조건을 모두 만족해야 MVP 완료로 판단한다.

- [ ] 사용자가 회원가입 가능
- [ ] 로그인 가능
- [ ] 메인 홈페이지 정상 표시
- [ ] 담양소식 CRUD
- [ ] 커뮤니티 CRUD
- [ ] 댓글
- [ ] 신고
- [ ] 지역정보 조회
- [ ] 홈페이지 생성 신청
- [ ] 관리자 승인
- [ ] 서브홈페이지 생성
- [ ] 사이트별 페이지 생성
- [ ] Block Renderer 작동
- [ ] 사이트 운영자 권한 분리
- [ ] 통합관리자 전체 관리
- [ ] 모바일 반응형
- [ ] RLS 적용
- [ ] 기본 통계
- [ ] 광고 등록/승인/노출
- [ ] Build 성공
- [ ] 주요 권한 테스트 통과

---

# 67. Claude Code 첫 실행 지시문

Claude Code에서 프로젝트를 시작할 때 다음 원칙을 따른다.

```text
이 프로젝트는 ALLDAM_MASTER_SPEC.md를 기준으로 개발한다.

먼저 현재 프로젝트의 파일 구조와 package.json을 확인한다.

아직 프로젝트가 없다면 Next.js + TypeScript 프로젝트를 생성한다.

그 후 다음 순서로 작업한다.

1. 프로젝트 초기화
2. Tailwind/shadcn 설정
3. Supabase 연결 구조
4. 환경변수 템플릿
5. 기본 디자인 시스템
6. DB Migration
7. Seed
8. Authentication
9. RBAC
10. 메인 홈페이지

한 단계씩 완료하고 TypeScript 오류와 build 오류를 확인한다.

기존 기능을 임의로 삭제하지 않는다.

DB 변경은 반드시 migration으로 남긴다.

RLS를 우회하는 방식으로 기능을 구현하지 않는다.

Service Role Key를 클라이언트 코드에 노출하지 않는다.

모바일 화면을 함께 구현한다.

각 단계 완료 후 변경 파일과 테스트 결과를 요약한다.
```

---

# 68. 최종 아키텍처

```text
                         ┌─────────────────┐
                         │     사용자       │
                         └────────┬────────┘
                                  │
                         ┌────────▼────────┐
                         │    Next.js      │
                         └────────┬────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
       ┌──────▼──────┐     ┌──────▼──────┐     ┌──────▼──────┐
       │ 메인 포털    │     │ 서브사이트   │     │ 통합관리자   │
       └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
              │                   │                   │
              └───────────────────┼───────────────────┘
                                  │
                         ┌────────▼────────┐
                         │    Supabase     │
                         ├─────────────────┤
                         │ Auth            │
                         │ PostgreSQL      │
                         │ Storage         │
                         │ RLS             │
                         └─────────────────┘
```

---

# 69. 최종 제품 정의

올담은 다음 4개의 서비스를 하나로 결합한 플랫폼이다.

```text
지역 포털
    +
지역 커뮤니티
    +
멀티사이트 홈페이지 플랫폼
    +
지역 광고 플랫폼
```

그리고 향후:

```text
        올담
          │
 ┌────────┼─────────┐
 │        │         │
지역포털  홈페이지  커뮤니티
 │        │         │
 └────────┼─────────┘
          │
         AI
          │
 ┌────────┼─────────┐
 │        │         │
AI검색  AI콘텐츠  AI홈페이지
```

로 확장한다.

---

# 70. 가장 중요한 제품 원칙

**올담은 광고를 보기 위한 사이트가 아니다.**

군민이:

> "오늘 담양에 무슨 일이 있지?"

> "오늘 어디 갈까?"

> "이 업체가 어디 있지?"

> "우리 동호회 홈페이지는 어디지?"

> "이번 주에 어떤 행사가 있지?"

> "담양에서 사람들과 무엇을 할 수 있지?"

라는 질문을 해결하기 위해 들어오는 플랫폼이어야 한다.

그 결과 사용자가 모이면:

**업체가 들어오고 → 홈페이지가 만들어지고 → 광고주가 들어오고 → 플랫폼이 성장하는 구조**를 만든다.

---

## END OF ALLDAM_MASTER_SPEC.md

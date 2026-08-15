/**
 * One-time seed for the 소리향기 (Sori-hyanggi) club site.
 *
 * Run locally only, with the service-role key available:
 *   npm run seed
 *
 * Not idempotent by design beyond a guard against double-seeding the same
 * slug — if you need to reseed, delete the `sites` row (cascades to the
 * rest) and the auth user first.
 */
import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";

loadEnv({ path: ".env.local" });
import { randomBytes } from "node:crypto";
import type { Database } from "../types/database";
import type { PageContent } from "../lib/blocks/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SITE_SLUG = "sorihyanggi";
const ADMIN_EMAIL = "admin@sorihyanggi.damyangall.kr";

function homeContent(): PageContent {
  return {
    version: 1,
    blocks: [
      {
        id: "block-hero",
        type: "hero",
        props: {
          title: "소리향기",
          subtitle: "담양 오카리나 동아리",
          image: "/images/sorihyanggi-hero.webp",
          overlay: 0.35,
        },
      },
      {
        id: "block-intro",
        type: "text",
        props: {
          title: "소개",
          content:
            "소리향기는 담양에서 활동하는 오카리나 동아리로, 담양관내 행사와 축제에서 공연을 주로 하고 있습니다. (상세 소개는 준비 중입니다 — 관리자 화면에서 수정해주세요.)",
        },
      },
      {
        id: "block-activity",
        type: "card",
        props: { title: "활동 소식", source: "site_posts", limit: 3 },
      },
      {
        id: "block-contact",
        type: "contact",
        props: { phone: null, email: null, note: "연락처 정보 준비 중입니다." },
      },
      {
        id: "block-sns",
        type: "sns",
        props: { instagram: null },
      },
    ],
  };
}

function aboutContent(): PageContent {
  return {
    version: 1,
    blocks: [
      {
        id: "block-about-lead",
        type: "text",
        props: {
          variant: "lead",
          title: "마음을 울리는 소리, 향기처럼 퍼지는 선율",
          content: "소리향기, 담양 오카리나 동아리",
        },
      },
      {
        id: "block-about-intro",
        type: "text",
        props: {
          content:
            "소리향기는 담양을 기반으로 활동하는 오카리나 동아리입니다.\n\n오카리나의 따뜻하고 맑은 음색을 통해 일상에 작은 즐거움과 감동을 전하고, 회원들이 함께 음악을 배우고 연주하며 소중한 인연을 만들어가고 있습니다.\n\n담양의 아름다운 자연과 문화 속에서 음악을 사랑하는 사람들이 모여 연습하고, 무대에 서며, 우리의 선율을 지역사회와 함께 나누고 있습니다.",
        },
      },
      { id: "block-about-divider-1", type: "divider", props: { spacing: "lg" } },
      {
        id: "block-about-activity-title",
        type: "text",
        props: {
          title: "소리향기는 이렇게 활동합니다",
          content: "동아리 안에서, 그리고 지역 사회 속에서 소리향기가 만들어가는 시간들입니다.",
        },
      },
      {
        id: "block-about-activities",
        type: "card",
        props: {
          source: "static",
          items: [
            {
              title: "🎵 함께 배우고, 함께 연주합니다",
              description:
                "처음 오카리나를 접하는 회원부터 꾸준히 연주해 온 회원까지 서로의 경험과 연주를 나누며 함께 성장하고 있습니다. 정기적인 연습과 음악 활동을 통해 실력을 높이는 것은 물론, 음악을 통해 회원 간의 친목과 소통을 만들어가고 있습니다.",
            },
            {
              title: "🎪 담양의 행사와 축제에서 만납니다",
              description:
                "소리향기의 가장 큰 즐거움은 지역의 다양한 행사와 축제에서 주민들과 함께 음악을 나누는 것입니다. 무대의 크기보다 중요한 것은 그 순간 함께하는 사람들의 마음이라고 생각하며, 한 곡의 음악이 잠시나마 편안한 휴식과 즐거운 추억이 되도록 정성을 다해 연주합니다.",
            },
            {
              title: "🌿 담양의 문화와 함께합니다",
              description:
                "대나무의 고장 담양은 아름다운 자연과 풍부한 문화가 어우러진 곳입니다. 소리향기는 이러한 담양의 아름다움과 어울리는 오카리나의 자연스럽고 따뜻한 음색을 통해 담양의 문화와 일상에 음악의 향기를 더하고자 합니다.",
            },
          ],
        },
      },
      { id: "block-about-divider-2", type: "divider", props: { spacing: "lg" } },
      {
        id: "block-about-vision",
        type: "text",
        props: {
          title: "우리가 꿈꾸는 소리향기",
          content:
            "소리향기는 단순히 악기를 배우는 동아리를 넘어, 음악으로 사람과 사람을 연결하고 지역과 함께 성장하는 동아리를 만들어가고자 합니다.\n\n회원들에게는 즐겁게 음악을 배우고 활동할 수 있는 공간이 되고, 지역 주민들에게는 언제 어디서든 편안하게 음악을 만날 수 있는 작은 문화공간이 되겠습니다.\n\n그리고 담양의 다양한 행사와 축제에서 우리의 음악을 통해 담양의 아름다운 풍경에 또 하나의 특별한 소리를 더하겠습니다.",
        },
      },
      {
        id: "block-about-promise",
        type: "text",
        props: {
          variant: "quote",
          title: "소리향기의 약속",
          content:
            "함께 연주하고, 함께 웃으며, 담양 곳곳에 아름다운 소리를 전하겠습니다.\n\n작은 오카리나에서 시작된 선율이 담양의 곳곳에 따뜻한 향기처럼 퍼져나갈 수 있도록 소리향기는 오늘도 즐겁게 연주합니다.",
        },
      },
      {
        id: "block-about-signature",
        type: "text",
        props: {
          variant: "lead",
          title: "소리향기",
          content:
            "마음이 머무는 선율, 함께하는 행복\n\n오카리나 동아리 · 담양에서 아름다운 소리를 전합니다",
        },
      },
    ],
  };
}

async function main() {
  const { data: existingSite } = await supabase
    .from("sites")
    .select("id")
    .eq("slug", SITE_SLUG)
    .maybeSingle();

  if (existingSite) {
    console.log(
      `사이트 slug="${SITE_SLUG}"가 이미 존재합니다 (id=${existingSite.id}). 시드를 건너뜁니다.`
    );
    return;
  }

  console.log("1/9 site_templates 생성...");
  const { data: template, error: templateError } = await supabase
    .from("site_templates")
    .insert({
      name: "동아리 기본형",
      category: "CLUB",
      description: "동아리/동호회용 기본 템플릿",
      schema: {
        blockTypes: [
          "hero",
          "text",
          "image",
          "gallery",
          "card",
          "map",
          "contact",
          "sns",
          "divider",
          "spacer",
        ],
      },
      is_active: true,
    })
    .select()
    .single();
  if (templateError || !template) throw templateError;

  console.log("2/9 관리자 계정 생성...");
  const password = randomBytes(9).toString("base64url");
  const { data: authUser, error: authError } =
    await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password,
      email_confirm: true,
    });
  if (authError || !authUser.user) throw authError;
  const userId = authUser.user.id;

  console.log("3/9 public.users 갱신...");
  const { error: userError } = await supabase
    .from("users")
    .update({ name: "소리향기 관리자", role: "SITE_ADMIN" })
    .eq("id", userId);
  if (userError) throw userError;

  console.log("4/9 sites 생성...");
  const { data: site, error: siteError } = await supabase
    .from("sites")
    .insert({
      owner_id: userId,
      name: "소리향기",
      slug: SITE_SLUG,
      category: "동아리",
      subcategory: "오카리나",
      description:
        "담양에서 활동하는 오카리나 동아리, 소리향기입니다. 담양관내 행사 및 축제에서 공연을 주로 하고 있습니다.",
      logo_url: "/images/sorihyanggi-logo.png",
      status: "ACTIVE",
      template_id: template.id,
      published_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (siteError || !site) throw siteError;

  console.log("5/9 site_members 생성...");
  const { error: memberError } = await supabase.from("site_members").insert({
    site_id: site.id,
    user_id: userId,
    role: "SITE_ADMIN",
    status: "ACTIVE",
  });
  if (memberError) throw memberError;

  console.log("6/9 site_settings 생성...");
  const { error: settingsError } = await supabase.from("site_settings").insert({
    site_id: site.id,
    primary_color: "#24483A",
    secondary_color: "#3F6650",
    accent_color: "#B99B5F",
    font_family: "Pretendard",
    seo_title: "소리향기 | 담양 오카리나 동아리",
    seo_description: "담양에서 활동하는 오카리나 동아리 소리향기의 공식 홈페이지입니다.",
  });
  if (settingsError) throw settingsError;

  console.log("7/9 site_pages 생성...");
  const { error: pagesError } = await supabase.from("site_pages").insert([
    {
      site_id: site.id,
      title: "홈",
      slug: "home",
      page_type: "HOME",
      content: homeContent(),
      is_home: true,
      is_published: true,
      sort_order: 0,
    },
    {
      site_id: site.id,
      title: "소개",
      slug: "about",
      page_type: "CUSTOM",
      content: aboutContent(),
      is_home: false,
      is_published: true,
      sort_order: 1,
    },
  ]);
  if (pagesError) throw pagesError;

  console.log("8/9 site_menus 생성...");
  const { error: menusError } = await supabase.from("site_menus").insert([
    { site_id: site.id, title: "홈", url: "/", menu_type: "PAGE", sort_order: 0 },
    { site_id: site.id, title: "소개", url: "/about", menu_type: "PAGE", sort_order: 1 },
    { site_id: site.id, title: "활동내역", url: "/posts", menu_type: "POSTS", sort_order: 2 },
    { site_id: site.id, title: "문의", url: "/inquiry", menu_type: "PAGE", sort_order: 3 },
  ]);
  if (menusError) throw menusError;

  console.log("9/9 site_posts(활동내역) 생성...");
  const realPosts = [
    {
      title: "2026 생활문화 축제 '월담' 오카리나 동아리 \"소리향기\" 공연",
      videoUrl: "https://youtu.be/PHbcnMs5KDE",
      daysAgo: 10,
    },
    {
      title: "2026 생활문화 축제 '월담' 오카리나 동아리 \"소리향기\" 공연 (2)",
      videoUrl: "https://youtu.be/R89y9UqXaSI",
      daysAgo: 10,
    },
    {
      title: "2026 생활문화 축제 '월담' 오카리나 동아리 \"소리향기\" 송지환 독주 공연",
      videoUrl: "https://youtu.be/0-94Ptmb1sY",
      daysAgo: 10,
    },
  ];
  const { error: postsError } = await supabase.from("site_posts").insert(
    realPosts.map((p) => {
      const publishedAt = new Date(
        Date.now() - p.daysAgo * 24 * 60 * 60 * 1000
      ).toISOString();
      const content: PageContent = {
        version: 1,
        blocks: [
          {
            id: "block-post-text",
            type: "text",
            props: { content: "2026 생활문화 축제 '월담'에서 소리향기가 공연한 영상입니다." },
          },
        ],
      };
      return {
        site_id: site.id,
        author_id: userId,
        category: "활동내역",
        title: p.title,
        content,
        video_url: p.videoUrl,
        status: "PUBLISHED" as const,
        published_at: publishedAt,
      };
    })
  );
  if (postsError) throw postsError;

  console.log("\n완료되었습니다.");
  console.log(`사이트: https://${SITE_SLUG}.damyangall.kr (dev: http://${SITE_SLUG}.localhost:3000)`);
  console.log(`관리자 이메일: ${ADMIN_EMAIL}`);
  console.log(`관리자 임시 비밀번호: ${password}`);
  console.log("최초 로그인 후 반드시 비밀번호를 변경해주세요. 이 비밀번호는 다시 출력되지 않습니다.");
}

main().catch((err) => {
  console.error("시드 실패:", err);
  process.exit(1);
});

import { z } from "zod";

export const heroBlockSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  subtitle: z.string().optional(),
  image: z.string().optional(),
  overlay: z.number().min(0).max(1).optional(),
  showText: z.boolean().optional(),
});

export const textBlockSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, "내용을 입력해주세요"),
  variant: z.enum(["default", "lead", "quote"]).optional(),
});

export const imageBlockSchema = z.object({
  image: z.string().min(1, "이미지 URL을 입력해주세요"),
  caption: z.string().optional(),
});

export const galleryBlockSchema = z.object({
  title: z.string().optional(),
  images: z.array(
    z.object({ url: z.string().min(1), caption: z.string().optional() })
  ),
});

export const cardBlockSchema = z.object({
  title: z.string().optional(),
  source: z.enum(["static", "site_posts"]).optional(),
  limit: z.number().int().positive().max(20).optional(),
  items: z
    .array(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        image: z.string().optional(),
        href: z.string().optional(),
      })
    )
    .optional(),
});

export const mapBlockSchema = z.object({
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  address: z.string().optional(),
  note: z.string().optional(),
});

export const contactBlockSchema = z.object({
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  note: z.string().optional(),
});

export const snsBlockSchema = z.object({
  instagram: z.string().nullable().optional(),
  facebook: z.string().nullable().optional(),
  youtube: z.string().nullable().optional(),
});

export const dividerBlockSchema = z.object({
  spacing: z.enum(["sm", "md", "lg"]).optional(),
});

export const spacerBlockSchema = z.object({
  height: z.enum(["sm", "md", "lg"]).optional(),
});

export const blockSchemaByType = {
  hero: heroBlockSchema,
  text: textBlockSchema,
  image: imageBlockSchema,
  gallery: galleryBlockSchema,
  card: cardBlockSchema,
  map: mapBlockSchema,
  contact: contactBlockSchema,
  sns: snsBlockSchema,
  divider: dividerBlockSchema,
  spacer: spacerBlockSchema,
} as const;

export const pageContentSchema = z.object({
  version: z.literal(1),
  blocks: z.array(
    z.object({
      id: z.string(),
      type: z.enum([
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
      ]),
      props: z.record(z.string(), z.unknown()),
    })
  ),
});

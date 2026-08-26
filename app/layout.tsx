import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { PageViewTracker } from "@/components/main/PageViewTracker";

const SITE_URL = "https://www.damyangall.kr";
const SITE_TITLE = "담양 올담 | 담양의 모든 이야기를 담다";
const SITE_DESCRIPTION =
  "담양의 지역정보, 소식, 행사, 커뮤니티를 한곳에 모은 담양군 지역 포털, 올담입니다.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "담양 올담",
    locale: "ko_KR",
    type: "website",
    images: ["/images/hero-1.webp"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
        <PageViewTracker />
        <Analytics />
      </body>
    </html>
  );
}

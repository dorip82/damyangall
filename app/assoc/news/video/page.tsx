import { NewsListPage, newsMetadata } from "@/components/assoc/NewsListPage";

export const metadata = newsMetadata("video");

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  return <NewsListPage kind="video" page={page} />;
}

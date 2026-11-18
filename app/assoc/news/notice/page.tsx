import { NewsListPage, newsMetadata } from "@/components/assoc/NewsListPage";

export const metadata = newsMetadata("notice");

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const { page, q } = await searchParams;
  return <NewsListPage kind="notice" page={page} q={q} />;
}

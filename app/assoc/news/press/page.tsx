import { NewsListPage, newsMetadata } from "@/components/assoc/NewsListPage";

export const metadata = newsMetadata("press");

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const { page, q } = await searchParams;
  return <NewsListPage kind="press" page={page} q={q} />;
}

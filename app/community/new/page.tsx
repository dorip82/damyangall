import { PortalHeader } from "@/components/main/PortalHeader";
import { PortalFooter } from "@/components/main/PortalFooter";
import { CommunityPostForm } from "@/components/main/CommunityPostForm";

export default function NewCommunityPostPage() {
  return (
    <div className="site-theme flex min-h-screen flex-col bg-background text-foreground">
      <PortalHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-6 py-16">
          <h1 className="mb-8 text-2xl font-bold text-foreground sm:text-3xl">
            커뮤니티 글쓰기
          </h1>
          <CommunityPostForm />
        </section>
      </main>
      <PortalFooter />
    </div>
  );
}

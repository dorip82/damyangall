export function PortalHeader() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-6">
        <span className="text-lg font-bold tracking-tight text-primary">올담</span>
        <span className="hidden text-sm text-muted-foreground sm:inline">
          담양의 모든 이야기를 담다
        </span>
      </div>
    </header>
  );
}

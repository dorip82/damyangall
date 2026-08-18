export function PortalFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-deep-forest text-ivory">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-lg font-bold">올담</p>
        <p className="mt-2 max-w-xl text-sm text-ivory/70">
          담양의 모든 이야기를 담다. 담양군민, 동아리·동호회, 기업·소상공인, 기관·단체가
          함께 만들어가는 지역 통합 플랫폼입니다.
        </p>
        <p className="mt-8 text-xs text-ivory/40">© {new Date().getFullYear()} 올담.</p>
      </div>
    </footer>
  );
}

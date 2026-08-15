export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-deep-forest px-6 text-center text-ivory">
      <p className="text-sm tracking-[0.3em] text-wood uppercase">404</p>
      <h1 className="text-2xl font-bold">페이지를 찾을 수 없습니다</h1>
      <p className="max-w-sm text-sm text-ivory/70">
        요청하신 사이트 또는 페이지가 존재하지 않거나 아직 준비되지
        않았습니다.
      </p>
    </main>
  );
}

/** GET-method search box for admin list pages — no client JS needed. */
export function AdminSearchInput({
  action,
  defaultValue,
  placeholder,
  hiddenParams,
}: {
  action: string;
  defaultValue?: string;
  placeholder: string;
  hiddenParams?: Record<string, string | undefined>;
}) {
  return (
    <form action={action} className="flex gap-2">
      {Object.entries(hiddenParams ?? {}).map(([key, value]) =>
        value ? <input key={key} type="hidden" name={key} value={value} /> : null
      )}
      <input
        type="text"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-9 w-56 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-accent"
      />
      <button
        type="submit"
        className="h-9 shrink-0 rounded-md border border-border px-3 text-sm font-medium text-foreground hover:bg-muted"
      >
        검색
      </button>
    </form>
  );
}

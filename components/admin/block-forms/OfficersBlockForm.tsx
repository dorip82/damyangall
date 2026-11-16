import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { OfficersBlockProps } from "@/lib/blocks/types";

type Term = OfficersBlockProps["terms"][number];

const DEFAULT_ROLES = ["회장", "부회장", "총무"];

export function OfficersBlockForm({
  value,
  onChange,
}: {
  value: OfficersBlockProps;
  onChange: (next: OfficersBlockProps) => void;
}) {
  const terms = value.terms ?? [];

  function updateTerm(index: number, next: Term) {
    const copy = terms.slice();
    copy[index] = next;
    onChange({ ...value, terms: copy });
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        연도(또는 기수)별로 임원진을 입력합니다. 최근 연도를 위에 두면 홈페이지에도 그 순서로 보입니다.
        이름이 비어 있는 줄은 표시되지 않습니다.
      </p>
      <div className="space-y-1.5">
        <Label>섹션 제목</Label>
        <Input
          value={value.title ?? ""}
          placeholder="역대 임원진"
          onChange={(e) => onChange({ ...value, title: e.target.value || undefined })}
        />
      </div>

      {terms.map((term, ti) => (
        <div key={ti} className="space-y-3 rounded-md border border-dashed border-border p-3">
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1.5">
              <Label>연도 / 기수</Label>
              <Input
                value={term.label}
                placeholder="예: 2026년"
                onChange={(e) => updateTerm(ti, { ...term, label: e.target.value })}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="이 연도 삭제"
              onClick={() => onChange({ ...value, terms: terms.filter((_, j) => j !== ti) })}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>

          {term.members.map((m, mi) => (
            <div key={mi} className="flex gap-2">
              <Input
                className="w-32"
                value={m.role}
                placeholder="직책"
                onChange={(e) => {
                  const members = term.members.slice();
                  members[mi] = { ...m, role: e.target.value };
                  updateTerm(ti, { ...term, members });
                }}
              />
              <Input
                value={m.name}
                placeholder="이름"
                onChange={(e) => {
                  const members = term.members.slice();
                  members[mi] = { ...m, name: e.target.value };
                  updateTerm(ti, { ...term, members });
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="삭제"
                onClick={() => updateTerm(ti, { ...term, members: term.members.filter((_, j) => j !== mi) })}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => updateTerm(ti, { ...term, members: [...term.members, { role: "", name: "" }] })}
          >
            <Plus className="size-4" /> 임원 추가
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          onChange({
            ...value,
            terms: [
              { label: "", members: DEFAULT_ROLES.map((role) => ({ role, name: "" })) },
              ...terms,
            ],
          })
        }
      >
        <Plus className="size-4" /> 연도 추가
      </Button>
    </div>
  );
}

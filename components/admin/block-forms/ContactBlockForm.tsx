import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ContactBlockProps } from "@/lib/blocks/types";

export function ContactBlockForm({
  value,
  onChange,
}: {
  value: ContactBlockProps;
  onChange: (next: ContactBlockProps) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>전화번호</Label>
        <Input
          value={value.phone ?? ""}
          onChange={(e) => onChange({ ...value, phone: e.target.value || null })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>이메일</Label>
        <Input
          value={value.email ?? ""}
          onChange={(e) => onChange({ ...value, email: e.target.value || null })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>준비 중 안내 문구</Label>
        <Input
          value={value.note ?? ""}
          onChange={(e) => onChange({ ...value, note: e.target.value })}
        />
      </div>
    </div>
  );
}

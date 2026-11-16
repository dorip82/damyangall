"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addMember, changeMemberRole, removeMember } from "@/app/admin/(protected)/members/actions";

export interface MemberRow {
  member_id: string;
  user_id: string;
  email: string;
  name: string | null;
  role: "SITE_ADMIN" | "EDITOR" | "MEMBER";
  status: string;
}

const ROLE = { SITE_ADMIN: "관리자 (모든 권한)", EDITOR: "편집자 (콘텐츠만)", MEMBER: "회원" } as const;
const selectCls = "h-9 rounded-md border border-input bg-transparent px-2 text-sm";

export function MembersManager({ siteId, members, me }: { siteId: string; members: MemberRow[]; me: string }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("EDITOR");
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, done: string) =>
    start(async () => {
      const r = await fn();
      if (r.ok) toast.success(done);
      else toast.error(r.error ?? "처리하지 못했습니다.");
    });

  return (
    <div className="space-y-8">
      <form
        className="flex max-w-2xl flex-wrap items-end gap-3 rounded-md border border-border p-4"
        onSubmit={(e) => {
          e.preventDefault();
          run(async () => {
            const r = await addMember(siteId, email, role);
            if (r.ok) setEmail("");
            return r;
          }, "추가했습니다.");
        }}
      >
        <div className="min-w-56 flex-1 space-y-2">
          <Label htmlFor="m-email">가입한 회원 이메일</Label>
          <Input id="m-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="m-role">권한</Label>
          <select id="m-role" className={selectCls} value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="EDITOR">{ROLE.EDITOR}</option>
            <option value="SITE_ADMIN">{ROLE.SITE_ADMIN}</option>
          </select>
        </div>
        <Button type="submit" disabled={pending}>
          <UserPlus className="size-4" /> 추가
        </Button>
        <p className="w-full text-xs text-muted-foreground">
          올담(damyangall.kr)에 회원가입한 사람만 추가할 수 있습니다. 편집자는 공지·대회·동호회·자료를 관리하고, 관리자는 기본 정보·팝업·계정까지 관리합니다.
        </p>
      </form>

      <ul className="divide-y divide-border rounded-md border border-border">
        {members.map((m) => (
          <li key={m.member_id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="font-medium">
                {m.name || m.email}
                {m.user_id === me ? <span className="ml-1 text-xs text-muted-foreground">(나)</span> : null}
              </p>
              {m.name ? <p className="text-xs text-muted-foreground">{m.email}</p> : null}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <select
                aria-label={`${m.email} 권한`}
                className={selectCls}
                defaultValue={m.role}
                disabled={pending || m.user_id === me}
                onChange={(e) => run(() => changeMemberRole(siteId, m.member_id, e.target.value), "권한을 변경했습니다.")}
              >
                <option value="EDITOR">{ROLE.EDITOR}</option>
                <option value="SITE_ADMIN">{ROLE.SITE_ADMIN}</option>
                {m.role === "MEMBER" ? <option value="MEMBER">{ROLE.MEMBER}</option> : null}
              </select>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label={`${m.email} 삭제`}
                disabled={pending || m.user_id === me}
                onClick={() => {
                  if (window.confirm(`${m.email} 의 관리 권한을 없앨까요?`)) run(() => removeMember(siteId, m.member_id), "삭제했습니다.");
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

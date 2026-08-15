import { Mail, MapPin, Phone } from "lucide-react";
import type { ContactBlockProps } from "@/lib/blocks/types";

export function ContactBlock({ phone, email, address, note }: ContactBlockProps) {
  const hasAny = phone || email || address;

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h2 className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">
        문의
      </h2>
      {hasAny ? (
        <ul className="space-y-3 text-foreground/80">
          {phone ? (
            <li className="flex items-center gap-3">
              <Phone className="size-4 text-accent" aria-hidden />
              <a href={`tel:${phone}`}>{phone}</a>
            </li>
          ) : null}
          {email ? (
            <li className="flex items-center gap-3">
              <Mail className="size-4 text-accent" aria-hidden />
              <a href={`mailto:${email}`}>{email}</a>
            </li>
          ) : null}
          {address ? (
            <li className="flex items-center gap-3">
              <MapPin className="size-4 text-accent" aria-hidden />
              <span>{address}</span>
            </li>
          ) : null}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          {note ?? "연락처 정보가 준비되면 표시됩니다."}
        </p>
      )}
    </section>
  );
}

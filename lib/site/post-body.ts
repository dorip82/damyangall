/**
 * 게시글 본문 안의 사진 줄: 한 줄 전체가 ![설명](주소) 형식이면 그 자리에 사진을 넣는다.
 * 주소는 http(s) 또는 / 로 시작하는 것만 허용한다.
 */
export const BODY_IMAGE_RE = /^!\[([^\]\n]{0,200})\]\(((?:https?:\/\/|\/)[^\s)]+)\)[ \t]*$/m;

export type BodySegment = { type: "text"; text: string } | { type: "image"; alt: string; url: string };

export function parsePostBody(content: string): BodySegment[] {
  const out: BodySegment[] = [];
  let buf: string[] = [];
  const flush = () => {
    const text = buf.join("\n").replace(/^\n+|\n+$/g, "");
    if (text.trim()) out.push({ type: "text", text });
    buf = [];
  };
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(BODY_IMAGE_RE);
    if (m) {
      flush();
      out.push({ type: "image", alt: m[1].trim(), url: m[2] });
    } else buf.push(line);
  }
  flush();
  return out;
}

/** 목록 요약·검색엔진 설명용: 사진 줄을 뺀 본문 */
export function stripBodyImages(content: string) {
  return content
    .split(/\r?\n/)
    .filter((l) => !BODY_IMAGE_RE.test(l))
    .join("\n");
}

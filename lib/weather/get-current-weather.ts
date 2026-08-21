import "server-only";

// 기상청 단기예보(초단기실황) 격자좌표. 위경도 → 격자 변환은 기상청이 공개한
// Lambert Conformal Conic 공식으로 계산했다(담양읍 35.3213, 126.9881 기준
// nx=61, ny=78). 올담이 다루는 지역이 담양군 하나뿐이라 범용 변환 유틸 대신
// 고정값으로 둔다.
const DAMYANG_NX = 61;
const DAMYANG_NY = 78;

const PTY_LABELS: Record<string, string> = {
  "0": "맑음",
  "1": "비",
  "2": "비/눈",
  "3": "눈",
  "4": "소나기",
  "5": "빗방울",
  "6": "빗방울눈날림",
  "7": "눈날림",
};

export interface CurrentWeather {
  temperatureC: number;
  humidityPercent: number;
  conditionLabel: string;
  isRain: boolean;
  isSnow: boolean;
}

/**
 * 초단기실황(getUltraSrtNcst)은 매시 정각 발표, 10분 뒤부터 조회 가능 —
 * 발표 시각 이전이면 이전 시간대 값을 요청해야 한다.
 */
function getBaseDateTime(): { baseDate: string; baseTime: string } {
  const kstNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  let hour = kstNow.getHours();
  if (kstNow.getMinutes() < 10) hour -= 1;
  if (hour < 0) {
    hour = 23;
    kstNow.setDate(kstNow.getDate() - 1);
  }
  const y = kstNow.getFullYear();
  const m = String(kstNow.getMonth() + 1).padStart(2, "0");
  const d = String(kstNow.getDate()).padStart(2, "0");
  return { baseDate: `${y}${m}${d}`, baseTime: `${String(hour).padStart(2, "0")}00` };
}

interface KmaItem {
  category: string;
  obsrValue: string;
}

export async function getCurrentWeather(): Promise<CurrentWeather | null> {
  const serviceKey = process.env.KMA_SERVICE_KEY;
  if (!serviceKey) return null;

  const { baseDate, baseTime } = getBaseDateTime();
  const url = new URL(
    "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst"
  );
  url.searchParams.set("serviceKey", serviceKey);
  url.searchParams.set("dataType", "JSON");
  url.searchParams.set("pageNo", "1");
  url.searchParams.set("numOfRows", "10");
  url.searchParams.set("base_date", baseDate);
  url.searchParams.set("base_time", baseTime);
  url.searchParams.set("nx", String(DAMYANG_NX));
  url.searchParams.set("ny", String(DAMYANG_NY));

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      next: { revalidate: 600 },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;

    const json = await res.json();
    const items: KmaItem[] = json?.response?.body?.items?.item ?? [];
    if (!items.length) return null;

    const byCategory = new Map(items.map((item) => [item.category, item.obsrValue]));
    const temperatureC = Number(byCategory.get("T1H"));
    const humidityPercent = Number(byCategory.get("REH"));
    const pty = byCategory.get("PTY") ?? "0";
    if (Number.isNaN(temperatureC) || Number.isNaN(humidityPercent)) return null;

    return {
      temperatureC,
      humidityPercent,
      conditionLabel: PTY_LABELS[pty] ?? "맑음",
      isRain: ["1", "2", "4", "5", "6"].includes(pty),
      isSnow: ["2", "3", "6", "7"].includes(pty),
    };
  } catch {
    return null;
  }
}

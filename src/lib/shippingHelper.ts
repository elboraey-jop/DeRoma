export type ShippingZoneData = {
  id?: string;
  name?: string;
  governorates: string[];
  fee: number;
  estimatedDays?: string | null;
  freeShippingThreshold?: number | null;
  exceptions?: Array<{ city: string; fee: number }>;
};

export type ShippingSettingsData = {
  freeShippingEnabled: boolean;
  freeShippingThreshold: number | null;
} | null;

const GOV_ALIASES: Record<string, string[]> = {
  cairo: ["cairo", "القاهرة", "القاهره"],
  giza: ["giza", "الجيزة", "الجيزه"],
  alexandria: ["alexandria", "الإسكندرية", "الاسكندرية", "الإسكندريه", "الاسكندريه"],
  qalyubia: ["qalyubia", "القليوبية", "القليوبيه"],
  sharqia: ["sharqia", "الشرقية", "الشرقيه"],
  dakahlia: ["dakahlia", "الدقهلية", "الدقهليه"],
  monufia: ["monufia", "المنوفية", "المنوفيه"],
  gharbia: ["gharbia", "الغربية", "الغربيه"],
  "kafr el sheikh": ["kafr el sheikh", "كفر الشيخ"],
  damietta: ["damietta", "دمياط"],
  "port said": ["port said", "بورسعيد"],
  ismailia: ["ismailia", "الإسماعيلية", "الاسماعيلية", "الإسماعيليه", "الاسماعيليه"],
  suez: ["suez", "السويس"],
  fayoum: ["fayoum", "الفيوم"],
  "beni suef": ["beni suef", "بني سويف"],
  minya: ["minya", "المنيا"],
  asyut: ["asyut", "أسيوط", "اسيوط"],
  sohag: ["sohag", "سوهاج"],
  qena: ["qena", "قنا"],
  luxor: ["luxor", "الأقصر", "الاقصر"],
  aswan: ["aswan", "أسوان", "اسوان"],
  "red sea": ["red sea", "البحر الأحمر", "البحر الاحمر"],
  "new valley": ["new valley", "الوادي الجديد"],
  matrouh: ["matrouh", "مطروح"],
  "north sinai": ["north sinai", "شمال سيناء"],
  "south sinai": ["south sinai", "جنوب سيناء"],
};

export function isGovMatch(selectedGov: string, zoneGov: string): boolean {
  if (!selectedGov || !zoneGov) return false;
  const sel = selectedGov.trim().toLowerCase();
  const zone = zoneGov.trim().toLowerCase();

  if (sel === zone) return true;

  for (const aliases of Object.values(GOV_ALIASES)) {
    const hasSel = aliases.some((a) => a.toLowerCase() === sel);
    const hasZone = aliases.some((a) => a.toLowerCase() === zone);
    if (hasSel && hasZone) return true;
  }

  return false;
}

export function calculateShippingFee({
  governorate,
  city,
  subtotal = 0,
  zones = [],
  settings = null,
}: {
  governorate: string;
  city?: string;
  subtotal?: number;
  zones: ShippingZoneData[];
  settings?: ShippingSettingsData;
}): number {
  if (!governorate) return 0;

  if (
    settings?.freeShippingEnabled &&
    settings.freeShippingThreshold !== null &&
    subtotal >= settings.freeShippingThreshold
  ) {
    return 0;
  }

  const matchingZone = zones.find((zone) =>
    zone.governorates.some((g) => isGovMatch(governorate, g))
  );

  if (!matchingZone) {
    return 70;
  }

  if (
    matchingZone.freeShippingThreshold != null &&
    subtotal >= matchingZone.freeShippingThreshold
  ) {
    return 0;
  }

  const cityClean = (city || "").trim().toLowerCase();
  if (cityClean && matchingZone.exceptions && matchingZone.exceptions.length > 0) {
    const exception = matchingZone.exceptions.find(
      (ex) => ex.city.trim().toLowerCase() === cityClean
    );
    if (exception) {
      return Number(exception.fee);
    }
  }

  return Number(matchingZone.fee);
}

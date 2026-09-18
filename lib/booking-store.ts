/**
 * In-memory booking store for the portfolio demo on Vercel.
 * Survives warm serverless invocations via globalThis; cold starts reseeds.
 */

export type DaySchedule = Record<string, string[]>;

export type Slot = {
  id: number;
  date: string;
  time: string;
  status: "free" | "booked";
  booking_name?: string | null;
  phone?: string | null;
  email?: string | null;
};

export type BookingSettings = {
  price_eur: number;
  price_huf: number;
  price_display: string;
  schedule: DaySchedule;
};

const DEFAULT_SCHEDULE: DaySchedule = {
  "0": ["15:15", "16:15", "17:00", "17:45", "18:30"],
  "1": ["15:15", "16:15", "17:00", "17:45", "18:30"],
  "2": ["15:15", "16:15", "17:00", "17:45", "18:30"],
  "3": ["15:15", "16:15", "17:00", "17:45", "18:30"],
  "4": ["15:15", "16:15", "17:00", "17:45", "18:30"],
  "5": ["08:30", "09:30", "10:30", "11:15", "12:00"],
  "6": ["08:30", "09:30", "10:30", "11:15", "12:00"],
};

type Store = {
  settings: BookingSettings;
  slots: Slot[];
  nextId: number;
};

const globalKey = "__anticode_booking_store_v1";

function formatPrice(eur: number, huf: number): string {
  return `${eur} € / ${huf.toLocaleString("hu-HU")} Ft`;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function buildSlots(schedule: DaySchedule, startId = 1): { slots: Slot[]; nextId: number } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(today);
  end.setDate(end.getDate() + 365);

  const slots: Slot[] = [];
  let id = startId;
  const cursor = new Date(today);
  while (cursor <= end) {
    // Monday=0 … Sunday=6 (matches the booking demo schedule keys)
    const weekday = String((cursor.getDay() + 6) % 7);
    const times = schedule[weekday] || [];
    for (const time of times) {
      slots.push({
        id: id++,
        date: isoDate(cursor),
        time,
        status: "free",
        booking_name: null,
        phone: null,
        email: null,
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return { slots, nextId: id };
}

function createStore(): Store {
  const settings: BookingSettings = {
    price_eur: 30,
    price_huf: 11000,
    price_display: formatPrice(30, 11000),
    schedule: { ...DEFAULT_SCHEDULE },
  };
  const { slots, nextId } = buildSlots(settings.schedule);
  return { settings, slots, nextId };
}

function getStore(): Store {
  const g = globalThis as typeof globalThis & { [globalKey]?: Store };
  if (!g[globalKey]) {
    g[globalKey] = createStore();
  }
  return g[globalKey]!;
}

export function getSettings(): BookingSettings {
  return { ...getStore().settings, schedule: { ...getStore().settings.schedule } };
}

export function updateSettings(input: {
  price_eur?: number;
  price_huf?: number;
  schedule?: DaySchedule;
}): BookingSettings {
  const store = getStore();
  if (typeof input.price_eur === "number" && input.price_eur >= 0) {
    store.settings.price_eur = Math.floor(input.price_eur);
  }
  if (typeof input.price_huf === "number" && input.price_huf >= 0) {
    store.settings.price_huf = Math.floor(input.price_huf);
  }
  if (input.schedule && typeof input.schedule === "object") {
    store.settings.schedule = { ...DEFAULT_SCHEDULE, ...input.schedule };
    // Preserve bookings that still match a date+time; regenerate free slots.
    const booked = store.slots.filter((s) => s.status === "booked");
    const { slots, nextId } = buildSlots(store.settings.schedule, store.nextId);
    const byKey = new Map(booked.map((b) => [`${b.date}|${b.time}`, b]));
    for (const slot of slots) {
      const existing = byKey.get(`${slot.date}|${slot.time}`);
      if (existing) {
        slot.id = existing.id;
        slot.status = "booked";
        slot.booking_name = existing.booking_name;
        slot.phone = existing.phone;
        slot.email = existing.email;
        byKey.delete(`${slot.date}|${slot.time}`);
      }
    }
    // Keep leftover booked slots that no longer match schedule times
    for (const leftover of byKey.values()) {
      slots.push(leftover);
    }
    slots.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    store.slots = slots;
    store.nextId = nextId;
  }
  store.settings.price_display = formatPrice(store.settings.price_eur, store.settings.price_huf);
  return getSettings();
}

export function getSlots(): Array<Pick<Slot, "id" | "date" | "time" | "status">> {
  const today = isoDate(new Date());
  return getStore()
    .slots.filter((s) => s.date >= today)
    .map(({ id, date, time, status }) => ({ id, date, time, status }));
}

export function getBookedSlots(): Slot[] {
  return getStore()
    .slots.filter((s) => s.status === "booked")
    .map((s) => ({ ...s }));
}

export function bookSlot(
  slotId: number,
  booking_name: string,
  phone: string,
  email: string
): boolean {
  const slot = getStore().slots.find((s) => s.id === slotId);
  if (!slot || slot.status !== "free") return false;
  slot.status = "booked";
  slot.booking_name = booking_name;
  slot.phone = phone;
  slot.email = email;
  return true;
}

export function updateBooking(
  slotId: number,
  booking_name: string,
  phone: string,
  email: string
): boolean {
  const slot = getStore().slots.find((s) => s.id === slotId);
  if (!slot || slot.status !== "booked") return false;
  slot.booking_name = booking_name;
  slot.phone = phone;
  slot.email = email;
  return true;
}

export function cancelBooking(slotId: number): boolean {
  const slot = getStore().slots.find((s) => s.id === slotId);
  if (!slot) return false;
  slot.status = "free";
  slot.booking_name = null;
  slot.phone = null;
  slot.email = null;
  return true;
}

export function moveBooking(
  oldSlotId: number,
  newSlotId: number,
  booking_name: string,
  phone: string,
  email: string
): boolean {
  if (oldSlotId === newSlotId) {
    return updateBooking(oldSlotId, booking_name, phone, email);
  }
  const store = getStore();
  const from = store.slots.find((s) => s.id === oldSlotId);
  const to = store.slots.find((s) => s.id === newSlotId);
  if (!from || !to || to.status !== "free") return false;
  to.status = "booked";
  to.booking_name = booking_name;
  to.phone = phone;
  to.email = email;
  from.status = "free";
  from.booking_name = null;
  from.phone = null;
  from.email = null;
  return true;
}

export function isValidPhone(s: string): boolean {
  if (!s) return false;
  return s.replace(/\D/g, "").length >= 9;
}

export function isValidEmail(s: string): boolean {
  if (!s) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

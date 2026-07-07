export function parseMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function formatMinutes(total) {
  const hours = String(Math.floor(total / 60)).padStart(2, "0");
  const minutes = String(total % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function buildSlots(startTime, endTime, slotMinutes) {
  const slots = [];
  const start = parseMinutes(startTime);
  const end = parseMinutes(endTime);

  for (let current = start; current < end; current += slotMinutes) {
    slots.push(formatMinutes(current));
  }

  return slots;
}

export function toDateOnly(dateText) {
  const [year, month, day] = dateText.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function getDayOfWeek(dateText) {
  return toDateOnly(dateText).getUTCDay();
}

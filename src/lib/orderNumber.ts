export function formatOrderNumber(sequence: number) {
  return `DR-${String(sequence).padStart(4, "0")}`;
}

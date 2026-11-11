export type Hotline = { name: string; note: string; numbers: string[] };

// Mga crisis hotline sa Pilipinas
export const HOTLINES: Hotline[] = [
  {
    name: "NCMH Crisis Hotline",
    note: "National Center for Mental Health · 24/7 · libre",
    numbers: ["1553", "09178998727", "09663514518", "09086392672"],
  },
  {
    name: "In Touch Crisis Line",
    note: "Libreng emotional support · 24/7",
    numbers: ["0288937603", "09190560709", "09178001123"],
  },
  {
    name: "Emergency",
    note: "Kung may agarang panganib",
    numbers: ["911"],
  },
];

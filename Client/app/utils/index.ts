const SENDER_COLORS = [
  "text-[#47c8ff]",
  "text-[#3ddc84]",
  "text-[#c471ed]",
  "text-[#ff8e53]",
  "text-[#e8ff47]",
  "text-[#f64f59]",
];

export function senderColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return SENDER_COLORS[Math.abs(hash) % SENDER_COLORS.length];
}

export function formatTime(iso: string) {
  const today = new Date();

  if (today.getDate() !== new Date(iso).getDate())
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });

  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
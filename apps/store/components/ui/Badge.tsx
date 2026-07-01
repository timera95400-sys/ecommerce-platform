const badgeConfig: Record<string, { label: string; classes: string }> = {
  NEW: { label: "Nouveau", classes: "bg-blue-500 text-white" },
  PROMO: { label: "Promo", classes: "bg-red-500 text-white" },
  BESTSELLER: { label: "Bestseller", classes: "bg-amber-500 text-white" },
};

export function Badge({ type }: { type: string }) {
  const config = badgeConfig[type];
  if (!config) return null;
  return (
    <span
      className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 ${config.classes}`}
    >
      {config.label}
    </span>
  );
}

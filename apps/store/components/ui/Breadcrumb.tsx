import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Fil d'ariane">
      <ol className="flex items-center flex-wrap gap-1.5 text-xs text-text-muted">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i < items.length - 1 ? (
              <>
                <Link href={item.href} className="hover:text-text-base transition-colors">
                  {item.label}
                </Link>
                <span aria-hidden="true">/</span>
              </>
            ) : (
              <span className="text-text-base font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

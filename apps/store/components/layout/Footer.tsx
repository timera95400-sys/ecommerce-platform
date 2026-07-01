import Link from "next/link";

export function Footer() {
  const shopName = process.env["NEXT_PUBLIC_SHOP_NAME"] ?? "Ma Boutique";
  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface-alt border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <p className="font-heading font-bold text-lg mb-3">{shopName}</p>
          <p className="text-sm text-text-muted leading-relaxed">
            Boutique en ligne securisee.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-sm uppercase tracking-wide mb-3">
            Boutique
          </h3>
          <ul className="space-y-2 text-sm text-text-muted">
            <li><Link href="/boutique" className="hover:text-text-base transition-colors">Tous les produits</Link></li>
            <li><Link href="/pages/a-propos" className="hover:text-text-base transition-colors">A propos</Link></li>
            <li><Link href="/pages/contact" className="hover:text-text-base transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-sm uppercase tracking-wide mb-3">
            Informations
          </h3>
          <ul className="space-y-2 text-sm text-text-muted">
            <li><Link href="/pages/cgv" className="hover:text-text-base transition-colors">CGV</Link></li>
            <li><Link href="/pages/mentions-legales" className="hover:text-text-base transition-colors">Mentions legales</Link></li>
            <li><Link href="/pages/politique-de-confidentialite" className="hover:text-text-base transition-colors">Confidentialite</Link></li>
            <li><Link href="/pages/retours" className="hover:text-text-base transition-colors">Retours</Link></li>
            <li><Link href="/pages/faq" className="hover:text-text-base transition-colors">FAQ</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-sm uppercase tracking-wide mb-3">
            Newsletter
          </h3>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
          <p>
            &copy; {year} {shopName}. Tous droits reserves.
          </p>
          <div className="flex items-center gap-3">
            <span>Paiement securise</span>
            <span className="font-mono font-semibold border border-border px-2 py-0.5">VISA</span>
            <span className="font-mono font-semibold border border-border px-2 py-0.5">CB</span>
            <span className="font-mono font-semibold border border-border px-2 py-0.5">PAYPAL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function NewsletterForm() {
  "use client";
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const email = (form.elements.namedItem("email") as HTMLInputElement).value;
        await fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
      }}
      className="space-y-2"
    >
      <input
        type="email"
        name="email"
        required
        placeholder="votre@email.com"
        className="w-full border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:border-primary"
      />
      <button
        type="submit"
        className="w-full bg-primary text-white px-4 py-2 text-sm font-medium hover:bg-primary-hover transition-colors"
      >
        S'inscrire
      </button>
    </form>
  );
}

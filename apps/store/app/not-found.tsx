import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center">
        <p className="text-7xl font-heading font-bold text-primary mb-4">404</p>
        <h1 className="text-2xl font-semibold mb-3">Page introuvable</h1>
        <p className="text-text-muted mb-8 max-w-sm">
          La page que vous recherchez n'existe pas ou a ete deplacee.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary text-white px-8 py-3 text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          Retour a l'accueil
        </Link>
      </main>
      <Footer />
    </>
  );
}

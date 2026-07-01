// =============================================================================
// LIVRABLE 6 — Pages statiques (/pages/[slug])
// Contenu 100% gere depuis l'admin Payload CMS
// =============================================================================

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const pages = await db.page.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return pages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await db.page.findUnique({ where: { slug: params.slug } });
  if (!page) return { title: "Page introuvable" };
  return {
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? undefined,
  };
}

export default async function StaticPage({ params }: PageProps) {
  const page = await db.page.findUnique({
    where: { slug: params.slug, status: "PUBLISHED" },
  });

  if (!page) notFound();

  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-16">
        <h1 className="font-heading text-3xl font-semibold mb-10">{page.title}</h1>
        {page.content && (
          <div className="prose prose-neutral max-w-none">
            {renderContent(page.content)}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: number; text: string }
  | { type: "faq"; items: Array<{ question: string; answer: string }> }
  | { type: "image"; url: string; alt?: string };

function renderContent(content: unknown): React.ReactNode {
  if (!Array.isArray(content)) return null;
  return (content as ContentBlock[]).map((block, i) => {
    switch (block.type) {
      case "paragraph":
        return <p key={i}>{block.text}</p>;
      case "heading":
        const Tag = `h${Math.min(Math.max(block.level, 2), 6)}` as
          | "h2"
          | "h3"
          | "h4"
          | "h5"
          | "h6";
        return <Tag key={i}>{block.text}</Tag>;
      case "faq":
        return (
          <div key={i} className="space-y-4 my-6">
            {block.items.map((item, j) => (
              <details key={j} className="border border-border p-4">
                <summary className="font-medium cursor-pointer">
                  {item.question}
                </summary>
                <p className="mt-3 text-text-muted">{item.answer}</p>
              </details>
            ))}
          </div>
        );
      case "image":
        return (
          <img key={i} src={block.url} alt={block.alt ?? ""} className="my-6" />
        );
      default:
        return null;
    }
  });
}

import Image from "next/image";
import Link from "next/link";

interface HeroProps {
  image: string | null;
  title: string;
  subtitle: string | null;
  ctaText: string;
  ctaLink: string;
}

export function Hero({ image, title, subtitle, ctaText, ctaLink }: HeroProps) {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {image && (
        <Image
          src={image}
          alt="Hero"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      )}
      <div
        className={`absolute inset-0 ${image ? "bg-black/40" : "bg-surface-alt"}`}
      />
      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto animate-slide-up">
        <h1
          className={`font-heading text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 ${image ? "text-white" : "text-text-base"}`}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={`text-lg mb-8 ${image ? "text-white/80" : "text-text-muted"}`}
          >
            {subtitle}
          </p>
        )}
        <Link
          href={ctaLink}
          className="inline-block bg-primary text-white px-10 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-primary-hover transition-colors"
        >
          {ctaText}
        </Link>
      </div>
    </section>
  );
}

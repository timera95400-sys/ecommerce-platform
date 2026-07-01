"use client";

export function NewsletterForm() {
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

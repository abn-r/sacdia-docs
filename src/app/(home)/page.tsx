import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center text-center px-4 py-16">
      <h1 className="text-4xl font-bold mb-4 text-fd-foreground">
        SACDIA Docs
      </h1>
      <p className="text-fd-muted-foreground text-lg mb-8 max-w-xl">
        Documentación del Sistema de Administración de Clubes de
        Conquistadores, Aventureros y Guías Mayores
      </p>
      <div className="flex gap-4">
        <Link
          href="/docs"
          className="rounded-lg bg-fd-primary px-6 py-3 text-fd-primary-foreground font-medium hover:opacity-90 transition-opacity"
        >
          Documentación
        </Link>
        <Link
          href="/dev"
          className="rounded-lg border border-fd-border px-6 py-3 text-fd-foreground font-medium hover:bg-fd-accent transition-colors"
        >
          Desarrollo
        </Link>
      </div>
    </main>
  );
}

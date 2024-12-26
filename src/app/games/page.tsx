export default function GamesPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Mini Games</h1>
        <p className="text-xl text-muted-foreground">
          A collection of fun browser-based games to play
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border p-6">
          <h2 className="text-2xl font-semibold mb-4">Coming Soon!</h2>
          <p className="text-muted-foreground">
            We&apos;re working on some exciting games. Check back soon!
          </p>
        </div>
      </div>
    </div>
  );
}

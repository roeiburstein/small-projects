import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 items-center justify-center max-w-5xl mx-auto">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to Mini Projects Hub</h1>
        <p className="text-xl text-muted-foreground">
          Explore a collection of interactive web experiments and games
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-8">
        <ProjectCard
          title="Mini Games"
          description="Play fun and engaging browser-based games"
          href="/games"
          icon="🎮"
        />
        <ProjectCard
          title="AI Chat"
          description="Have interesting conversations with AI"
          href="/chat"
          icon="🤖"
        />
        <ProjectCard
          title="Interactive Art"
          description="Create and explore digital art pieces"
          href="/art"
          icon="🎨"
        />
      </div>
    </div>
  );
}

function ProjectCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: string;
}) {
  return (
    <a
      href={href}
      className="group relative overflow-hidden rounded-lg border p-6 hover:border-foreground/50 transition-colors"
    >
      <div className="flex flex-col gap-2">
        <div className="text-2xl">{icon}</div>
        <h2 className="font-semibold text-xl">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <span className="absolute right-4 top-4 text-muted-foreground transition-transform group-hover:translate-x-1">
        →
      </span>
    </a>
  );
}

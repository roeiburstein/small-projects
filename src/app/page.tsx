import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col gap-16 items-center justify-center">
      <section className="relative w-full">
        <div className="absolute inset-0 gradient-bg opacity-50" />
        <div className="relative text-center space-y-6 max-w-3xl mx-auto py-20">
          <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">
            Welcome to Mini Projects Hub
          </h1>
          <p className="text-xl text-muted-foreground">
            Explore a collection of interactive web experiments and games
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl px-4">
        <ProjectCard
          title="Mini Games"
          description="Play fun and engaging browser-based games. Experience interactive entertainment right in your browser."
          href="/games"
          icon="🎮"
        />
        <ProjectCard
          title="AI Chat"
          description="Have interesting conversations with AI. Explore the possibilities of natural language interaction."
          href="/chat"
          icon="🤖"
        />
        <ProjectCard
          title="Interactive Art"
          description="Create and explore digital art pieces. Express yourself through dynamic, browser-based creative tools."
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
      className="group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm card-hover"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-3xl animate-float">{icon}</span>
          <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </div>
        <div>
          <h2 className="font-semibold text-xl">{title}</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </a>
  );
}

export default function ProjectsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="font-serif text-4xl font-bold mb-4">Proyectos</h1>
      <p className="text-lg text-gray-600">Aquí tienes algunos de mis proyectos.</p>
      <div className="mt-8 w-full max-w-2xl">
        <iframe className="rounded-xl" src="https://open.spotify.com/embed/album/22EdQ9kyo4tA0jVCpQ6hKG?utm_source=generator" width="100%" height="352" frameBorder="0" allowFullScreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
      </div>
    </div>
  );
}
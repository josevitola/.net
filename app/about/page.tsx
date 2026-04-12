import Image from "next/image";
import photoCrowd from "@/public/photo-crowd.jpg";

export default function AboutPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="font-serif text-4xl font-bold mb-4">Sobre mí</h1>
      <Image
        src={photoCrowd}
        alt="Foto de José Vitola"
        width={500}
        unoptimized
      />
      <p className="text-lg text-center max-w-2xl">
        ¡Hola! Soy José Vitola, un desarrollador web apasionado por crear experiencias digitales únicas. Con más de 10 años de experiencia en el desarrollo frontend, me especializo en tecnologías como React, Next.js y TypeScript. Me encanta combinar diseño y funcionalidad para construir sitios web atractivos y fáciles de usar. En mi tiempo libre, disfruto explorando nuevas tecnologías, contribuyendo a proyectos de código abierto y compartiendo mis conocimientos a través de charlas y talleres. ¡Gracias por visitar mi sitio!
      </p>
    </div>
  );
}
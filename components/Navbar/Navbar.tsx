import Image from "next/image";
import { IM_Fell_DW_Pica } from "next/font/google";

const imFellDWPica = IM_Fell_DW_Pica({
  subsets: ["latin"],
  weight: "400",
});

export function Navbar() {
  return (
    <nav className={`${imFellDWPica.className} w-full h-20 text-white flex items-center justify-between py-4 px-10`}>
      <a href="/">
        <Image
          className="dark:invert"
          src="/logo.svg"
          alt="Logo de josevitola.net"
          width={80}
          height={15}
          priority
        />
      </a>
      <div className="space-x-6">
        <a href="/" className="hover:text-gray-400">
          Inicio
        </a>
        <a href="/about" className="hover:text-gray-400">
          Acerca de
        </a>
        <a href="/projects" className="hover:text-gray-400">
          Proyectos
        </a>
        <a href="/contact" className="hover:text-gray-400">
          Contacto
        </a>
      </div>
    </nav>
  );
}
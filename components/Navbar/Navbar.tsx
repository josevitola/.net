'use client';

import Image from "next/image";
import { IM_Fell_DW_Pica } from "next/font/google";
import useGlobalContext from "@/hooks/client/useGlobalContext/useGlobalContext";

const imFellDWPica = IM_Fell_DW_Pica({
  subsets: ["latin"],
  weight: "400",
});

export function Navbar() {
  const { isEditing, handleSetEditing, isDev } = useGlobalContext();

  return (
    <nav className={`${imFellDWPica.className} w-full h-20 flex items-center justify-between py-4 px-10`}>
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
        <button className={`${isDev ? "inline-block" : "hidden"
          } font-serif h-6 justify-center gap-2 rounded-full bg-primary px-3 text-background transition-colors hover:bg-primary-active hover:text-primary-light hover:cursor-pointer`}
          onClick={handleSetEditing}
        >
          {isEditing ? "Previsualizar" : "Editar"}
        </button>
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
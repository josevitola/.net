'use client';

import Image from "next/image";
import { IM_Fell_DW_Pica } from "next/font/google";
import useGlobalContext from "@/hooks/client/useGlobalContext/useGlobalContext";
import { NAVBAR_ITEMS } from "./Navbar.constants";
import { Menu } from "lucide-react"

const imFellDWPica = IM_Fell_DW_Pica({
  subsets: ["latin"],
  weight: "400",
});

export function Navbar() {
  const { isEditing, isDev, handleSetEditing, onNavbarItemHover } = useGlobalContext();

  return (
    <nav className={`${imFellDWPica.className} w-full h-20 flex items-center justify-between py-4 px-6 md:px-10`}>
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
      <Menu className="md:hidden stroke-primary" size={24} />
      <div className="hidden md:flex flex-col md:flex-row space-x-6">
        <button className={`${isDev ? "inline-block" : "hidden"
          } font-serif h-6 justify-center gap-2 rounded-full bg-primary px-3 text-background transition-colors hover:bg-primary-active hover:text-primary-light hover:cursor-pointer`}
          onClick={handleSetEditing}
        >
          {isEditing ? "Previsualizar" : "Editar"}
        </button>
        {NAVBAR_ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="hover:text-gray-400"
            onMouseOver={onNavbarItemHover}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
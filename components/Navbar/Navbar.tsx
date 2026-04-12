'use client';

import Image from 'next/image';
import { NAVBAR_ITEMS } from './Navbar.constants';
import './Navbar.css';
import { IM_Fell_DW_Pica } from 'next/font/google';
import useGlobalContext from '@/hooks/client/useGlobalContext/useGlobalContext';

const imFellDWPica = IM_Fell_DW_Pica({
  subsets: ['latin'],
  weight: '400',
});

export const Navbar = () => {
  const { onNavbarItemHover } = useGlobalContext();

  return (
    <nav
      className={`${imFellDWPica.className} sticky top-0 flex h-20 w-full items-center justify-between px-6 py-4 md:px-10`}
    >
      <input type="checkbox" id="menu-toggle" className="hidden" />

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

      <label htmlFor="menu-toggle" className="flex cursor-pointer flex-col gap-1.25 md:hidden">
        <span className="bg-primary-active h-0.75 w-6.25"></span>
        <span className="bg-primary-active h-0.75 w-6.25"></span>
        <span className="bg-primary-active h-0.75 w-6.25"></span>
      </label>

      <ul className="nav-links absolute top-full left-0 hidden w-full flex-col text-center text-xl md:static md:flex md:w-auto md:flex-row md:gap-6 bg-[color-mix(in_srgb,var(--secondary-active),black_70%)] md:bg-transparent md:py-0 md:text-left md:text-base">
        {NAVBAR_ITEMS.map(({ label, key }) => (
          <li key={`navbar-item-${key}`} className="border-b-2 border-primary md:border-transparent py-4">
            <a href={key} onMouseEnter={onNavbarItemHover} className="w-full block md:w-auto md:inline">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

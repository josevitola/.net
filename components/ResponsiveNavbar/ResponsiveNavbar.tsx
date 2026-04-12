import Image from 'next/image';
import { NAVBAR_ITEMS } from './Navbar.constants';
import './ResponsiveNavbar.css';
import { IM_Fell_DW_Pica } from "next/font/google";

const imFellDWPica = IM_Fell_DW_Pica({
  subsets: ["latin"],
  weight: "400",
});

export const ResponsiveNavbar = () => {
  return <nav className={`${imFellDWPica.className} w-full h-20 flex items-center justify-between py-4 px-6 md:px-10`}>
    <input type="checkbox" id="menu-toggle" className="hidden" />

    <Image
      className="dark:invert"
      src="/logo.svg"
      alt="Logo de josevitola.net"
      width={80}
      height={15}
      priority
    />
    <label htmlFor="menu-toggle" className="hamburger">
      <span className="bg-primary"></span>
      <span className="bg-primary"></span>
      <span className="bg-primary"></span>
    </label>

    <ul className="nav-links">
      {NAVBAR_ITEMS.map(({ label, key }) => (
        <li key={`navbar-item-${key}`}><a href={key}>{label}</a></li>
      ))}
    </ul>
  </nav>
}
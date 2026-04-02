type ButtonProps = {
  href: string;
  children?: React.ReactNode;
}

export function Button({ href, children }: Readonly<ButtonProps>) {
  return (
    <a
      className={`font-serif flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-39.5`}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  )
}
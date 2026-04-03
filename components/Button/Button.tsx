type LinkButtonProps = React.HTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children?: React.ReactNode;
}

export function LinkButton({ href, children, className, ...props }: Readonly<LinkButtonProps>) {
  return (
    <a
      className={`font-serif flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-39.5 ${className ?? ""}`}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  )
}
type LinkButtonProps = React.HTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children?: React.ReactNode;
}

export function LinkButton({ href, children, className, ...props }: Readonly<LinkButtonProps>) {
  return (
    <a
      className={`font-serif flex h-12 w-96 items-center justify-center gap-2 rounded-full bg-primary px-5 transition-colors hover:bg-primary-active text-black! md:w-39.5 hover:text-primary-light! ${className ?? ""}`}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  )
}
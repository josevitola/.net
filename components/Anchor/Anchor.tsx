export function Anchor({ href, className, children }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a href={href} className={`text-primary hover:text-gray-400 ${className || ''}`}>
    {children}
  </a>
}
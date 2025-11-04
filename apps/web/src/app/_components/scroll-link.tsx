import Link from "next/link";

export default function ScrollLink({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <Link href={`#${id}`} passHref className={className}>
      <div onClick={handleClick}>{children}</div>
    </Link>
  );
}

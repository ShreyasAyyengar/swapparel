import { Button } from "@swapparel/shad-ui/components/button";
import { AnimatePresence, motion } from "framer-motion";
import { MenuIcon, XIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ScrollLink from "./scroll-link";

// const geistSans = Geist({
//   subsets: ["latin"],
// });

const logoVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, delay: 0.6 },
  },
};

const linkVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, delay: 0.6 },
  },
};

const navLinks = [
  { name: "Feed", href: "home" },
  // { name: "Pricing", href: "pricing" },
  // { name: "Team", href: "team" },
  { name: "Features", href: "features" },
  // { name: "Contact", href: "contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    window.scroll();
    const handleScroll = () => setIsScrolled(window.scrollY > 150);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      className={`fixed top-0 right-0 left-0 z-50 mx-auto flex w-full flex-col rounded-none px-8 py-5 backdrop-blur-xl [transition:border-color_1s_5s,box-shadow_1s_0s] md:my-5 md:rounded-full ${isScrolled ? "w-[48rem] border border-gray-500 shadow-2xl" : ""}
    `}
      initial={{ scaleX: 0, maxWidth: "80rem" }}
      animate={{
        scaleX: 1,
        // maxWidth: isScrolled ? "48rem" : "80rem", // TODO uncomment
        // top: isScrolled ? "0.5rem" : "0",
      }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{ transformOrigin: "center" }}
    >
      <div className="flex w-full items-center justify-between">
        <motion.div className="flex-shrink-0" variants={logoVariants} initial="hidden" animate="visible">
          <Image src="/simple-banner-slim.png" alt={""} width={200} height={100} />
        </motion.div>

        {/* Desktop Navigation */}
        <motion.ul
          className="hidden items-center gap-8 md:flex"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: { staggerChildren: 0.1, delayChildren: 0.8 },
            },
          }}
        >
          {navLinks.map((link) => (
            <motion.li key={link.name} variants={linkVariants}>
              <ScrollLink id={link.href} className="text-white/90 transition-colors hover:text-white">
                {link.name}
              </ScrollLink>
            </motion.li>
          ))}
          <motion.li variants={linkVariants}>
            <Button asChild variant="default" className="">
              <Link href="https://dash.carbon.host">Dashboard</Link>
            </Button>
          </motion.li>
        </motion.ul>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-md p-2 text-white">
            {mobileOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 overflow-hidden md:hidden"
          >
            <ul className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="block text-white/90 transition-colors hover:text-white" onClick={() => setMobileOpen(false)}>
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <Button asChild variant="default">
                  <Link href="https://dash.carbon.host" onClick={() => setMobileOpen(false)}>
                    Dashboard
                  </Link>
                </Button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

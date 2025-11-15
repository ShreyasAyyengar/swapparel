import { AnimatePresence, motion } from "framer-motion";
import { MenuIcon, XIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ScrollLink from "./scroll-link";
import SignInOutButton from "./sign-in-out-button";

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
  // TODO populate more
  { name: "About", href: "/legal/terms" },
  { name: "Feed", href: "feed" },
  { name: "Features", href: "features" },
];

export default function Navbar() {
  const SCROLL_THRESHOLD = 150;
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const animationClass = isScrolled
    ? "[transition:top_0.2s,border_0.5s,box-shadow_0.5s,max-width_0.5s_0.1s]"
    : "[transition:top_0.2s_0.2s,border_0.5s,box-shadow_0.5s,max-width_0.5s]"; // "just multiply by -1" astaghfirullah

  return (
    <motion.nav
      className={`fixed top-0 right-0 left-0 z-50 mx-auto flex flex-col rounded-none px-8 py-5 ${animationClass} md:my-5 md:rounded-full ${isScrolled ? "top-5 max-w-[52rem] border border-white/20 shadow-2xl backdrop-blur-xl" : "max-w-[80rem]"}
    `}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{ transformOrigin: "center" }}
    >
      <div className="flex w-full items-center justify-between">
        {/* LEFT: Swapparel Banner*/}
        <motion.div
          className={`${isScrolled ? "w-[170px]" : "w-[200px]"} flex-shrink-0 [transition:width_0.3s_ease-in-out]`}
          variants={logoVariants}
          initial="hidden"
          animate="visible"
        >
          <Image src="/simple-banner-slim.png" alt={""} width={10_000_000} height={10} />
        </motion.div>

        {/* CENTRE: Desktop Navigation */}
        <motion.ul
          className="-translate-x-1/2 absolute left-1/2 hidden transform items-center gap-8 md:flex"
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
              <ScrollLink id={link.href} className="text-primary transition-all duration-300 ease-in-out hover:text-primary hover:underline">
                {link.name}
              </ScrollLink>
            </motion.li>
          ))}
        </motion.ul>

        <motion.div className="hidden md:block" initial="hidden" animate="visible" variants={linkVariants}>
          <SignInOutButton />
        </motion.div>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button type="button" onClick={() => setMobileOpen(!mobileOpen)} className="rounded-md p-2 text-white">
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
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

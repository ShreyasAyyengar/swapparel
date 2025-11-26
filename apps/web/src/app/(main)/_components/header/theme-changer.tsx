"use client";

import { MonitorCog, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeChanger() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (theme === "system")
    return (
      <MonitorCog
        width={37.5}
        height={37.5}
        className={
          "text-background duration-100 ease-in hover:scale-110 hover:cursor-pointer hover:text-primary-foreground dark:hover:text-primary"
        }
        onClick={() => setTheme("light")}
      />
    );
  if (theme === "dark")
    return (
      <Moon
        width={37.5}
        height={37.5}
        className={
          "text-background duration-100 ease-in hover:scale-110 hover:cursor-pointer hover:text-primary-foreground dark:hover:text-primary"
        }
        onClick={() => setTheme("system")}
      />
    );
  if (theme === "light")
    return (
      <Sun
        width={37.5}
        height={37.5}
        className={
          "text-background duration-100 ease-in hover:scale-110 hover:cursor-pointer hover:text-primary-foreground dark:hover:text-primary"
        }
        onClick={() => setTheme("dark")}
      />
    );
}

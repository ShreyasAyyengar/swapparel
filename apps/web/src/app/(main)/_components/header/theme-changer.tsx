"use client";

import { MonitorCog, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeChanger() {
  const { resolvedTheme, setTheme } = useTheme();

  console.log("resolvedTheme:", resolvedTheme);

  if (resolvedTheme === "system")
    return (
      <MonitorCog
        width={37.5}
        height={37.5}
        className={
          "text-background duration-100 ease-in hover:scale-110 hover:cursor-pointer hover:text-primary-foreground dark:hover:text-primary"
        }
        onClick={() => setTheme("dark")}
      />
    );
  if (resolvedTheme === "dark")
    return (
      <Moon
        width={37.5}
        height={37.5}
        className={
          "text-background duration-100 ease-in hover:scale-110 hover:cursor-pointer hover:text-primary-foreground dark:hover:text-primary"
        }
        onClick={() => setTheme("light")}
      />
    );
  return (
    <Sun
      width={37.5}
      height={37.5}
      className={
        "text-background duration-100 ease-in hover:scale-110 hover:cursor-pointer hover:text-primary-foreground dark:hover:text-primary"
      }
      onClick={() => setTheme("system")}
    />
  );
}

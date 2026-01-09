import {User} from "lucide-react";
import {useEffect, useState} from "react";

export default function NoProfile() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div
        className={`mt-5 grid grid-cols-1 items-center justify-center overflow-hidden rounded-full border border-secondary bg-primary p-5 px-10 text-foreground transition-[width] duration-700 ease-out ${mounted ? "w-1/2" : "w-0"} md:grid-cols-2 md:justify-between md:justify-items-stretch`}
      >
        {mounted && (
          <>
            <div className="mb-5 flex h-25 w-25 items-center justify-center overflow-hidden rounded-full border border-secondary bg-accent md:mr-10 md:mb-0">
              <User className={"h-15 w-15"} />
            </div>
            <p className="text-center font-bold text-2xl md:text-end">No Profile</p>
          </>
        )}
      </div>
    </div>
  );
}

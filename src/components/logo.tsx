import Image from "next/image";
import { cn } from "@/lib/cn";

type LogoProps = {
  direction?: "horizontal" | "vertical";
  width?: number;
  zapVariant?: "dark" | "white";
  className?: string;
};

export function Logo({
  direction = "vertical",
  width = 80,
  zapVariant = "dark",
  className,
}: LogoProps) {
  const fontSize = Math.round(width * 0.3);

  return (
    <div
      className={cn(
        "flex items-center",
        { "flex-col gap-(--spacing-sm)": direction === "vertical" },
        { "flex-row gap-(--spacing-md)": direction === "horizontal" },
        className,
      )}
    >
      <Image
        src="/logo.webp"
        alt="ZapFome"
        width={width}
        height={width}
        priority
        className="rounded-xl shadow-brand-glow"
      />

      <p
        className="font-extrabold tracking-tight"
        style={{ fontSize }}
      >
        <span
          className={cn({
            "text-font-primary": zapVariant === "dark",
            "text-font-white": zapVariant === "white",
          })}
        >
          Zap
        </span>
        <span className="text-brand-primary">Fome</span>
      </p>
    </div>
  );
}

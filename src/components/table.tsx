import type {
  HTMLAttributes,
  ReactNode,
  TableHTMLAttributes,
  ThHTMLAttributes,
  TdHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

export function Table({
  className,
  children,
  ...rest
}: TableHTMLAttributes<HTMLTableElement> & { children?: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-bg-card shadow-soft">
      <table
        className={cn("w-full border-collapse text-sm text-font-primary", className)}
        {...rest}
      >
        {children}
      </table>
    </div>
  );
}

export function THead({ className, children, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn("bg-bg-secondary", className)} {...rest}>
      {children}
    </thead>
  );
}

export function TBody({ className, children, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn("divide-y divide-border-light", className)} {...rest}>
      {children}
    </tbody>
  );
}

export type TRProps = HTMLAttributes<HTMLTableRowElement> & {
  interactive?: boolean;
};

export function TR({ className, interactive, children, ...rest }: TRProps) {
  return (
    <tr
      className={cn(
        "transition-colors",
        interactive && "cursor-pointer hover:bg-bg-hover",
        className,
      )}
      {...rest}
    >
      {children}
    </tr>
  );
}

export type CellAlign = "left" | "center" | "right";

const alignClasses: Record<CellAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export type THProps = ThHTMLAttributes<HTMLTableCellElement> & {
  align?: CellAlign;
};

export function TH({ className, align = "left", children, ...rest }: THProps) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-font-secondary border-b border-border",
        alignClasses[align],
        className,
      )}
      {...rest}
    >
      {children}
    </th>
  );
}

export type TDProps = TdHTMLAttributes<HTMLTableCellElement> & {
  align?: CellAlign;
};

export function TD({ className, align = "left", children, ...rest }: TDProps) {
  return (
    <td
      className={cn("px-4 py-3 text-sm text-font-primary", alignClasses[align], className)}
      {...rest}
    >
      {children}
    </td>
  );
}

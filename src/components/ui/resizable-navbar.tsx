"use client";
import { cn } from "@/lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import Link from "next/link";
import React, { useRef, useState } from "react";

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

export interface NavItemSpec {
  name: string;
  link: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

interface NavItemsProps {
  items: NavItemSpec[];
  activeHref?: string;
  className?: string;
  onItemClick?: () => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose?: () => void;
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 40) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  return (
    <motion.div
      ref={ref}
      className={cn("fixed inset-x-0 top-0 z-50 w-full pt-3 px-4", className)}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible },
            )
          : child,
      )}
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(12px)" : "blur(8px)",
        boxShadow: visible
          ? "0 4px 20px -2px oklch(0 0 0 / 0.08), 0 0 0 1px var(--border)"
          : "0 1px 3px 0 oklch(0 0 0 / 0.04), 0 0 0 1px var(--border)",
        width: visible ? "75%" : "100%",
        y: visible ? 6 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 220,
        damping: 35,
      }}
      style={{
        minWidth: "320px",
      }}
      className={cn(
        "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between rounded-full bg-background/80 px-5 py-2.5 backdrop-blur-md lg:flex border border-border/80 text-foreground transition-colors",
        visible && "bg-background/95 border-border shadow-sm",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({ items, activeHref, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "relative flex flex-1 flex-row items-center justify-center space-x-1 text-sm font-medium text-muted-foreground lg:flex",
        className,
      )}
    >
      {items.map((item, idx) => {
        const isActive = activeHref === item.link;
        const Icon = item.icon;
        return (
          <Link
            key={`link-${idx}`}
            href={item.link}
            onMouseEnter={() => setHovered(idx)}
            onClick={onItemClick}
            className={cn(
              "relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors duration-150",
              isActive
                ? "bg-primary/10 text-primary font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {hovered === idx && !isActive && (
              <motion.div
                layoutId="hovered"
                className="absolute inset-0 h-full w-full rounded-full bg-muted/70"
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            )}
            {Icon && <Icon size={14} className="relative z-20" />}
            <span className="relative z-20">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(12px)" : "blur(8px)",
        boxShadow: visible
          ? "0 4px 20px -2px oklch(0 0 0 / 0.08), 0 0 0 1px var(--border)"
          : "0 1px 3px 0 oklch(0 0 0 / 0.04), 0 0 0 1px var(--border)",
        width: visible ? "94%" : "100%",
        borderRadius: visible ? "1.25rem" : "1rem",
        y: visible ? 6 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 220,
        damping: 35,
      }}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-full flex-col items-center justify-between bg-background/90 px-4 py-2.5 backdrop-blur-md border border-border/80 text-foreground lg:hidden shadow-xs",
        visible && "bg-background/95 border-border",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
}: MobileNavHeaderProps) => {
  return (
    <div
      className={cn(
        "flex w-full flex-row items-center justify-between text-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
}: MobileNavMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "absolute inset-x-0 top-full mt-2 z-50 flex w-full flex-col items-start justify-start gap-3 rounded-2xl bg-card p-5 text-card-foreground shadow-xl border border-border",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      aria-label="Toggle Navigation Menu"
      className="p-1.5 text-foreground hover:text-primary transition-colors focus:outline-none rounded-md"
    >
      {isOpen ? <IconX size={20} /> : <IconMenu2 size={20} />}
    </button>
  );
};

export const NavbarLogo = ({
  href = "/",
  children,
}: {
  href?: string;
  children?: React.ReactNode;
}) => {
  return (
    <Link
      href={href}
      className="relative z-20 flex items-center gap-2 shrink-0 group hover:opacity-90 transition-opacity"
    >
      {children || (
        <>
          <img
            src="/logiq-logo.png"
            alt="LogiQ logo"
            width={40}
            height={40}
            style={{ width: 40, height: 40, objectFit: "contain" }}
          />
          <span className="font-extrabold text-foreground text-xl tracking-tight">LogiQ</span>
        </>
      )}
    </Link>
  );
};

export const NavbarButton = ({
  href,
  as: Tag = "a",
  children,
  className,
  variant = "primary",
  ...props
}: {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient" | "outline";
} & (
  | React.ComponentPropsWithoutRef<"a">
  | React.ComponentPropsWithoutRef<"button">
)) => {
  const baseStyles =
    "px-3.5 py-1.5 rounded-lg text-xs font-semibold relative cursor-pointer hover:-translate-y-0.5 transition duration-150 inline-flex items-center justify-center gap-1.5 text-center";

  const variantStyles = {
    primary: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    dark: "bg-foreground text-background shadow-xs hover:bg-foreground/90",
    gradient: "bg-gradient-to-r from-primary to-violet-600 text-primary-foreground shadow-xs hover:opacity-95",
    outline: "border border-border text-foreground hover:bg-muted/50",
  };

  if (href) {
    return (
      <Link
        href={href}
        className={cn(baseStyles, variantStyles[variant], className)}
        {...props as any}
      >
        {children}
      </Link>
    );
  }

  return (
    <Tag
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </Tag>
  );
};


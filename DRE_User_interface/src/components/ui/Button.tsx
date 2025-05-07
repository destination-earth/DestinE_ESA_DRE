import { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  ["rounded px-3 py-1 inline-flex font-bold items-center justify-center"],
  {
    variants: {
      variant: {
        fill: ["bg-theme-500 text-white"],
        outline: ["border border-theme-500 text-theme-500"],
        ghost: ["text-theme-500 hover:bg-gray-100"],
      },
      size: {
        sm: [""],
        md: [""],
        lg: [""],
      },
      icon: {
        none: [""],
        icon: ["aspect-square"],
      },
    },
    compoundVariants: [
      { icon: "icon", size: "sm", class: "w-10" },
      { icon: "icon", size: "md", class: "w-11" },
      { icon: "icon", size: "lg", class: "w-12" },
    ],
    defaultVariants: {
      icon: "none",
      variant: "fill",
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = ({
  size,
  variant,
  icon,
  className,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      {...props}
      className={buttonVariants({ variant, size, icon, className })}
    >
      {children}
    </button>
  );
};

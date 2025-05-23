import { cn } from "@/libraries/utils";
import React, { ReactElement } from "react";

interface BaseButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "gray" | "primary" | "rounded";
  prefixIcon?: ReactElement<any>;
  suffixIcon?: ReactElement<any>;
  isLoading?: boolean;
  fullWidth?: boolean;
  size?: "long" | "short";
}

const BaseButton = React.forwardRef<HTMLButtonElement, BaseButtonProps>(
  (
    {
      children,
      className,
      variant = "gray",
      prefixIcon,
      suffixIcon,
      isLoading,
      size = "long",
      disabled,
      ...props
    },
    ref,
  ) => {
    const variants = {
      gray: {
        long: "gb__white__btn__long bg-white/[6%] hover:bg-white/[16%] focus:bg-white/[16%] disabled:bg-white/[4%] py-1.5 text-fontColorPrimary disabled:brightness-75",
        short:
          "gb__white__btn bg-white/[6%] hover:bg-white/[16%] focus:bg-white/[16%] disabled:bg-white/[4%] aspect-square text-fontColorPrimary disabled:brightness-75",
      },
      primary: {
        long: "gb__primary__btn bg-primary hover:bg-primary-hover focus:bg-primary-hover disabled:bg-primary-disable py-1.5 text-[#080811]",
        short:
          "gb__primary__btn__long bg-primary hover:bg-primary-hover focus:bg-primary-hover disabled:bg-primary-disable aspect-square text-[#080811]",
      },
      rounded: {
        long: "border border-[#242436] rounded-full bg-white/[4%] hover:bg-primary/[8%] hover:border-primary disabled:bg-white/[5%] disabled:border-white/[2%] py-1.5 focus:border-white/[5%] focus:bg-primary/[8%] border-solid hover:text-primary text-fontColorPrimary",
        short:
          "border border-[#242436] rounded-full bg-white/[4%] hover:bg-primary/[8%] hover:border-primary disabled:bg-white/[5%] disabled:border-white/[2%] aspect-square focus:border-white/[5%] focus:bg-primary/[8%] border-solid hover:text-primary text-fontColorPrimary",
      },
    };

    return (
      <button
        ref={ref}
        className={cn(
          "group/button no-border relative inline-flex flex-shrink-0 items-center justify-center gap-x-2 rounded-[8px] border-dashed border-transparent font-geistSemiBold font-medium transition-all duration-300 ease-out focus:border-white disabled:cursor-not-allowed",
          size == "long" && prefixIcon && suffixIcon
            ? "px-3"
            : size == "long" && prefixIcon
              ? "pl-3 pr-4"
              : size == "long" && prefixIcon
                ? "pl-4 pr-3"
                : "px-3",
          variants[variant][size],
          className,
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {prefixIcon}
        {children}
        {suffixIcon}
      </button>
    );
  },
);

BaseButton.displayName = "BaseButton";

export default BaseButton;

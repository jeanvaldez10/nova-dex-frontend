import BaseButton from "@/components/customs/buttons/BaseButton";
import { cn } from "@/libraries/utils";
import Image from "next/image";

// Add Twitter ✖️
export const AddTwitterButton = ({
  isFullscreen = false,
}: {
  isFullscreen?: boolean;
}) => {
  return (
    <>
      <BaseButton
        variant="primary"
        className={cn(
          "flex-grow pl-4 max-md:w-full max-md:pr-5 md:pl-2",
          isFullscreen ? "h-10 w-full" : "h-8 w-full",
        )}
        prefixIcon={
          <div
            className={cn(
              "relative aspect-square flex-shrink-0",
              isFullscreen ? "size-5" : "size-4",
            )}
          >
            <Image
              src="/icons/add.png"
              alt="Add Icon"
              fill
              quality={100}
              className="object-contain duration-300"
            />
          </div>
        }
      >
        <span
          className={cn(
            "inline-block whitespace-nowrap text-[#080811]",
            isFullscreen
              ? "font-geistSemiBold text-base"
              : "font-geistSemiBold text-sm",
          )}
        >
          Add Twitter
        </span>
      </BaseButton>
    </>
  );
};

AddTwitterButton.displayName = "AddTwitterButton";

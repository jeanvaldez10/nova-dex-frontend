"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import emojiRegex from "emoji-regex";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";
import { cn } from "@/libraries/utils";
import CustomToast from "./toasts/CustomToast";
import dynamic from "next/dynamic";
const Picker = dynamic(() => import("@/components/customs/EmojiPickerJS"));

const normalizeEmoji = (emoji: string) => {
  // @ts-ignore
  return [...emoji]
    .map((char) => String.fromCodePoint(char.codePointAt(0)!))
    .join("");
};

const SelectEmoji = ({
  alreadySelectedList,
  value,
  onChange,
}: {
  alreadySelectedList?: string[];
  value?: string;
  onChange?: (value: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleEmojiSelect = (emoji: string) => {
    const normalizedEmoji = normalizeEmoji(emoji);

    if (
      alreadySelectedList?.some((e) => normalizeEmoji(e) === normalizedEmoji)
    ) {
      // toast.custom((t: any)=> (
      //   <CustomToast
      //     tVisibleState={t.visible}
      //     message={`${normalizedEmoji} emoji already selected!`}
      //     state="ERROR"
      //   />
      // ));
      // return;
    }

    onChange?.(emoji);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="flex h-8 items-center justify-center rounded-[8px] border border-border pl-2 pr-1">
          {value ? (
            <span className="text-lg">{value}</span>
          ) : (
            <div className="relative mx-0.5 aspect-square h-4 w-4 flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Nova Logo"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
          )}
          <div className="relative aspect-square h-6 w-6 flex-shrink-0 duration-200">
            <Image
              src="/icons/pink-chevron-down.png"
              alt="Pink Chevron Down Icon"
              fill
              quality={100}
              className={cn(
                "object-contain transition-transform",
                isOpen ? "rotate-180" : "rotate-0",
              )}
            />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="z-[1000] w-full p-0" align="start">
        <Picker onEmojiSelect={handleEmojiSelect} />
      </PopoverContent>
    </Popover>
  );
};
export default SelectEmoji;

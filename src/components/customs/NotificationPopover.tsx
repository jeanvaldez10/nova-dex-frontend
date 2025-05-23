"use client";
import React, { useState, useEffect } from "react";
import BaseButton from "./buttons/BaseButton";
import Image from "next/image";
import { MdNotificationsNone } from "react-icons/md";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useNotificationToggleStore } from "@/stores/notifications/use-notification-toggle.store";

const NotificationPopover = ({ isMobile = false }: { isMobile?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Use the dedicated notification toggle store
  const isMuted = useNotificationToggleStore((state) => state.isMuted);
  const toggleMute = useNotificationToggleStore((state) => state.toggleMute);

  // showImageIcon is the opposite of isMuted (show bell icon when not muted)
  const [showImageIcon, setShowImageIcon] = useState(!isMuted);

  useEffect(() => {
    // Update icon when mute state changes
    setShowImageIcon(!isMuted);
  }, [isMuted]);

  const handleToggle = () => {
    toggleMute();
    setIsOpen(false);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <BaseButton
            onClick={handleToggle}
            variant="gray"
            className="relative size-8"
            size="short"
          >
            <div className="relative aspect-square h-4 w-4 flex-shrink-0">
              {showImageIcon ? (
                <Image
                  src="/icons/notification.svg"
                  alt="Notification Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              ) : (
                <MdNotificationsNone className="h-full w-full" />
              )}
              {/* <div className="absolute -right-2 -top-2 flex items-center justify-center rounded-full bg-[#FF407D] px-1 text-[8px] font-semibold text-white">
                99+
              </div> */}
            </div>
          </BaseButton>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isMuted ? "Notification Unmuted" : "Notification Muted"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default React.memo(NotificationPopover);

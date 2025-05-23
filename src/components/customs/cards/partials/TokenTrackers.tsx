"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useCallback, useMemo, useState } from "react";
// ######## Components 🧩 ########
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// ######## Utils & Helpers 🤝 ########
import { TrackedWallet } from "@/apis/rest/wallet-tracker";
import { truncateString } from "@/utils/truncateString";
import AddressWithEmojis from "@/components/customs/AddressWithEmojis";
import { useWalletTrackerStore } from "@/stores/footer/use-wallet-tracker";
import { useWalletTrackerMessageStore } from "@/stores/footer/use-wallet-tracker-message.store";
import { cn } from "@/libraries/utils";

const TokenTrackers = React.memo(
  ({ 
    mint,
    valueColor,
    customClassName,
    customClassIcon 
  }: { 
    mint: string;
    valueColor: string;
    customClassName?: string;
    customClassIcon?: string; 
  }) => {

    const tracker = useWalletTrackerMessageStore((state) => state.messages);
    const trackedWallets = useWalletTrackerStore(
      (state) => state.trackedWallets,
    );
    const trackers = useMemo(
          () => {
            if (
              !mint ||
              !tracker ||
              !trackedWallets ||
              !trackedWallets.length
            )
              return [];
    
            // Filter transactions for this token mint
            const tokenTransactions = Array.isArray(tracker)
              ? tracker.filter((tx) => tx.mint === mint && tx.type === "buy")
              : [];
    
            // Get unique wallet addresses who bought this token
            // Using Array.from instead of spread operator to avoid TypeScript issues
            const buyerAddressesSet = new Set(
              tokenTransactions.map((tx) => tx.walletAddress),
            );
            const buyerAddresses = Array.from(buyerAddressesSet);
    
            // Match with our tracked wallets
            return trackedWallets.filter((wallet) =>
              buyerAddresses.includes(wallet.address),
            );
          },
          [tracker, trackedWallets],
    );

    if (trackers.length <= 0) return null;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div
              className={cn("flex items-center justify-center gap-x-[2px] group/tracker",customClassIcon)}
            >
              <div className="relative aspect-square size-4 flex-shrink-0">
                  <Image
                    src="/icons/wallet.svg"
                    alt={`Wallet Icon`}
                    fill
                    quality={100}
                    className="object-contain hover:text-primary absolute group-hover/tracker:opacity-0 opacity-100"
                  />
                  <Image
                    src="/icons/wallet.png"
                    alt={`Wallet pink Icon`}
                    fill
                    quality={100}
                    className="object-contain hover:text-primary absolute group-hover/tracker:opacity-100 opacity-0"
                  />
              </div>
              <span
                className={cn(
                  "font-geistSemiBold text-xs text-fontColorPrimary",
                  customClassName,
                  valueColor,
                )}
              >
                {trackers.length}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent
            className="gb__white__popover flex min-w-[120px] flex-col gap-y-1 rounded-[8px] border bg-[#080811] p-3"
            side="bottom"
            showTriangle={false}
          >
            {trackers.map((item) => (
              <div className="flex" key={item.address}>
                <AddressWithEmojis
                  address={truncateString(item?.name || "", 14)}
                  fullAddress={item?.address}
                  className="!font-geistRegular text-sm text-[#DF74FF]"
                  emojis={[]}
                  trackedWalletIcon={item?.emoji}
                  stripClassname="hidden"
                  isWithLink
                />
              </div>
            ))}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);
TokenTrackers.displayName = "TokenTrackers";
export default TokenTrackers;

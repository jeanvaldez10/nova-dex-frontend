"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState } from "react";
import { useHoldingsMessageStore } from "@/stores/holdings/use-holdings-messages.store";
import axios from "axios";
// ######## Components 🧩 ########
import Image from "next/image";
import BaseButton from "@/components/customs/buttons/BaseButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SellForm from "@/components/customs/forms/token/SellForm";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { getBaseURLBasedOnRegion } from "../../../utils/getBaseURLBasedOnRegion";
//  ######## Types 🗨️ ########
import { HoldingsConvertedMessageType } from "@/types/ws-general";
import { TokenDataMessageType } from "@/types/ws-general";

export default function SellHolding({
  mint,
  remainingSol,
  holdingsMessages,
}: {
  mint?: string;
  remainingSol: number;
  holdingsMessages: HoldingsConvertedMessageType[];
}) {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const handleCustomOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (remainingSol > 0) {
      setOpenDialog(true);
      fetchTokenData();
    }
  };

  const fetchTokenData = async () => {
    const sanitizedMint =
      mint && mint.startsWith("/token/") ? mint.slice(7) : mint;

    const { data } = await axios.get<
      TokenDataMessageType | { success: boolean; message: string }
    >(
      getBaseURLBasedOnRegion(
        `/charts?mint=${sanitizedMint}&from_holdings=true`,
      ),
    );

    if (data) {
      // console.log(`HOLDINGS MINT ✨ - ${mint}`, data);
    }
  };
  const holdingTokens = holdingsMessages.flatMap((holding) => holding.tokens);

  const solPrice =
    holdingTokens.find((holding) => holding.token.mint === mint)?.price
      .price_sol ?? 0;
  // console.log("testingggggg amount", amountInputSol)
  console.log("testingggggg sol", solPrice);

  return (
    <Dialog
      defaultOpen={openDialog}
      open={openDialog}
      onOpenChange={(isOpen) => {
        setOpenDialog(isOpen);
      }}
    >
      <DialogTrigger asChild>
        <div>
          <BaseButton
            variant="gray"
            onClick={(e) => {
              handleCustomOpen(e);
            }}
            disabled={remainingSol === 0}
            className={cn("flex disabled:cursor-not-allowed")}
            prefixIcon={
              <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0">
                <Image
                  src="/icons/token/actions/sell.png"
                  alt="Share Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
            }
          >
            <span className="relative z-30 font-geistSemiBold text-sm text-fontColorPrimary">
              {remainingSol === 0 ? "Sold" : "Sell"}
            </span>
          </BaseButton>
        </div>
      </DialogTrigger>
      <DialogContent
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="flex h-auto w-full max-w-[360px] flex-col gap-y-0 rounded-[8px] border border-border bg-card"
      >
        <DialogHeader className="flex h-[56px] flex-row items-center border-b border-border p-4">
          <DialogTitle className="text-lg">Sell</DialogTitle>
        </DialogHeader>
        <SellForm
          holdingsMessages={holdingsMessages}
          mint={mint}
          type="holding"
          solPrice={solPrice}
        />
      </DialogContent>
    </Dialog>
  );
}

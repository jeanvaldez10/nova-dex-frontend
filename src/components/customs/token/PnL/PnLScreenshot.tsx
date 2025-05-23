"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useState } from "react";
// ######## Components 🧩 ########
import Image from "next/image";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import PnLTrigger from "@/components/customs/token/PnL/PnLTrigger";
import PnLContent from "@/components/customs/token/PnL/PnLContent";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AnimationControls } from "framer-motion";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { Wallet } from "@/apis/rest/wallet-manager";
import { cn } from "@/libraries/utils";
import { VolumeInfo } from "@/types/ws-general";

const PnLScreenshot = ({
  mint,
  profitAndLoss,
  profitAndLossPercentage,
  invested,
  sold,
  handleReload,
  isLoading,
  controls,
  isWithDialog,
  trigger,
  solPrice,
  wallets,
  setWallets,
  title,
  sheetsTriggerClassname,
  image,
  type,
  remaining,
}: {
  mint?: string;
  profitAndLoss: string | number;
  profitAndLossPercentage: string | number;
  invested: string | number;
  sold: string | number;
  handleReload?: () => void;
  isLoading?: boolean;
  controls?: AnimationControls;
  isWithDialog?: boolean;
  trigger?: React.ReactNode;
  solPrice: number;
  wallets?: Wallet[];
  setWallets?: (wallets: Wallet[]) => void;
  title: string;
  sheetsTriggerClassname?: string;
  image?: string;
  type?: string;
  remaining: string | number;
}) => {
  const [isOpenSheet, setIsOpenSheet] = useState(false);

  return (
    <>
      {isWithDialog ? (
        <Dialog>
          <DialogTrigger
            asChild
            className="h-full w-full flex-grow cursor-pointer max-md:hidden"
          >
            <div className="relative w-fit">
              {!!trigger ? (
                trigger
              ) : (
                <PnLTrigger
                  profitAndLoss={profitAndLoss}
                  profitAndLossPercentage={profitAndLossPercentage}
                  controls={controls}
                  handleReload={handleReload}
                  isLoading={isLoading}
                />
              )}
            </div>
          </DialogTrigger>
          <DialogContent
            showCloseButton={false}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="flex w-full max-w-xs flex-col gap-y-0 rounded-[8px] border border-border bg-card p-0 shadow-[0_0_20px_0_#000000] md:max-w-screen-sm lg:max-w-screen-md xl:max-w-screen-lg"
          >
            <PnLContent
              title={title}
              wallets={wallets}
              setWallets={setWallets}
              mint={mint}
              solPrice={solPrice}
              scrollable={true}
              profitAndLoss={profitAndLoss}
              profitAndLossPercentage={profitAndLossPercentage}
              invested={invested}
              sold={sold}
              image={image}
              type={type}
              remaining={remaining}
              closeElement={
                <DialogClose className="flex size-6 cursor-pointer items-center justify-center text-fontColorSecondary">
                  <div
                    className="relative aspect-square size-6 flex-shrink-0"
                    aria-label="Close"
                  >
                    <Image
                      src="/icons/close.png"
                      alt="Close Icon"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>
                </DialogClose>
              }
            />
          </DialogContent>
        </Dialog>
      ) : (
        <Popover>
          <PopoverTrigger
            asChild
            className="h-full w-full cursor-pointer max-md:hidden"
          >
            <div className="relative w-fit">
              {!!trigger ? (
                trigger
              ) : (
                <PnLTrigger
                  profitAndLoss={profitAndLoss}
                  profitAndLossPercentage={profitAndLossPercentage}
                  controls={controls}
                  handleReload={handleReload}
                  isLoading={isLoading}
                />
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            align="start"
            sideOffset={6}
            className="relative z-[1000] flex w-full flex-col rounded-[8px] border-2 border-border bg-card p-0 shadow-[0_0_20px_0_#000000] md:max-w-screen-sm lg:w-[640px] lg:max-w-screen-md xl:w-[768px]"
          >
            <PnLContent
              title={title}
              wallets={wallets}
              setWallets={setWallets}
              mint={mint}
              solPrice={solPrice}
              profitAndLoss={profitAndLoss}
              scrollable={true}
              profitAndLossPercentage={profitAndLossPercentage}
              invested={invested}
              sold={sold}
              image={image}
              type={type}
              remaining={remaining}
              closeElement={
                <PopoverClose className="flex h-6 w-6 cursor-pointer items-center justify-center text-fontColorSecondary">
                  <div
                    className="relative aspect-square h-6 w-6 flex-shrink-0"
                    aria-label="Close"
                  >
                    <Image
                      src="/icons/close.png"
                      alt="Close Icon"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>
                </PopoverClose>
              }
            />
          </PopoverContent>
        </Popover>
      )}
      <Sheet open={isOpenSheet} onOpenChange={setIsOpenSheet}>
        <SheetTrigger
          asChild
          onClick={(e) => {
            e.stopPropagation();
            setIsOpenSheet(!isOpenSheet);
          }}
        >
          <div
            className={cn(
              "h-full w-full flex-grow cursor-pointer md:hidden",
              sheetsTriggerClassname,
            )}
          >
            {!!trigger ? (
              trigger
            ) : (
              <PnLTrigger
                profitAndLoss={profitAndLoss}
                profitAndLossPercentage={profitAndLossPercentage}
                controls={controls}
                handleReload={handleReload}
                isLoading={isLoading}
              />
            )}
          </div>
        </SheetTrigger>
        <SheetContent
          className="bottom-[40px] flex h-[87dvh] flex-col gap-y-0 border-0 bg-card p-0"
          side={"bottom"}
          withClose={false}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <PnLContent
            title={title}
            wallets={wallets}
            setWallets={setWallets}
            mint={mint}
            solPrice={solPrice}
            profitAndLoss={profitAndLoss}
            profitAndLossPercentage={profitAndLossPercentage}
            invested={invested}
            sold={sold}
            scrollable
            image={image}
            type={type}
            remaining={remaining}
            closeElement={
              <div
                className="flex h-6 w-6 flex-shrink-0 cursor-pointer items-center justify-center bg-transparent text-transparent"
                onClick={() => setIsOpenSheet(false)}
              >
                <div
                  className="relative aspect-square h-6 w-6 flex-shrink-0"
                  aria-label="Close"
                  title="Close"
                >
                  <Image
                    src="/icons/close.png"
                    alt="Close Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
              </div>
            }
          />
        </SheetContent>
      </Sheet>
    </>
  );
};

export default React.memo(PnLScreenshot);

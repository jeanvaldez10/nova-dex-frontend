import { useState, useEffect, type JSX } from "react";
import { useWalletTrackerMessageStore } from "@/stores/footer/use-wallet-tracker-message.store";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import {
  TrackedWallet,
  updateTrackedWallets,
} from "@/apis/rest/wallet-tracker";
import { Textarea } from "@/components/ui/textarea";
import BaseButton from "@/components/customs/buttons/BaseButton";
import CustomToast from "@/components/customs/toasts/CustomToast";
import toast from "react-hot-toast";
import Image from "next/image";
import { cn } from "@/libraries/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { X } from "lucide-react";
import { isValidSolanaAddress } from "@/utils/walletValidation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWindowSizeStore } from "@/stores/use-window-size.store";

interface ImportedWallet {
  name: string;
  address?: string;
  trackedWalletAddress?: string;
  emoji: string;
  tags?: string[];
}

// Content component that can be used in both Dialog and Popover
export const ImportWalletContent = ({
  closeElement,
}: {
  closeElement: JSX.Element;
}) => {
  const [jsonInput, setJsonInput] = useState("");
  const existingWallets = useWalletTrackerMessageStore(
    (state) => state.trackedWallets,
  );
  const queryClient = useQueryClient();

  const updateWalletsMutation = useMutation({
    mutationFn: updateTrackedWallets,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracked-wallets"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-tracker"] });
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Wallets imported successfully"
          state="SUCCESS"
        />
      ));
      closeElement?.props?.onClick?.(); // Close modal on success
    },
    onError: (error: Error) => {
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message={error.message}
          state="ERROR"
        />
      ));
    },
  });

  const handleImport = () => {
    try {
      // Preprocess JSON input to handle various JSON format issues
      let processedInput = jsonInput.trim();

      // Handle partial array fragments (objects separated by commas)
      if (!processedInput.startsWith("[") && !processedInput.startsWith("{")) {
        // Input might be invalid, we'll try to fix it later
      }
      // Handle array fragments that start with an object and have trailing commas
      else if (processedInput.startsWith("{")) {
        // Check if it's an incomplete array fragment with trailing comma
        if (processedInput.endsWith(",")) {
          processedInput = processedInput.slice(0, -1); // Remove trailing comma
        }

        // Wrap the object(s) in array brackets
        processedInput = `[${processedInput}]`;
      }
      // Handle proper arrays with trailing commas
      else if (processedInput.startsWith("[")) {
        // Clean up any trailing commas before the closing bracket
        if (processedInput.includes("},]")) {
          processedInput = processedInput.replace(/},]/g, "}]");
        }
      }

      // Try to parse, and if it fails, attempt additional corrections
      let importedWallets: ImportedWallet[];
      try {
        importedWallets = JSON.parse(processedInput);
      } catch (parseError) {
        // Advanced recovery for broken JSON formats

        // Try to handle comma-separated objects without brackets
        if (
          !processedInput.startsWith("[") &&
          !processedInput.startsWith("{")
        ) {
          // Check if it might be objects separated by newlines
          const potentialObjects = processedInput.split(/\n(?=\s*{)/);

          if (potentialObjects.length > 0) {
            // Join with commas and wrap in array brackets
            processedInput = `[${potentialObjects.join(",")}]`;

            // Remove any trailing commas inside the array
            processedInput = processedInput.replace(/,\s*]/g, "]");

            try {
              importedWallets = JSON.parse(processedInput);
            } catch (error) {
              throw new Error("Invalid JSON format");
            }
          } else {
            throw new Error("Invalid JSON format");
          }
        } else {
          // Try one more fix: handle multiple objects without commas between them
          // This turns "{...}{...}" into "[{...},{...}]"
          const objectPattern = /{[^{}]*}/g;
          const matches = processedInput.match(objectPattern);

          if (matches && matches.length > 0) {
            processedInput = `[${matches.join(",")}]`;
            try {
              importedWallets = JSON.parse(processedInput);
            } catch (error) {
              throw new Error("Invalid JSON format");
            }
          } else {
            throw new Error("Invalid JSON format");
          }
        }
      }

      // Ensure we're working with an array
      if (!Array.isArray(importedWallets)) {
        importedWallets = [importedWallets];
      }

      // Validate format
      if (
        !importedWallets.every(
          (w) => w.name && (w.address || w.trackedWalletAddress) && w.emoji,
        )
      ) {
        throw new Error("Invalid JSON format");
      }

      // Validate addresses and collect invalid ones
      const invalidWallets: string[] = [];

      // First filter invalid addresses
      const validWallets = importedWallets.filter((wallet) => {
        const address = wallet.address || wallet.trackedWalletAddress;

        if (!isValidSolanaAddress(address as string)) {
          invalidWallets.push(wallet.name);
          return false;
        }

        return true;
      });

      // Then transform the valid wallets to the correct format
      const normalizedWallets = validWallets.map((wallet) => {
        const address = wallet.address || wallet.trackedWalletAddress;
        return {
          ...wallet,
          address: address,
          trackedWalletAddress: undefined,
        };
      });

      importedWallets = normalizedWallets;

      // Show error for invalid addresses
      if (invalidWallets.length > 0) {
        const message =
          invalidWallets.length === 1
            ? `Invalid address for wallet name: ${invalidWallets[0]}`
            : `Invalid addresses for wallet names: ${invalidWallets.join(", ")}`;

        toast.custom((t: any) => (
          <CustomToast
            tVisibleState={t.visible}
            message={message}
            state="ERROR"
          />
        ));
      }

      // Convert to tracked wallet format
      const existingWalletsNames: string[] = [];
      const newWallets = importedWallets
        .map((w) => {
          const importedWalletsWithoutCurrent = importedWallets.filter(
            (iw) =>
              !(
                iw.name === w.name &&
                iw.address === w.address &&
                iw.emoji === w.emoji
              ),
          );
          const existingAndImportedWallets = [
            ...existingWallets,
            ...importedWalletsWithoutCurrent,
          ];

          // Check for duplicate names
          const isExistName = existingAndImportedWallets.some(
            (ew) => ew.name === w.name,
          );

          if (isExistName) {
            const uniqueName = getUniqueWalletName(
              w.name,
              existingAndImportedWallets.map((ew) => ew.name),
            );
            w.name = uniqueName;
          }

          // Check for duplicate addresses
          const isExistAddress = existingAndImportedWallets.some(
            (ew) => ew.address === w.address,
          );

          if (isExistAddress) {
            existingWalletsNames.push(w.name); // Store name instead of address
          }

          // Check for exact duplicates
          const oldImportedWallet = existingWallets.filter(
            (ew) =>
              ew.address === w.address &&
              ew.emoji === w.emoji &&
              ew.name === w.name,
          );

          const isExistImportWallet = oldImportedWallet.length > 0;

          return isExistAddress || isExistImportWallet
            ? undefined
            : {
                name: w.name,
                address: w.address,
                emoji: w.emoji,
              };
        })
        .filter((w) => !!w) as TrackedWallet[];

      if (existingWalletsNames.length > 0) {
        toast.custom((t: any) => (
          <CustomToast
            tVisibleState={t.visible}
            message={`Wallets with name ${existingWalletsNames.join(", ")} already exist`}
            state="ERROR"
            className="h-full"
          />
        ));
      }

      // Merge with existing wallets, avoiding duplicates
      if (newWallets.length === 0) return;
      const mergedWallets = [...existingWallets, ...newWallets];

      // Update wallets
      updateWalletsMutation.mutate(mergedWallets as TrackedWallet[]);
    } catch (error) {
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Invalid JSON format"
          state="ERROR"
        />
      ));
    }
  };

  return (
    <>
      <div className="flex w-full items-center justify-start border-b border-border p-4">
        <h4 className="text-nowrap font-geistMedium text-sm text-white md:text-[18px]">
          Import Wallet
        </h4>
        {closeElement}
      </div>
      <div className="flex w-full flex-col">
        <div className="flex w-full flex-col gap-y-3 p-4 max-md:pt-0">
          <Textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Put your exported wallets here..."
            className={cn(
              "min-h-[128px] border border-border font-mono placeholder:text-foreground focus:outline-none",
              jsonInput.length > 0
                ? "font-geistMonoRegular"
                : "font-geistRegular",
            )}
          />
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Nova Logo"
              height={100}
              width={100}
              className="size-4 object-contain"
            />
            <span className="text-sm leading-[18px] text-fontColorSecondary">
              Nova supports wallet imports from:
            </span>
          </div>
          <ul className="list-none space-y-1 text-fontColorSecondary">
            <li className="flex items-center text-sm">
              <Image
                src="/icons/pink-check.png"
                alt="Check Icon"
                height={100}
                width={100}
                className="mr-1 size-5 object-contain"
              />
              BullX
            </li>
            <li className="flex items-center text-sm">
              <Image
                src="/icons/pink-check.png"
                alt="Check Icon"
                height={100}
                width={100}
                className="mr-1 size-5 object-contain"
              />
              Axiom
            </li>
          </ul>
        </div>
        <div className="flex w-full items-center justify-between border-t border-border p-4">
          <BaseButton
            variant="primary"
            className="h-[32px] w-full"
            onClick={handleImport}
            disabled={updateWalletsMutation.isPending}
          >
            <span className="inline-block whitespace-nowrap font-geistMedium text-sm">
              {updateWalletsMutation.isPending ? "Submitting..." : "Submit"}
            </span>
          </BaseButton>
        </div>
      </div>
    </>
  );
};

// Main component that decides whether to use Dialog or Popover
export const WalletTrackerImport = () => {
  const width = useWindowSizeStore((state) => state.width);
  const [openPopover, setOpenPopover] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  // Close handler to pass to the content component
  const handleClose = () => {
    setOpenPopover(false);
  };

  const closeElement = (
    <button
      title="Close"
      onClick={handleClose}
      className="ml-auto size-[24px] cursor-pointer text-fontColorSecondary hover:text-white"
    >
      <X size={24} />
    </button>
  );

  // Use Dialog for smaller screens, Popover for larger screens
  if (width && width < 1280) {
    return (
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTrigger asChild>
          <div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <BaseButton variant="gray" size="short" className="size-10">
                    <div className="relative z-30 aspect-square h-5 w-5 flex-shrink-0">
                      <Image
                        src="/icons/footer/import-wallet.png"
                        alt="Import Wallet Icon"
                        fill
                        quality={100}
                        className="object-contain"
                      />
                    </div>
                  </BaseButton>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Import Wallet</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </DialogTrigger>
        <DialogContent
          showCloseButton={false}
          className="max-w-[95vw] gap-y-0 border-border bg-card p-0 text-white sm:max-w-[425px]"
        >
          <ImportWalletContent closeElement={closeElement} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Popover open={openPopover} onOpenChange={setOpenPopover}>
      <PopoverTrigger asChild>
        <div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <BaseButton variant="gray" size="short" className="size-10">
                  <div className="relative z-30 aspect-square h-5 w-5 flex-shrink-0">
                    <Image
                      src="/icons/footer/import-wallet.png"
                      alt="Import Wallet Icon"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>
                </BaseButton>
              </TooltipTrigger>
              <TooltipContent>
                <p>Import Wallet</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[320px] border-border bg-card p-0 text-white"
      >
        <ImportWalletContent closeElement={closeElement} />
      </PopoverContent>
    </Popover>
  );
};

const getUniqueWalletName = (
  baseName: string,
  existingNames: string[],
): string => {
  let counter = 1;
  let newName = baseName;

  while (existingNames.includes(newName)) {
    newName = `${baseName}${counter}`;
    counter++;
  }

  return newName;
};

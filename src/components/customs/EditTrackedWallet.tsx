"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTrackedWallets } from "@/apis/rest/wallet-tracker";
import toast from "react-hot-toast";
import CustomToast from "@/components/customs/toasts/CustomToast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import SelectEmoji from "./SelectEmoji";
import BaseButton from "./buttons/BaseButton";
import { useWalletTrackerMessageStore } from "@/stores/footer/use-wallet-tracker-message.store";
import { useSelectedWalletTrackerTradeAddressesFilterStore } from "@/stores/footer/use-selected-wallet-tracker-trade-filter.store";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { isValidSolanaAddress } from "@/utils/walletValidation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useWindowSizeStore } from "@/stores/use-window-size.store";

// Define Zod schema for form validation
const walletFormSchema = z.object({
  name: z.string().min(1, "Wallet name is required"),
  address: z
    .string()
    .min(1, "Wallet address is required")
    .refine(isValidSolanaAddress, {
      message: "Please enter a valid Solana address",
    }),
  emoji: z.string().min(1, "Select an emoji"),
});

// Type for our form values
type WalletFormValues = z.infer<typeof walletFormSchema>;

// Content component that can be used in both Dialog and Popover
const EditWalletContent = ({
  handleClose,
  closeComponent,
  address,
}: {
  handleClose: () => void;
  closeComponent: React.ReactNode;
  address: string;
}) => {
  const queryClient = useQueryClient();
  const trackedWallets = useWalletTrackerMessageStore(
    (state) => state.trackedWallets,
  );

  // Find the wallet to edit
  const walletToEdit = trackedWallets.find((w) => w.address === address) || {
    name: "",
    emoji: "",
    address: "",
  };

  const currentSelectedAddresses =
    useSelectedWalletTrackerTradeAddressesFilterStore(
      (state) => state.selectedWalletAddresses,
    );
  const setSelectedWalletAddressesFilter =
    useSelectedWalletTrackerTradeAddressesFilterStore(
      (state) => state.setSelectedWalletAddresses,
    );

  // Initialize react-hook-form with zod resolver
  const form = useForm<WalletFormValues>({
    resolver: zodResolver(walletFormSchema),
    defaultValues: {
      name: walletToEdit.name,
      address: walletToEdit.address,
      emoji: walletToEdit.emoji,
    },
  });

  const handleDeselect = () => {
    const newFilter = currentSelectedAddresses.filter((a) => a !== address);
    setSelectedWalletAddressesFilter(newFilter);
  };

  // Update mutation
  const updateWalletsMutation = useMutation({
    mutationFn: updateTrackedWallets,
    onSuccess: () => {
      handleDeselect();
      queryClient.invalidateQueries({ queryKey: ["tracked-wallets"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-tracker"] });
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Wallet updated successfully"
          state="SUCCESS"
        />
      ));
      handleClose();
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

  const onSubmit = (values: WalletFormValues) => {
    // Update only the edited wallet in the tracked wallets array
    const updatedWallets = trackedWallets.map((w) =>
      w.address === address ? values : w,
    );
    updateWalletsMutation.mutate(updatedWallets);
  };

  return (
    <>
      <div className="flex w-full items-center justify-start border-b border-border px-4 max-md:h-[56px] md:p-4">
        <h4 className="text-nowrap font-geistSemiBold text-[18px] text-fontColorPrimary">
          Edit Wallet
        </h4>
        {closeComponent}
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="relative flex w-full flex-grow flex-col gap-y-4 p-4 pb-[72px] pt-1"
        >
          <div className="flex w-full gap-x-2 md:py-3">
            <FormField
              control={form.control}
              name="emoji"
              render={({ field }) => (
                <FormItem className="flex max-w-14 flex-col gap-1">
                  <FormLabel className="text-xs text-fontColorSecondary">
                    Emoji
                  </FormLabel>
                  <FormControl>
                    <SelectEmoji
                      alreadySelectedList={trackedWallets
                        .filter((w) => w.address !== address)
                        .map((w) => w.emoji)}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex max-w-[120px] flex-grow flex-col gap-1">
                  <FormLabel className="text-xs text-fontColorSecondary">
                    Wallet Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Wallet Name"
                      className="h-[32px] border border-border placeholder:text-fontColorSecondary focus:outline-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="flex flex-grow flex-col gap-1">
                  <FormLabel className="text-xs text-fontColorSecondary">
                    Wallet Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Wallet Address"
                      className="h-[32px] border border-border placeholder:text-fontColorSecondary focus:outline-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="absolute bottom-0 left-0 z-[100] flex w-full items-center justify-center rounded-b-[8px] border-t border-border bg-card px-4 max-md:h-[56px] md:p-4">
            <BaseButton
              type="submit"
              variant="primary"
              className="m-auto h-[32px] w-full"
              disabled={updateWalletsMutation.isPending}
            >
              <span className="inline-block whitespace-nowrap font-geistSemiBold text-sm">
                {updateWalletsMutation.isPending ? "Saving..." : "Save Changes"}
              </span>
            </BaseButton>
          </div>
        </form>
      </Form>
    </>
  );
};

// Main component - decides between Dialog or Popover based on screen width
export default function EditTrackedWallet({
  triggerElement,
  address,
}: {
  triggerElement: React.ReactNode;
  address: string;
}) {
  const width = useWindowSizeStore((state) => state.width);
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const closeComponent = (
    <button
      onClick={handleClose}
      className="ml-auto size-[24px] cursor-pointer text-fontColorSecondary hover:text-white"
    >
      <X size={24} />
    </button>
  );

  // Use Dialog for smaller screens, Popover for larger screens
  if (width && width < 1280) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{triggerElement}</DialogTrigger>
        <DialogContent
          showCloseButton={false}
          className="max-w-[95vw] border-border bg-card p-0 text-white sm:max-w-[425px]"
        >
          <EditWalletContent
            handleClose={handleClose}
            closeComponent={closeComponent}
            address={address}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{triggerElement}</PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[425px] border-border bg-card p-0 text-white"
      >
        <EditWalletContent
          handleClose={handleClose}
          closeComponent={closeComponent}
          address={address}
        />
      </PopoverContent>
    </Popover>
  );
}

"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generateWallet } from "@/apis/rest/wallet-manager";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import CustomToast from "@/components/customs/toasts/CustomToast";
import toast from "react-hot-toast";
// ######## Components 🧩 ########
import Image from "next/image";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import BaseButton from "../buttons/BaseButton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/libraries/utils";
import { useWindowSizeStore } from "@/stores/use-window-size.store";

const generateWalletSchema = z.object({
  name: z
    .string()
    .min(1, "Wallet name is required")
    .max(32, "Wallet name must be less than 32 characters"),
});

type GenerateWalletValues = z.infer<typeof generateWalletSchema>;

export default function GenerateWalletPopoverModal() {
  const queryClient = useQueryClient();
  const [openPopover, setOpenPopover] = useState(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const width = useWindowSizeStore((state) => state.width);

  const form = useForm<GenerateWalletValues>({
    resolver: zodResolver(generateWalletSchema),
    defaultValues: {
      name: "",
    },
  });

  // Handle dialog/popover state changes
  const handleOpenStateChange = (
    isOpen: boolean,
    type: "popover" | "dialog",
  ) => {
    if (type === "popover") {
      setOpenPopover(isOpen);
    } else {
      setOpenDialog(isOpen);
    }

    // Reset form when opening or closing
    if (!isOpen) {
      form.reset();
      form.clearErrors();
    }
  };

  const generateWalletMutation = useMutation({
    mutationFn: generateWallet,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Wallet generated successfully"
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

  // Update handleClose to use new handler
  const handleClose = () => {
    handleOpenStateChange(false, "popover");
    handleOpenStateChange(false, "dialog");
  };

  const onSubmit = (data: GenerateWalletValues) => {
    generateWalletMutation.mutate(data.name);
  };

  useEffect(() => {
    if (width! >= 1024 && openDialog) {
      setOpenDialog(false);
    } else if (width! < 1024 && openPopover) {
      setOpenPopover(false);
    }
  }, [width]);

  return (
    <>
      {/* Desktop */}
      <Popover
        open={openPopover}
        onOpenChange={(isOpen) => handleOpenStateChange(isOpen, "popover")}
      >
        <PopoverTrigger asChild>
          <BaseButton
            variant="primary"
            className="max-md:hidden"
            prefixIcon={
              <div className="relative aspect-square size-[20px] flex-shrink-0">
                <Image
                  src="/icons/add.png"
                  alt="Add Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
            }
          >
            <span className="inline-block font-geistSemiBold text-base text-[#080811]">
              Generate New Wallet
            </span>
          </BaseButton>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={6}
          className="flex w-[400px] flex-col rounded-[8px] border border-border bg-card p-0 shadow-[0_0_20px_0_#000000]"
        >
          <div className="flex h-[52px] w-full items-center justify-between border-b border-border p-4">
            <h4 className="text-nowrap font-geistSemiBold text-lg text-fontColorPrimary">
              Generate New Wallet
            </h4>
            <button
              onClick={() => setOpenPopover(false)}
              className="relative aspect-square size-[20px] flex-shrink-0"
            >
              <Image
                src="/icons/close.png"
                alt="Close Icon"
                fill
                quality={100}
                className="object-contain"
              />
            </button>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="p-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Wallet Name"
                          className={cn(
                            "h-[32px] border border-border bg-transparent placeholder:text-fontColorSecondary focus:outline-none",
                            fieldState.error &&
                              "border-destructive bg-destructive/[4%]",
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="border-t border-border p-4">
                <BaseButton
                  type="submit"
                  variant="primary"
                  className="h-[32px] w-full"
                  disabled={generateWalletMutation.isPending}
                >
                  {generateWalletMutation.isPending
                    ? "Generating..."
                    : "Submit"}
                </BaseButton>
              </div>
            </form>
          </Form>
        </PopoverContent>
      </Popover>

      {/* Mobile */}
      <Dialog
        open={openDialog}
        onOpenChange={(isOpen) => handleOpenStateChange(isOpen, "dialog")}
      >
        <DialogTrigger asChild>
          <BaseButton
            type="submit"
            variant="primary"
            size="short"
            className="size-10 md:hidden"
          >
            <div className="relative aspect-square h-5 w-5 flex-shrink-0">
              <Image
                src="/icons/add.png"
                alt="Add Icon"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
          </BaseButton>
        </DialogTrigger>
        <DialogContent className="flex h-auto w-full max-w-[382px] flex-col gap-y-0 rounded-[8px] border border-border bg-card lg:hidden lg:max-w-[480px]">
          <DialogHeader className="flex h-[56px] flex-row items-center border-b border-border p-4">
            <DialogTitle className="!font-geistSemiBold text-lg">
              Generate New Wallet
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="p-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Wallet Name"
                          className={cn(
                            "h-[32px] border border-border bg-transparent placeholder:text-fontColorSecondary focus:outline-none",
                            fieldState.error &&
                              "!border-destructive !bg-destructive/[4%]",
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="border-t border-border p-4">
                <BaseButton
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={generateWalletMutation.isPending}
                >
                  {generateWalletMutation.isPending
                    ? "Generating..."
                    : "Submit"}
                </BaseButton>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState, useEffect, Fragment, useMemo } from "react";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Wallet, withdrawFromWallet } from "@/apis/rest/wallet-manager";
import CustomToast from "@/components/customs/toasts/CustomToast";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import * as Sentry from "@sentry/nextjs";
// ######## Components 🧩 ########
import Image from "next/image";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import BaseButton from "../buttons/BaseButton";
import { Input } from "@/components/ui/input";
import WalletSelectionButton from "../WalletSelectionButton";
import { Slider } from "@/components/ui/slider";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatAmountWithoutLeadingZero } from "@/utils/formatAmount";
import { CachedImage } from "../CachedImage";

export default function WithdrawModal({
  isSingle,
  walletAddress,
}: {
  isSingle?: boolean;
  walletAddress?: string;
}) {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [maxAmount, setMaxAmount] = useState<number>(0);
  const [selectedPercentage, setSelectedPercentage] = useState<number>(0);
  const {
    selectedMultipleActiveWallet,
    setSelectedMultipleActiveWallet,
    userWalletFullList,
  } = useUserWalletStore();

  // Create dynamic schema based on maxAmount
  const withdrawFormSchema = useMemo(
    () =>
      z.object({
        fromWallet: z.union([
          z
            .string()
            .min(32, "Invalid Solana address")
            .max(44, "Invalid Solana address"),
          z.array(
            z
              .string()
              .min(32, "Invalid Solana address")
              .max(44, "Invalid Solana address"),
          ),
        ]),
        toWallet: z
          .string()
          .min(32, "Invalid Solana address")
          .max(44, "Invalid Solana address"),
        amount: z.coerce
          .number({ invalid_type_error: "Amount must be a number" })
          .max(
            maxAmount,
            `Amount must be less than or equal to ${formatAmountWithoutLeadingZero(
              maxAmount,
            )} SOL`,
          )
          .positive("Amount must be greater than 0")
          .refine((val) => !isNaN(val), "Please enter a valid number")
          .refine((val) => {
            const decimals = val.toString().split(".")[1]?.length || 0;
            return decimals <= 9;
          }, "Maximum 9 decimal places allowed"),
        amountType: z.enum(["Amount", "%"]).optional(),
        percentage: z.number().nullable(),
      }),
    [maxAmount],
  );

  const [isWalletSetted, setIsWalletSetted] = useState(false);

  useEffect(() => {
    if (isWalletSetted || !openDialog || userWalletFullList.length === 0)
      return;
    setIsWalletSetted(true);
    if (!walletAddress) {
      setSelectedMultipleActiveWallet([userWalletFullList[0]]);
      form.setValue("fromWallet", [userWalletFullList[0].address]);
      return;
    }

    const foundWallet = userWalletFullList.find(
      (w) => w.address === walletAddress,
    );
    if (foundWallet) {
      setSelectedMultipleActiveWallet([foundWallet]);
      form.setValue("fromWallet", [foundWallet.address]);
    }
  }, [walletAddress, userWalletFullList, openDialog, isWalletSetted]);

  useEffect(() => {
    if (selectedMultipleActiveWallet.length > 0) {
      form.setValue(
        "fromWallet",
        selectedMultipleActiveWallet.map((w) => w.address),
      );
    }
  }, [selectedMultipleActiveWallet]);

  const form = useForm<z.infer<typeof withdrawFormSchema>>({
    resolver: zodResolver(withdrawFormSchema),
    defaultValues: {
      fromWallet: "",
      toWallet: "",
      amount: 0,
      percentage: 0,
    },
    // Re-validate when maxAmount changes
    context: { maxAmount },
  });

  const { watch } = form;

  const fromWallet = watch("fromWallet");
  const toWallet = watch("toWallet");
  const amountType = watch("amountType");
  const amount = watch("amount");
  const percentage = watch("percentage");

  // Update max amount when wallet changes
  useEffect(() => {
    const selectedWalletsAddress = selectedMultipleActiveWallet.map(
      (w) => w.address,
    );
    if (!!(userWalletFullList && fromWallet)) {
      const balance = userWalletFullList
        .filter((w) => selectedWalletsAddress.includes(w.address))
        .map((w) => w.balance)
        .reduce((a, b) => Number(a) + Number(b), 0);
      setMaxAmount(balance || 0);
      // setMaxAmount(100);
    } else {
      setMaxAmount(0);
    }
  }, [userWalletFullList, selectedMultipleActiveWallet, fromWallet]);

  // Calculate actual amount with proper type safety
  const actualAmount = useMemo(() => {
    if (!fromWallet || typeof amount !== "number" || maxAmount <= 0) return 0;
    if (amountType === "%") {
      return Number((maxAmount * Math.max(0, Math.min(amount, 100))) / 100);
    }
    return Number(Math.max(0, Math.min(amount, maxAmount)));
  }, [amount, amountType, maxAmount, fromWallet]);

  // Withdraw mutation
  const [currentTXInfoString, setCurrentTXInfoString] = useState<string>("");
  const withdrawMutation = useMutation({
    mutationFn: ({
      from,
      to,
      amount,
    }: {
      from: string | string[];
      to: string;
      amount: string;
    }) => withdrawFromWallet(from, to, amount),
    onMutate: (data) => {
      setCurrentTXInfoString(JSON.stringify(data));
    },
    onSuccess: () => {
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Withdrawal successful"
          state="SUCCESS"
        />
      ));
      handleDialogClose(false);
      setCurrentTXInfoString("");
    },
    onError: (error: Error) => {
      Sentry.captureMessage(
        `Withdraw TX Error 🔴 - (Withdraw Modal): ${String(error?.message)} | TX: ${currentTXInfoString}`,
        "error",
      );
      setCurrentTXInfoString("");
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message={error.message}
          state="ERROR"
        />
      ));
    },
  });

  const onSubmit = async (data: z.infer<typeof withdrawFormSchema>) => {
    if (actualAmount > maxAmount) {
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Insufficient balance"
          state="ERROR"
        />
      ));
      return;
    }

    withdrawMutation.mutate({
      from: data.fromWallet,
      to: data.toWallet,
      amount: actualAmount.toString(),
    });
  };

  // Dialog close handler
  const handleDialogClose = (isOpen: boolean) => {
    setOpenDialog(isOpen);
    setIsWalletSetted(false);
    setSelectedMultipleActiveWallet([]);
    setSelectedPercentage(0);
    form.reset();
  };

  const SolAmountInput = () => (
    <div className="flex w-full flex-col gap-y-2">
      <div className="flex gap-x-2">
        <FormField
          control={form.control}
          name="amount"
          render={({ field, fieldState }) => (
            <FormItem className="!w-[70%]">
              <div className="flex w-full items-center justify-between">
                <FormLabel className="text-sm text-fontColorSecondary">
                  Sol Amount
                </FormLabel>
              </div>
              <FormControl>
                <div className="relative flex w-full flex-col gap-y-3">
                  <div className="flex gap-x-2">
                    <Input
                      isNumeric
                      decimalScale={9}
                      {...field}
                      placeholder="Enter Amount"
                      value={field.value || ""}
                      onNumericValueChange={(values) => {
                        const newValue =
                          values.floatValue === undefined
                            ? 0
                            : values.floatValue;
                        field.onChange(newValue);
                        // Update the percentage based on the amount
                        const calculatedPercentage = parseFloat(
                          ((newValue / maxAmount) * 100).toFixed(2),
                        );

                        form.setValue("percentage", calculatedPercentage);
                        setSelectedPercentage(calculatedPercentage);

                        // Trigger revalidation when value changes
                        form.trigger("amount");
                      }}
                      disabled={!fromWallet}
                      className={cn(
                        fieldState.error &&
                          "border-destructive bg-destructive/[4%]",
                        "w-full",
                      )}
                      prefixEl={
                        <div className="absolute left-3 aspect-square h-4 w-4 flex-shrink-0">
                          <CachedImage
                            src="/icons/solana-sq.svg"
                            alt="Solana SQ Icon"
                            fill
                            quality={50}
                            className="object-contain"
                          />
                        </div>
                      }
                    />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="percentage"
          render={({ field, fieldState }) => (
            <FormItem className="!w-[30%]">
              <div className="invisible flex w-full items-center justify-between">
                <FormLabel className="text-sm text-fontColorSecondary">
                  Percentage
                </FormLabel>
              </div>
              <FormControl>
                <div className="relative flex w-full flex-col gap-y-3">
                  <Input
                    isNumeric
                    {...field}
                    placeholder="0"
                    value={field.value || ""}
                    onNumericValueChange={(values) => {
                      const newValue =
                        values.floatValue === undefined ? 0 : values.floatValue;
                      if (newValue !== 0 && newValue <= 100) {
                        field.onChange(newValue);
                        // modfy the amount based on percentage
                        const calculatedAmount = parseFloat(
                          ((maxAmount * newValue) / 100).toFixed(9),
                        );
                        form.setValue("amount", calculatedAmount);
                        setSelectedPercentage(newValue);
                        // Trigger revalidation when value changes
                        form.trigger("amount");
                      }
                    }}
                    disabled={!fromWallet}
                    className={cn(
                      fieldState.error &&
                        "border-destructive bg-destructive/[4%]",
                      "w-full",
                    )}
                    suffixEl={
                      <div className="absolute right-3 flex aspect-square h-4 w-4 flex-shrink-0 items-center justify-center text-fontColorSecondary">
                        %
                      </div>
                    }
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="flex w-full justify-between gap-x-2">
        {[25, 50, 75, 100].map((item) => (
          <BaseButton
            key={`list-${item}`}
            variant="rounded"
            size="long"
            className={cn(
              "flex h-[32px] w-[23%] items-center justify-center gap-1 px-2 text-sm focus:border-primary",
              selectedPercentage === item &&
                "border-primary bg-primary/[8%] text-primary",
            )}
            type="button"
            onClick={() => {
              setSelectedPercentage(item);
              form.setValue("percentage", item);
              form.setValue(
                "amount",
                parseFloat(((maxAmount * item) / 100).toFixed(9)),
              );
              form.trigger("amount");
            }}
          >
            {item}%
          </BaseButton>
        ))}
      </div>
    </div>
  );

  // Update effect to trigger revalidation when maxAmount changes
  useEffect(() => {
    if (form.getValues("amount")) {
      form.trigger("amount");
    }
  }, [maxAmount]);

  return (
    <Dialog
      defaultOpen={openDialog}
      open={openDialog}
      onOpenChange={handleDialogClose}
    >
      <DialogTrigger asChild>
        <div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <BaseButton
                  variant="gray"
                  // size="short"
                  onClick={() => setOpenDialog(false)}
                  className={cn(
                    "hidden h-[40px] md:flex",
                    isSingle && "size-8",
                  )}
                >
                  <div
                    className={cn(
                      "relative aspect-square size-[20px] flex-shrink-0",
                      isSingle && "size-4",
                    )}
                  >
                    <Image
                      src="/icons/outline-withdraw-primary.svg"
                      alt="Withdraw Icon"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>
                  <span
                    className={cn(
                      "inline-block font-geistSemiBold text-base text-fontColorPrimary",
                      isSingle && "hidden",
                    )}
                  >
                    Withdraw
                  </span>
                </BaseButton>
              </TooltipTrigger>
              <TooltipContent side="top" className="px-2 py-1">
                <span className="inline-block text-nowrap text-xs">
                  Withdraw
                </span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <BaseButton
            type="button"
            onClick={() => setOpenDialog(true)}
            variant="gray"
            className={cn("size-10 md:hidden", isSingle && "size-8")}
          >
            <div
              className={cn(
                "relative aspect-square size-[20px] flex-shrink-0",
                isSingle && "size-4",
              )}
            >
              <Image
                src="/icons/outline-withdraw.png"
                alt="Withdraw Icon"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
          </BaseButton>
        </div>
      </DialogTrigger>
      <DialogContent className="flex h-auto w-[360px] flex-col gap-y-0 rounded-[8px] border border-border bg-card">
        <DialogHeader className="flex h-[56px] flex-row items-center border-b border-border p-4">
          <DialogTitle className="text-lg">Withdraw</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex w-full flex-col items-center gap-y-4 p-4">
              <FormField
                control={form.control}
                name="fromWallet"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-sm text-fontColorSecondary">
                      Select Wallet
                    </FormLabel>
                    <FormControl>
                      <WalletSelectionButton
                        value={selectedMultipleActiveWallet}
                        setValue={(wallet) => {
                          setSelectedMultipleActiveWallet(wallet);
                          form.setValue(
                            "fromWallet",
                            wallet.map((w) => w.address),
                          );
                        }}
                        isGlobal={false}
                        className="w-full"
                        maxWalletShow={10}
                        // maxWalletShow={4}
                        isMultipleSelect={false}
                        showAllOption={false}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="toWallet"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-sm text-fontColorSecondary">
                      To
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter To Solana Address"
                        prefixEl={
                          <div className="absolute left-3 aspect-square h-4 w-4 flex-shrink-0">
                            <Image
                              src="/icons/wallet.png"
                              alt="Wallet Icon"
                              fill
                              quality={100}
                              className="object-contain"
                            />
                          </div>
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {SolAmountInput()}
            </div>

            <div className="w-full border-t border-border p-4">
              <BaseButton
                type="submit"
                variant="primary"
                className="h-[40px] w-full"
                disabled={withdrawMutation.isPending || !toWallet}
              >
                <span className="inline-block font-geistSemiBold text-base text-[#080811]">
                  {withdrawMutation.isPending ? "Processing..." : "Withdraw"}
                </span>
              </BaseButton>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

const WithdrawForm = () => {};

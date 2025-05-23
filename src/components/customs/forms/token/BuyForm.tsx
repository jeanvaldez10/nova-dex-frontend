// @ts-nocheck

"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  submitTransaction,
  submitTransactionSchema,
  SubmitTransactionRequest,
} from "@/apis/rest/transaction/submit-transaction";
import toast from "react-hot-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import { useActivePresetStore } from "@/stores/dex-setting/use-active-preset.store";
import * as Sentry from "@sentry/nextjs";
import debounce from "lodash/debounce";
import isEqual from "lodash/isEqual";
// ######## Components 🧩 ########
import Image from "next/image";
import { Label } from "@/components/ui/label";
import LabelStatusIndicator from "@/components/customs/LabelStatusIndicator";
import Separator from "@/components/customs/Separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import BaseButton from "../../buttons/BaseButton";
import { Input } from "@/components/ui/input";
import OnOffToggle from "../../OnOffToggle";
import SellBuyInputAmount, {
  DEFAULT_QUICK_PICK_SOL_LIST,
} from "../../SellBuyInputAmount";
import WalletSelectionButton from "../../WalletSelectionButton";
import PresetSelectionButtons from "../../PresetSelectionButtons";
import CustomToast from "../../toasts/CustomToast";
import {
  convertNumberToPresetId,
  convertNumberToPresetKey,
  convertPresetIdToNumber,
} from "@/utils/convertPreset";
import { useQuickBuySettingsStore } from "@/stores/setting/use-quick-buy-settings.store";
import { useQuickAmountStore } from "@/stores/dex-setting/use-quick-amount.store";
import { useOpenAdvanceSettingsFormStore } from "@/stores/use-open-advance-settings-form.store";
import { CachedImage } from "../../CachedImage";
import { useFeeTip } from "@/stores/setting/use-fee-tip.store";
import { SuperNovaActived } from "./SuperNovaActived";

// Define interface for form settings to autosave
interface SettingsToAutoSave {
  slippage: number;
  mev_protect: boolean;
  auto_tip: boolean;
  fee: number;
  tip: number;
  preset: number;
}

// Import the actual API function
import {
  updateQuickBuyPreset,
  QuickBuyPresetRequest,
} from "@/apis/rest/settings/settings";
import { usePopupStore } from "@/stores/use-popup-state";

export default function BuyForm() {
  const params = useParams();
  const queryClient = useQueryClient();
  const [picker, setPicker] = useState<number | undefined>(0);
  const [lastFocusOn, setLastFocusOn] = useState<"input" | "picker">("input");
  const { openAdvanceSettings, setOpenAdvanceSettings } =
    useOpenAdvanceSettingsFormStore();
  const presetData = useQuickBuySettingsStore((state) => state.presets);
  const cosmoWallets = useQuickAmountStore((state) => state.cosmoWallets);
  const setCosmoWallets = useQuickAmountStore((state) => state.setCosmoWallets);

  // Add a ref to track the previous settings to compare
  const previousSettingsRef = useRef<SettingsToAutoSave | null>(null);

  // Add a state to track if autosave is in progress
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Initialize form with current preset data
  const form = useForm<SubmitTransactionRequest>({
    resolver: zodResolver(submitTransactionSchema),
    defaultValues: {
      mint: (params?.["mint-address"] || params?.["pool-address"]) as string,
      type: "buy",
      wallets: cosmoWallets.map((wallet) => ({
        address: wallet.address,
        amount: 0,
      })),
      preset: 1,
      slippage: 20,
      mev_protect:
        presetData?.preset1?.processor === "Jito" ||
        presetData?.preset1?.processor === "secure",
      auto_tip: presetData?.preset1?.autoTipEnabled,
      fee: 0,
      tip: 0,
      module: "Quick Buy",
    },
  });

  // Buy transaction mutation
  const [currentTXInfoString, setCurrentTXInfoString] = useState<string>("");
  const mutation = useMutation({
    mutationFn: submitTransaction,
    onMutate: (data) => {
      setCurrentTXInfoString(JSON.stringify(data));
    },
    onSuccess: () => {
      setCurrentTXInfoString("");
    },
    onError: (error: Error) => {
      Sentry.captureMessage(
        `Submit TX Error 🔴 - (Buy Form): ${String(error?.message)} | TX: ${currentTXInfoString}`,
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

  // Add a mutation for autosaving settings using the actual API
  const autoSaveMutation = useMutation({
    mutationFn: updateQuickBuyPreset,
    onMutate: () => {
      setIsAutoSaving(true);
    },
    onSuccess: () => {
      setIsAutoSaving(false);
      // Show success toast notification
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Settings updated successfully"
          state="SUCCESS"
        />
      ));

      // Refresh related data to update the UI
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (error: Error) => {
      setIsAutoSaving(false);
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message={`Failed to save settings: ${error.message}`}
          state="ERROR"
        />
      ));
    },
  });
  const autoFeeEnabled = useQuickBuySettingsStore(
    (state) => state.presets.autoFeeEnabled,
  );
  const feetipData = useFeeTip((state) => state.data);

  // 🕍Preset Settings
  useEffect(() => {
    const preset = form.watch("preset");
    if (presetData) {
      const presetKey = convertNumberToPresetKey(
        preset,
      ) as keyof typeof presetData;
      form.reset({
        ...form.getValues(),
        type: "buy",
        slippage: Number(
          presetData[presetKey]?.slippage || form.getValues("slippage"),
        ),
        auto_tip: presetData[presetKey]?.autoTipEnabled,
        fee: Number(presetData[presetKey]?.fee || form.getValues("fee")),
        tip: Number(presetData[presetKey]?.tip || form.getValues("tip")),
        mev_protect:
          presetData[presetKey]?.processor === "Jito" ||
          presetData[presetKey]?.processor === "secure",
      });

      // Update the previous settings ref with initial values
      previousSettingsRef.current = {
        slippage: Number(
          presetData[presetKey]?.slippage || form.getValues("slippage"),
        ),
        mev_protect:
          presetData[presetKey]?.processor === "Jito" ||
          presetData[presetKey]?.processor === "secure",
        auto_tip: presetData[presetKey]?.autoTipEnabled,
        fee: Number(presetData[presetKey]?.fee || form.getValues("fee")),
        tip: Number(presetData[presetKey]?.tip || form.getValues("tip")),
        preset: preset,
      };
    }
  }, [presetData, form.watch("preset")]);

  // 💵Wallet Settings
  useEffect(() => {
    form.setValue(
      "wallets",
      cosmoWallets.map((wallet) => ({
        address: wallet.address,
        amount: (lastFocusOn === "input" ? form.watch("amount") : picker) || 0,
      })),
    );
  }, [cosmoWallets]);

  // Create a debounced function for autosaving
  const debouncedAutoSave = useRef(
    debounce((formValues: SettingsToAutoSave) => {
      // Only save if values have changed
      if (
        previousSettingsRef.current &&
        !isEqual(previousSettingsRef.current, formValues)
      ) {
        // Prepare the data for the API to match QuickBuyPresetRequest
        const dataToSave: QuickBuyPresetRequest = {
          preset: convertNumberToPresetKey(formValues.preset).replace(
            "preset",
            "",
          ),
          slippage: formValues.slippage,
          autoTipEnabled: formValues.auto_tip,
          fee: formValues.fee,
          tip: formValues.tip,
          // Determine processor based on MEV protection status
          processor: formValues.mev_protect ? "Jito" : "Node",
          // Include amounts from current preset
          amounts:
            presetData[convertNumberToPresetKey(formValues.preset)]?.amounts ||
            [],

          autoFeeEnabled,
        };

        // Call the mutation to save settings
        autoSaveMutation.mutate(dataToSave);

        // Update the previous settings ref
        previousSettingsRef.current = formValues;
      }
    }, 800),
  ).current;

  // Watch form values and autosave when they change
  useEffect(() => {
    const subscription = form.watch((value) => {
      // Extract only the settings we want to autosave
      const settingsToSave: SettingsToAutoSave = {
        slippage: Number(value.slippage || 0),
        mev_protect: Boolean(value.mev_protect),
        auto_tip: Boolean(value.auto_tip),
        fee: Number(value.fee || 0),
        tip: Number(value.tip || 0),
        preset: Number(value.preset || 1),
      };

      // Call the debounced autosave function
      debouncedAutoSave(settingsToSave);
    });

    // Cleanup on component unmount
    return () => {
      subscription.unsubscribe();
      debouncedAutoSave.cancel();
    };
  }, [form.watch, debouncedAutoSave]);

  // Handle form submission
  const onSubmit = (data: SubmitTransactionRequest) => {
    const finalData = {
      ...data,
      tip: (autoFeeEnabled ? feetipData.tip : data.tip) as number,
      ...(autoFeeEnabled ? { fee: feetipData.fee } : {}),
      wallets: (data.wallets as { address: string; amount: number }[]).map(
        (wallet) => ({
          address: wallet.address,
          amount:
            (lastFocusOn === "input" ? form.watch("amount") : picker) || 0,
        }),
      ),
    };
    delete finalData.amount;
    mutation.mutate(finalData);
  };

  const handleToggle = () => setOpenAdvanceSettings(!openAdvanceSettings);
  const { remainingScreenWidth } = usePopupStore();

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(onSubmit)(e);
        }}
      >
        {/* Setups */}

        {/* md:flex-col xl:flex-row */}
        <div className="flex w-full flex-row gap-x-2 gap-y-2 p-3">
          <FormField
            control={form.control}
            name="wallets"
            render={({ field }) => (
              <FormItem className="flex flex-grow">
                <FormControl>
                  <WalletSelectionButton
                    displayVariant="name"
                    value={cosmoWallets}
                    setValue={(wallet) => {
                      setCosmoWallets(wallet);
                      field.onChange(
                        wallet.map((w) => ({
                          address: w.address,
                          amount: 0,
                        })),
                      );
                    }}
                    className={cn(
                      "w-full md:max-w-[190.5px]",
                      remainingScreenWidth <= 1280 && "md:max-w-[150px]",
                    )}
                    maxWalletShow={10}
                    // maxWalletShow={2}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="preset"
            render={({ field }) => (
              <FormItem className="w-fit">
                <FormControl>
                  <PresetSelectionButtons
                    activePreset={convertNumberToPresetId(field.value)}
                    setActivePreset={(value: string) => {
                      setPicker(0);
                      setLastFocusOn("picker");
                      field.onChange(convertPresetIdToNumber(value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Buy Now Fields */}
        <div className="flex w-full flex-col px-3">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <SellBuyInputAmount
                    quickPickList={
                      presetData[convertNumberToPresetKey(form.watch("preset"))]
                        ?.amounts.length == 6
                        ? presetData[
                            convertNumberToPresetKey(form.watch("preset"))
                          ]?.amounts
                        : DEFAULT_QUICK_PICK_SOL_LIST
                    }
                    {...field}
                    setPickerValue={setPicker}
                    pickerValue={picker}
                    lastFocusOn={lastFocusOn}
                    setLastFocusOn={setLastFocusOn}
                    type="buy"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Advanced Settings */}
        <motion.div
          animate={openAdvanceSettings ? "open" : "closed"}
          className="h-auto w-full px-4"
        >
          {/* Advanced Settings Header */}
          <button
            type="button"
            disabled={autoFeeEnabled}
            onClick={handleToggle}
            className="flex h-[48px] w-full items-center justify-between"
          >
            <div className="flex items-center gap-x-2">
              <div className="relative aspect-square h-[18px] w-[18px] focus:border-none focus:outline-none focus:ring-0">
                <Image
                  src="/icons/setting-primary.svg"
                  alt="Gray Setting Icon"
                  fill
                  quality={50}
                  unoptimized
                  className="object-contain"
                />
              </div>
              <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                Advanced Settings
              </span>
            </div>
            <div className="flex items-center gap-1">
              {autoFeeEnabled && <SuperNovaActived />}

              <div className="relative aspect-square h-6 w-6 flex-shrink-0 cursor-pointer">
                <Image
                  src="/icons/pink-chevron-down.png"
                  alt="Accordion Icon"
                  fill
                  quality={50}
                  unoptimized
                  className={`object-contain transition-transform duration-300 ${
                    openAdvanceSettings ? "rotate-180" : "rotate-0"
                  }`}
                />
              </div>
            </div>
          </button>

          <AnimatePresence>
            {openAdvanceSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="flex w-full flex-col gap-y-4 pb-4 pt-3">
                  <div className="grid h-[58px] w-full grid-cols-3 gap-x-3">
                    {/* Slippage */}
                    <FormField
                      control={form.control}
                      name="slippage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slippage</FormLabel>
                          <FormControl>
                            <Input
                              disabled={autoFeeEnabled}
                              type="number"
                              {...field}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                if (value < 0 || value > 100) return;
                                field.onChange(value);
                              }}
                              placeholder="1-100"
                              suffixEl={
                                <span className="absolute right-3.5 text-sm text-fontColorSecondary">
                                  %
                                </span>
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* MEV Protect */}
                    <FormField
                      control={form.control}
                      name="mev_protect"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            MEV Protect
                            <LabelStatusIndicator
                              status={field.value ? "ON" : "OFF"}
                            />
                          </FormLabel>
                          <FormControl>
                            <OnOffToggle
                              disabled={autoFeeEnabled}
                              value={field.value ? "ON" : "OFF"}
                              setValue={(value) =>
                                field.onChange(value === "ON")
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Auto Tip */}
                    <FormField
                      control={form.control}
                      name="auto_tip"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            Auto-Tip
                            <LabelStatusIndicator
                              status={field.value ? "ON" : "OFF"}
                            />
                          </FormLabel>
                          <FormControl>
                            <OnOffToggle
                              disabled={autoFeeEnabled}
                              value={field.value ? "ON" : "OFF"}
                              setValue={(value) =>
                                field.onChange(value === "ON")
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Fee and Tip Fields */}
                  <div className="grid h-[58px] w-full grid-cols-2 gap-x-3">
                    <FormField
                      control={form.control}
                      name="fee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority Fee</FormLabel>
                          <FormControl>
                            <Input
                              disabled={autoFeeEnabled}
                              type="number"
                              isNumeric
                              decimalScale={9}
                              {...field}
                              onNumericValueChange={(values) => {
                                const newValue =
                                  values.floatValue === undefined
                                    ? 0
                                    : values.floatValue;
                                field.onChange(newValue);
                              }}
                              placeholder="0.0"
                              prefixEl={
                                <div className="absolute left-3.5 aspect-square h-4 w-4">
                                  <CachedImage
                                    src="/icons/solana-sq.svg"
                                    alt="Solana Icon"
                                    fill
                                    quality={50}
                                    unoptimized
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

                    <FormField
                      control={form.control}
                      name="tip"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Buy Tip</FormLabel>
                          <FormControl>
                            <Input
                              disabled={autoFeeEnabled}
                              type="number"
                              isNumeric
                              decimalScale={9}
                              {...field}
                              onNumericValueChange={(values) => {
                                const newValue =
                                  values.floatValue === undefined
                                    ? 0
                                    : values.floatValue;
                                field.onChange(newValue);
                              }}
                              placeholder="0.0"
                              prefixEl={
                                <div className="absolute left-3.5 aspect-square h-4 w-4">
                                  <CachedImage
                                    src="/icons/solana-sq.svg"
                                    alt="Solana Icon"
                                    fill
                                    quality={50}
                                    unoptimized
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
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* CTA */}
        <div className="flex w-full flex-col gap-y-2 px-4 pb-4">
          <BaseButton
            type="submit"
            variant="primary"
            className="w-full"
            disabled={mutation.isPending}
            prefixIcon={
              <div className="relative aspect-square h-[18px] w-[18px] focus:border-none focus:outline-none focus:ring-0">
                <Image
                  src="/icons/black-quickbuy.png"
                  alt="Black Quick Buy Icon"
                  fill
                  quality={50}
                  unoptimized
                  className="object-contain"
                />
              </div>
            }
          >
            <span className="inline-block text-nowrap font-geistSemiBold text-base text-[#080811]">
              {mutation.isPending
                ? "Processing..."
                : `Quick Buy ${lastFocusOn == "picker" ? picker : form.watch("amount") || "0"} SOL`}
            </span>
          </BaseButton>
          <p className="text-center text-xs text-fontColorSecondary">
            Once you click on Quick Buy, your transaction is sent immediately
            {isAutoSaving && (
              <span className="ml-1 text-green-400">• Auto saving</span>
            )}
          </p>
        </div>
      </form>
    </Form>
  );
}

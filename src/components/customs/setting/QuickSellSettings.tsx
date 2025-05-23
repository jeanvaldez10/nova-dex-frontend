"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState, useEffect, useRef } from "react";
import {
  QuickSellAmount,
  useQuickSellSettingsStore,
} from "@/stores/setting/use-quick-sell-settings.store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
// ######## Components 🧩 ########
import Image from "next/image";
import SettingGridCard from "../cards/setting/SettingGridCard";
import CustomToast from "@/components/customs/toasts/CustomToast";
import toast from "react-hot-toast";
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
import OnOffToggle from "../OnOffToggle";
import { Input } from "@/components/ui/input";
import {
  QuickSellPresetRequest,
  quickSellPresetSchema,
  updateQuickSellPreset,
} from "@/apis/rest/settings/settings";
import ProcessorSelectionButton from "../ProcessorSelectionButton";
import CustomQuickBuyAndSellInput from "./CustomQuickBuyAndSellInput";
import PresetButtonSelection from "./PresetButtonSelection";
import { PresetId, PresetKey } from "@/types/preset";
import {
  convertPresetIdToKey,
  convertPresetKeyToId,
} from "@/utils/convertPreset";
import { DEFAULT_QUICK_PICK_PERCENTAGE_LIST } from "../SellBuyInputAmount";
import debounce from "lodash/debounce";
import isEqual from "lodash/isEqual";
import { CachedImage } from "../CachedImage";

const DEFAULT_QUICK_SELL_AMOUNTS = [10, 30, 50, 70, 90, 100];

// Update the QuickSellAmount extension
interface ExtendedQuickSellAmount {
  order: number;
  amount: number;
}

// Add props interface to accept state handlers from parent
interface QuickSellSettingsProps {
  setIsSaving?: (isSaving: boolean) => void;
  setActiveFormId?: (formId: string) => void;
  formId?: string;
  autoSave?: boolean;
}

export default function QuickSellSettings({
  setIsSaving,
  setActiveFormId,
  formId = "quick-sell-settings-form",
  autoSave = false,
}: QuickSellSettingsProps) {
  const queryClient = useQueryClient();
  const { activePreset, presets, setActivePreset } =
    useQuickSellSettingsStore();
  const [selectedPreset, setSelectedPreset] = useState<PresetKey>(activePreset);
  const [isMEVEnabled, setIsMEVEnabled] = useState<boolean>(true);
  const [localQuickSellAmount, setLocalQuickSellAmount] = useState<
    ExtendedQuickSellAmount[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Inform parent component about this form's ID
  useEffect(() => {
    if (setActiveFormId) {
      setActiveFormId(formId);
    }
  }, [setActiveFormId, formId]);

  // Form setup with default values
  const form = useForm<QuickSellPresetRequest>({
    resolver: zodResolver(quickSellPresetSchema),
    defaultValues: {
      preset: activePreset.replace("preset", ""),
      slippage: presets[activePreset]?.slippage || 0,
      autoTipEnabled: presets[activePreset]?.autoTipEnabled || false,
      fee: presets[activePreset]?.fee || 0,
      tip: presets[activePreset]?.tip || 0,
      processor:
        presets[activePreset]?.processor === "secure"
          ? "Jito"
          : presets[activePreset]?.processor || "Jito",
      amounts: presets[activePreset]?.amounts,
    },
  });

  // Reset form and local state when preset changes
  const currentPreset = presets[selectedPreset];
  useEffect(() => {
    if (currentPreset) {
      form.reset({
        preset: selectedPreset.replace("preset", ""),
        slippage: currentPreset?.slippage || 0,
        autoTipEnabled: currentPreset?.autoTipEnabled || false,
        fee: currentPreset?.fee || 0,
        tip: currentPreset?.tip || 0,
        processor: currentPreset?.processor || "Jito",
        amounts: currentPreset?.amounts || DEFAULT_QUICK_SELL_AMOUNTS,
      });

      setLocalQuickSellAmount(
        (currentPreset?.amounts && currentPreset?.amounts?.length == 6
          ? currentPreset?.amounts
          : DEFAULT_QUICK_PICK_PERCENTAGE_LIST
        )?.map((amount, index) => ({
          order: index + 1,
          amount: Number(amount),
        })),
      );
      setIsMEVEnabled(
        currentPreset?.processor === "secure" ||
          currentPreset?.processor === "Jito",
      );
    }
    setIsLoading(false);
  }, [selectedPreset, presets]);

  // Handle MEV toggle
  const handleChangeMEVStatus = (status: "ON" | "OFF") => {
    // If MEV protection is turned ON, force processor to JITO
    if (status === "ON") {
      form.setValue("processor", "Jito");
    }
    // If turning MEV OFF and current processor is JITO, default to NODE
    else if (form.getValues()?.processor === "Jito") {
      form.setValue("processor", "Node");
    }
    setIsMEVEnabled(status === "ON");
  };

  // Handle amount changes locally
  const handleChangeQuickSellAmount = (order: number, value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const numValue = value === "" ? "" : parseFloat(value);

      // Validate the number is between 0 and 100
      if (typeof numValue === "number" && numValue > 100) {
        return;
      }

      const newAmounts = localQuickSellAmount.map((item) =>
        item.order === order
          ? {
              ...item,
              amount: numValue,
            }
          : item,
      ) as ExtendedQuickSellAmount[];

      setLocalQuickSellAmount(newAmounts);

      // Only update form with valid numbers
      if (value !== "") {
        const validAmounts = newAmounts.map((item) => ({
          ...item,
          amount: typeof item.amount === "number" ? item.amount : 1,
        }));

        form.setValue(
          "amounts",
          validAmounts.map((item) => item.amount),
        );
      }
    }
  };

  // Handle for onBlur
  const handleBlurQuickSellAmount = (order: number) => {
    const newAmounts = localQuickSellAmount.map((item) => {
      if (item.order === order) {
        const numValue = typeof item.amount === "number" ? item.amount : 1;
        return { ...item, amount: Math.min(Math.max(numValue, 0), 100) };
      }
      return item;
    });

    setLocalQuickSellAmount(newAmounts);
    form.setValue(
      "amounts",
      newAmounts.map((item) =>
        typeof item.amount === "number" ? item.amount : 1,
      ),
    );
  };

  // Update mutation with refetch
  const updateSettingsMutation = useMutation({
    mutationFn: updateQuickSellPreset,
    onMutate: () => {
      // Inform parent component that saving is in progress
      if (setIsSaving) {
        setIsSaving(true);
      }
    },
    onSuccess: () => {
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Settings updated successfully"
          state="SUCCESS"
        />
      ));
      // Refetch settings after successful update
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      // Inform parent component that saving is complete
      if (setIsSaving) {
        setIsSaving(false);
      }
    },
    onError: (error: Error) => {
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message={error.message}
          state="ERROR"
        />
      ));
      // Inform parent component that saving is complete (but with error)
      if (setIsSaving) {
        setIsSaving(false);
      }
    },
  });

  // Handle preset change
  const handlePresetChange = (id: PresetId) => {
    const key = convertPresetIdToKey(id);
    setSelectedPreset(key);
    setActivePreset(key);
    form.setValue("preset", key.replace("preset", ""));
  };

  // Handle form submission
  const onSubmit = (data: QuickSellPresetRequest) => {
    const isDuplicateAmount = localQuickSellAmount.some((item, index) =>
      localQuickSellAmount
        .slice(index + 1)
        .some((i) => i.amount === item.amount),
    );
    // if (isDuplicateAmount) {
    //   toast.custom((t: any)=> (
    //     <CustomToast
    //       tVisibleState={t.visible}
    //       message="Duplicate amounts are not allowed"
    //       state="ERROR"
    //     />
    //   ));
    //   return;
    // }

    const submitData = {
      ...data,
      preset: data.preset.replace("preset", ""),
    };
    updateSettingsMutation.mutate(submitData);
  };

  const handleChangeSelectedProcessor = (value: string) => {
    // If selecting JITO, enable MEV protection
    if (value === "Jito") {
      setIsMEVEnabled(true);
    }
    // If selecting NODE or ULTRA, disable MEV protection
    else {
      setIsMEVEnabled(false);
    }
    form.setValue("processor", value);
  };

  useEffect(() => {
    if (!autoSave) return;
    const debouncedCb = debounce((formValue) => {
      const prevValue = {
        ...currentPreset,
        preset: selectedPreset.replace("preset", ""),
      };

      if (!isEqual(prevValue, formValue)) {
        form.handleSubmit(onSubmit)();
      }
    }, 800);

    const subscription = form.watch(debouncedCb);

    return () => {
      subscription.unsubscribe();
      form.watch(debouncedCb).unsubscribe();
      debouncedCb.cancel();
    };
  }, [form.watch, autoSave, currentPreset]);

  return (
    <div className="relative flex h-auto w-full flex-grow flex-col rounded-[8px]">
      <PresetButtonSelection
        onClick={handlePresetChange}
        value={convertPresetKeyToId(selectedPreset)}
      />
      <Form {...form}>
        <form
          id={formId}
          onSubmit={(e) => {
            e.preventDefault();
            const finalData = {
              ...form.getValues(),
              slippage: Number(form.getValues().slippage) || 1,
            };
            form.reset(finalData);
            form.handleSubmit(onSubmit)(e);
          }}
          className="flex w-full flex-grow flex-col justify-between rounded-b-[8px] bg-[#1B1B24]"
        >
          <div className="flex w-full flex-col">
            <div className="grid w-full grid-cols-1 xl:grid-cols-2">
              <SettingGridCard
                label="Slippage"
                description="The amount of tokens you may lose due to price volatility."
                className="border-border md:border-b xl:border-r"
              >
                <FormField
                  control={form.control}
                  name="slippage"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (value < 0 || value > 100) return;
                            field.onChange(value);
                          }}
                          placeholder="1-100"
                          suffixEl={
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-fontColorSecondary">
                              %
                            </span>
                          }
                          parentClassName="md:max-w-[240px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </SettingGridCard>
              <SettingGridCard
                label="Auto-Tip"
                description="Automatically judges the best tip and applies it to your transaction."
                className="border-border md:border-b"
                indicator={form.getValues().autoTipEnabled ? "ON" : "OFF"}
              >
                <OnOffToggle
                  variant="dark"
                  value={form.watch("autoTipEnabled") ? "ON" : "OFF"}
                  setValue={(value) =>
                    form.setValue("autoTipEnabled", value === "ON")
                  }
                  className="h-[32px] md:w-[240px]"
                />
              </SettingGridCard>
            </div>
            {!form.watch("autoTipEnabled") && (
              <div className="grid w-full grid-cols-1 xl:grid-cols-2">
                <SettingGridCard
                  label="Sell Fee"
                  description="The amount of extra SOL paid for validators to pick up your transaction."
                  className="border-border md:border-b xl:border-r"
                >
                  <FormField
                    control={form.control}
                    name="fee"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            isNumeric
                            decimalScale={9}
                            {...field}
                            onNumericValueChange={(values) => {
                              const newValue =
                                values.floatValue === undefined
                                  ? 1
                                  : values.floatValue;
                              field.onChange(newValue);
                            }}
                            placeholder="0.0"
                            prefixEl={
                              <div className="absolute left-3.5 aspect-square h-4 w-4 flex-shrink-0">
                                <CachedImage
                                  src="/icons/solana-sq.svg"
                                  alt="Solana SQ Icon"
                                  fill
                                  quality={50}
                                  className="object-contain"
                                />
                              </div>
                            }
                            parentClassName="md:max-w-[240px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </SettingGridCard>
                <SettingGridCard
                  label="Sell Tip"
                  description="An additional tip to incentivise validators to pick up your transactions faster."
                  className="border-border md:border-b"
                >
                  <FormField
                    control={form.control}
                    name="tip"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
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
                              <div className="absolute left-3.5 aspect-square h-4 w-4 flex-shrink-0">
                                <CachedImage
                                  src="/icons/solana-sq.svg"
                                  alt="Solana SQ Icon"
                                  fill
                                  quality={50}
                                  className="object-contain"
                                />
                              </div>
                            }
                            parentClassName="md:max-w-[240px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </SettingGridCard>
              </div>
            )}
            <div className="grid w-full grid-cols-1 xl:grid-cols-2">
              <SettingGridCard
                label="Smart-Mev Protection"
                description="Protect your transaction from MEV Attacks."
                className="border-border md:border-b xl:border-r"
                indicator={isMEVEnabled ? "ON" : "OFF"}
              >
                <OnOffToggle
                  variant="dark"
                  value={isMEVEnabled ? "ON" : "OFF"}
                  setValue={handleChangeMEVStatus}
                  className="h-[32px] md:w-[240px]"
                />
              </SettingGridCard>
              <SettingGridCard
                label="Processor"
                description="Different processors to optimise your trading speeds."
                className="border-border md:border-b xl:border-r"
              >
                <ProcessorSelectionButton
                  variant="dark"
                  setValue={handleChangeSelectedProcessor}
                  value={
                    currentPreset?.processor === "secure"
                      ? "Jito"
                      : form.watch("processor")
                  }
                  template={["Jito", "Node", "Ultra"]}
                  className="max-w-[356px]"
                />
              </SettingGridCard>
            </div>
            <div className="grid w-full grid-cols-1 xl:grid-cols-2">
              <SettingGridCard
                label="Customize"
                description="Change your Quick Sell buttons with your own amounts."
                className="border-border xl:border-r"
              >
                <CustomQuickBuyAndSellInput
                  presetAmount={
                    currentPreset?.amounts && currentPreset?.amounts.length == 6
                      ? currentPreset?.amounts
                      : DEFAULT_QUICK_PICK_PERCENTAGE_LIST
                  }
                  type="sell"
                  values={localQuickSellAmount}
                  onChange={(order, value) => {
                    const clampedValue = Math.min(
                      Math.max(Number(value), 1),
                      100,
                    );
                    handleChangeQuickSellAmount(order, clampedValue.toString());
                  }}
                  onBlur={(order) => handleBlurQuickSellAmount(order)}
                />
              </SettingGridCard>
              <SettingGridCard className="border-border" isInvisible />
            </div>
          </div>

          {/* Mobile Save button - only visible on mobile */}
          <div className="fixed bottom-9 left-0 flex h-[72px] w-full items-center justify-end border-t border-border bg-card p-4 md:hidden">
            <BaseButton
              type="submit"
              variant="primary"
              className="h-[40px] w-full px-8"
              disabled={updateSettingsMutation.isPending}
            >
              <span className="inline-block font-geistSemiBold text-base text-[#080811]">
                {updateSettingsMutation.isPending ? "Saving..." : "Save"}
              </span>
            </BaseButton>
          </div>
        </form>
      </Form>
    </div>
  );
}

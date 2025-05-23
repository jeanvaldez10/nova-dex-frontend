import { useCustomizeSettingsStore } from "@/stores/setting/use-customize-settings.store";
import { useMemo } from "react";
import { cn } from "@/libraries/utils";
import CustomizedBuyButtonSettings from "./CustomizedBuyButtonSettings";
import {
  AvatarSetting,
  ButtonSetting,
  ColorSetting,
  customButtonSettingsSchema,
  FontSetting,
  SocialSetting,
} from "@/apis/rest/settings/settings";
import { useForm } from "react-hook-form";
import CustomToast from "@/components/customs/toasts/CustomToast";
import toast from "react-hot-toast";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomizedFontSettings from "./CustomizedFontSettings";
import CustomizedAvatarSettings from "./CustomizedAvatarSettings";
import CustomizedSocialSettings from "./CustomizedSocialSettings";
import { Form } from "@/components/ui/form";

interface CustomizeSettingsProps {
  formId?: string;
  autoSave?: boolean;
}

type FormData = {
  buttonSetting: ButtonSetting;
  fontSetting: FontSetting;
  colorSetting: ColorSetting;
  avatarSetting: AvatarSetting;
  socialSetting: SocialSetting;
};

const buttonOptions = [
  { label: "Normal", value: "normal" },
  { label: "Large", value: "large" },
  { label: "Extra Large", value: "extralarge" },
  { label: "Double Extra Large", value: "doubleextralarge" },
];

const fontOptions = [
  { label: "Normal", value: "normal" },
  { label: "Large", value: "large" },
  { label: "Extra Large", value: "extralarge" },
  { label: "Double Extra Large", value: "doubleextralarge" },
];

const colorOptions = [
  { label: "Normal", value: "normal" },
  { label: "Blue", value: "blue" },
  { label: "Purple", value: "purple" },
  { label: "Fluorescent Blue", value: "fluorescentblue" },
  { label: "Neutral", value: "neutral" },
  { label: "Lemon", value: "lemon" },
];

const avatarOptions = [
  { label: "Normal", value: "normal" },
  { label: "Large", value: "large" },
  { label: "Extra Large", value: "extralarge" },
  { label: "Double Extra Large", value: "doubleextralarge" },
];

const socialOptions = [
  { label: "Normal", value: "normal" },
  { label: "Large", value: "large" },
  { label: "Extra Large", value: "extralarge" },
  { label: "Double Extra Large", value: "doubleextralarge" },
];

function CustomizeSettings({
  formId = "customize-settings-form",
  autoSave = false,
}: CustomizeSettingsProps) {
  const { presets, updatePreset, activePreset } = useCustomizeSettingsStore();
  const finalActivePreset = activePreset || "preset1";

  const form = useForm<FormData>({
    resolver: zodResolver(customButtonSettingsSchema),
    defaultValues: {
      buttonSetting: presets[finalActivePreset].buttonSetting || "normal",
      fontSetting: presets[finalActivePreset].fontSetting || "normal",
      colorSetting: presets[finalActivePreset].colorSetting || "normal",
      avatarSetting: presets[finalActivePreset].avatarSetting || "normal",
      socialSetting: presets[finalActivePreset].socialSetting || "normal",
    },
  });

  const handleOptionChange = (
    value:
      | ButtonSetting
      | FontSetting
      | ColorSetting
      | AvatarSetting
      | SocialSetting,
    type:
      | "buttonSetting"
      | "fontSetting"
      | "colorSetting"
      | "avatarSetting"
      | "socialSetting",
  ) => {
    form.setValue(type, value);

    if (autoSave) form.handleSubmit(onSubmit)();
  };

  const onSubmit = () => {
    updatePreset(finalActivePreset, {
      buttonSetting: form.getValues("buttonSetting"),
      fontSetting: form.getValues("fontSetting"),
      colorSetting: form.getValues("colorSetting"),
      avatarSetting: form.getValues("avatarSetting"),
      socialSetting: form.getValues("socialSetting"),
    });

    toast.custom((t: any) => (
      <CustomToast
        tVisibleState={t.visible}
        message="Setting preference saved"
        state="SUCCESS"
      />
    ));
  };

  const selectedOption = useMemo(() => {
    return presets[finalActivePreset].buttonSetting;
  }, [presets, finalActivePreset, form.getValues("buttonSetting")]);

  const selectedFontOption = useMemo(() => {
    return presets[finalActivePreset].fontSetting;
  }, [presets, finalActivePreset, form.getValues("fontSetting")]);

  const selectedColorOption = useMemo(() => {
    return presets[finalActivePreset].colorSetting;
  }, [presets, finalActivePreset, form.getValues("colorSetting")]);

  const selectedAvatarOption = useMemo(() => {
    return presets[finalActivePreset].avatarSetting;
  }, [presets, finalActivePreset, form.getValues("avatarSetting")]);

  const selectedSocialOption = useMemo(() => {
    return presets[finalActivePreset].socialSetting;
  }, [presets, finalActivePreset, form.getValues("socialSetting")]);

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="relative h-auto w-full flex-grow flex-col gap-y-4 overflow-hidden rounded-[8px]"
      >
        <div className="flex size-7 h-full w-full flex-col items-center justify-center gap-3 pt-10 md:hidden">
          <Image
            src="/images/only-on-desktop.png"
            alt="Only Available on Desktop"
            width={180}
            height={120}
            className="mb-4"
          />
          <h3 className="text-center font-geistSemiBold text-2xl text-fontColorPrimary">
            Only Available on Desktop
          </h3>
          <p className="text-md text-center font-geistRegular text-fontColorSecondary">
            This feature is currently optimized for desktop use. Please switch
            to a desktop device for the best experience.
          </p>
        </div>

        {/* Button Size */}
        <section className="mb-4 flex flex-col gap-y-2 bg-none">
          <p className="font-geistSemiBold text-sm text-white">Button Size</p>
          <div className="relative hidden grid-cols-2 gap-[1.5px] bg-[#242436] md:grid">
            {buttonOptions.map((option) => (
              <div key={option.value} className="bg-[#12121a] p-[16px]">
                <button
                  type="button"
                  onClick={() =>
                    handleOptionChange(
                      option.value as ButtonSetting,
                      "buttonSetting",
                    )
                  }
                  className={cn(
                    "relative flex w-full flex-col overflow-hidden rounded-[8px] border-[1.5px] border-[#242436] px-2 py-5 font-geistSemiBold text-xs text-[#9191A4] transition duration-300 hover:bg-primary/10",
                    selectedOption === option.value &&
                      "border-primary bg-primary/15",
                  )}
                >
                  {selectedOption === option.value && (
                    <Image
                      alt="check"
                      src="/icons/setting/checked-custom.svg"
                      width={24}
                      height={24}
                      className="absolute right-0 top-0"
                    />
                  )}
                  <div className="flex flex-col items-center gap-1.5">
                    <CustomizedBuyButtonSettings
                      option={option.value as ButtonSetting}
                    />
                    <p
                      className={
                        selectedOption === option.value
                          ? "text-[#DF74FF]"
                          : "text-[#9191A4] hover:text-white"
                      }
                    >
                      {option.label}
                    </p>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Font Size */}
        <section className="mb-4 flex flex-col gap-y-2 bg-none">
          <p className="font-geistSemiBold text-sm text-white">Font Size</p>
          <div className="relative hidden grid-cols-2 gap-[1.5px] bg-[#242436] md:grid">
            {fontOptions.map((option) => (
              <div key={option.value} className="bg-[#12121a] p-[16px]">
                <button
                  type="button"
                  onClick={() =>
                    handleOptionChange(
                      option.value as FontSetting,
                      "fontSetting",
                    )
                  }
                  className={cn(
                    "relative flex w-full flex-col overflow-hidden rounded-[8px] border-[1.5px] border-[#242436] px-2 py-5 font-geistSemiBold text-xs text-[#9191A4] transition duration-300 hover:bg-primary/10",
                    selectedFontOption === option.value &&
                      "border-primary bg-primary/15",
                  )}
                >
                  {selectedFontOption === option.value && (
                    <Image
                      alt="check"
                      src="/icons/setting/checked-custom.svg"
                      width={24}
                      height={24}
                      className="absolute right-0 top-0"
                    />
                  )}
                  <div className="flex flex-col items-center gap-1.5">
                    <CustomizedFontSettings
                      font={option.value as FontSetting}
                    />
                    <p
                      className={
                        selectedFontOption === option.value
                          ? "text-[#DF74FF]"
                          : "text-[#9191A4] hover:text-white"
                      }
                    >
                      {option.label}
                    </p>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Color */}
        <section className="mb-4 flex flex-col gap-y-2 bg-none">
          <p className="font-geistSemiBold text-sm text-white">Color</p>

          <div className="relative hidden grid-cols-2 gap-[1.5px] bg-[#242436] md:grid">
            {colorOptions.map((option) => (
              <div key={option.value} className="bg-[#12121a] p-[16px]">
                <button
                  type="button"
                  onClick={() =>
                    handleOptionChange(
                      option.value as ColorSetting,
                      "colorSetting",
                    )
                  }
                  className={cn(
                    "relative flex w-full flex-col overflow-hidden rounded-[8px] border-[1.5px] border-[#242436] px-2 py-5 font-geistSemiBold text-xs text-[#9191A4] transition duration-300 hover:bg-primary/10",
                    selectedColorOption === option.value &&
                      "border-primary bg-primary/15",
                  )}
                >
                  {selectedColorOption === option.value && (
                    <Image
                      alt="check"
                      src="/icons/setting/checked-custom.svg"
                      width={24}
                      height={24}
                      className="absolute right-0 top-0"
                    />
                  )}
                  <div className="flex flex-col items-center gap-1.5">
                    <CustomizedFontSettings
                      color={option.value as ColorSetting}
                    />
                    <p
                      className={
                        selectedColorOption === option.value
                          ? "text-[#DF74FF]"
                          : "text-[#9191A4] hover:text-white"
                      }
                    >
                      {option.label}
                    </p>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Token Avatar */}
        <section className="mb-4 flex flex-col gap-y-2 bg-none">
          <p className="font-geistSemiBold text-sm text-white">Token Avatar</p>

          <div className="relative hidden grid-cols-2 gap-[1.5px] bg-[#242436] md:grid">
            {avatarOptions.map((option) => (
              <div key={option.value} className="bg-[#12121a] p-[16px]">
                <button
                  type="button"
                  onClick={() =>
                    handleOptionChange(
                      option.value as AvatarSetting,
                      "avatarSetting",
                    )
                  }
                  className={cn(
                    "relative flex w-full flex-col overflow-hidden rounded-[8px] border-[1.5px] border-[#242436] px-2 py-5 font-geistSemiBold text-xs text-[#9191A4] transition duration-300 hover:bg-primary/10",
                    selectedAvatarOption === option.value &&
                      "border-primary bg-primary/15",
                  )}
                >
                  {selectedAvatarOption === option.value && (
                    <Image
                      alt="check"
                      src="/icons/setting/checked-custom.svg"
                      width={24}
                      height={24}
                      className="absolute right-0 top-0"
                    />
                  )}
                  <div className="flex flex-col items-center gap-1.5">
                    <CustomizedAvatarSettings
                      option={option.value as AvatarSetting}
                    />
                    <p
                      className={
                        selectedAvatarOption === option.value
                          ? "text-[#DF74FF]"
                          : "text-[#9191A4] hover:text-white"
                      }
                    >
                      {option.label}
                    </p>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Social Icon */}
        <section className="mb-4 flex flex-col gap-y-2 bg-none">
          <p className="font-geistSemiBold text-sm text-white">Social Icon</p>=
          <div className="relative hidden grid-cols-2 gap-[1.5px] bg-[#242436] md:grid">
            {socialOptions.map((option) => (
              <div key={option.value} className="bg-[#12121a] p-[16px]">
                <button
                  type="button"
                  onClick={() =>
                    handleOptionChange(
                      option.value as SocialSetting,
                      "socialSetting",
                    )
                  }
                  className={cn(
                    "relative flex w-full flex-col overflow-hidden rounded-[8px] border-[1.5px] border-[#242436] px-2 py-5 font-geistSemiBold text-xs text-[#9191A4] transition duration-300 hover:bg-primary/10",
                    selectedSocialOption === option.value &&
                      "border-primary bg-primary/15",
                  )}
                >
                  {selectedSocialOption === option.value && (
                    <Image
                      alt="check"
                      src="/icons/setting/checked-custom.svg"
                      width={24}
                      height={24}
                      className="absolute right-0 top-0"
                    />
                  )}
                  <div className="flex flex-col items-center gap-1.5 gap-y-4">
                    <CustomizedSocialSettings
                      option={option.value as SocialSetting}
                    />
                    <p
                      className={
                        selectedSocialOption === option.value
                          ? "text-[#DF74FF]"
                          : "text-[#9191A4] hover:text-white"
                      }
                    >
                      {option.label}
                    </p>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </section>
      </form>
    </Form>
  );
}

export default CustomizeSettings;

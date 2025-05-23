"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React from "react";
import { useCustomizeSettingsStore } from "@/stores/setting/use-customize-settings.store";
// ######## Components 🧩 ########
import TwitterHoverPopover from "@/components/customs/TwitterHoverPopover";
import TwitterCommentHoverPopover from "@/components/customs/TwitterCommentHoverPopover";
import InstagramPopover from "@/components/customs/InstagramPopover";
import TruthSocialHoverPopover from "@/components/customs/TruthSocialHoverPopover";
import SocialLinkButton from "@/components/customs/buttons/SocialLinkButton";
import TiktokHoverPopover from "@/components/customs/TiktokHoverPopover";

const iconSizeContainerMap = {
  normal: "!size-[20px]",
  large: "!size-[22px]",
  extralarge: "!size-[24px]",
  doubleextralarge: "!size-[28px]",
};

const iconSizeMap = {
  normal: "!size-[16px]",
  large: "!size-[18px]",
  extralarge: "!size-[20px]",
  doubleextralarge: "!size-[24px]",
};

const SocialLinks = React.memo(
  ({
    dex,
    isFirst,
    twitter,
    mint,
    telegram,
    website,
    youtube,
    tiktok,
    instagram,
    twitterStatusPopoverAlignment,
    unoptimized = false,
  }: {
    dex:
      | "Pump.Fun"
      | "Moonshot"
      | "LaunchLab"
      | "Boop"
      | "Dynamic Bonding Curve"
      | "Meteora DLMM"
      | "Meteora DYN"
      | "Raydium"
      | "Pump.Swap";
    isFirst: boolean;
    twitter?: string;
    mint?: string;
    telegram?: string;
    website?: string;
    youtube?: string;
    tiktok?: string;
    instagram?: string;
    twitterStatusPopoverAlignment?: "center" | "end" | "start";
    unoptimized?: boolean;
  }) => {
    const customizedSettingPresets = useCustomizeSettingsStore(
      (state) => state.presets,
    );
    const customizedSettingActivePreset = useCustomizeSettingsStore(
      (state) => state.activePreset,
    );

    const currentSocialPreset =
      customizedSettingPresets[customizedSettingActivePreset].socialSetting ||
      "normal";
    return (
      <div
        id={isFirst ? "social-links-first" : undefined}
        className="relative z-20 flex items-center gap-x-1"
      >
        {twitter &&
          !twitter.includes("status") &&
          !twitter.includes("communities") &&
          !twitter.includes("truthsocial.com") && (
            <TwitterHoverPopover
              variant="primary"
              href={twitter}
              containerSize={iconSizeContainerMap[currentSocialPreset]}
              iconSize={iconSizeMap[currentSocialPreset]}
            />
          )}

        {twitter &&
          twitter.includes("status") &&
          !twitter.includes("communities") &&
          !twitter.includes("truthsocial.com") && (
            <TwitterCommentHoverPopover
              align={twitterStatusPopoverAlignment}
              variant="primary"
              href={twitter}
              containerSize={iconSizeContainerMap[currentSocialPreset]}
              iconSize={iconSizeMap[currentSocialPreset]}
            />
          )}

        {mint && (dex === "Pump.Fun" || dex === "Pump.Swap") && (
          <SocialLinkButton
            unoptimized
            containerSize={iconSizeContainerMap[currentSocialPreset]}
            iconSize={iconSizeMap[currentSocialPreset]}
            variant={"primary"}
            size="sm"
            href={`https://pump.fun/${mint}`}
            icon="pumpfun"
            label="Pumpfun"
            typeImage="svg"
          />
        )}

        {telegram && (
          <SocialLinkButton
            unoptimized
            containerSize={iconSizeContainerMap[currentSocialPreset]}
            iconSize={iconSizeMap[currentSocialPreset]}
            variant={"primary"}
            size="sm"
            href={telegram}
            icon="telegram-white"
            label="Telegram"
            typeImage="svg"
          />
        )}
        {website &&
          (website.includes("truthsocial.com") && website.includes("posts") ? (
            <TruthSocialHoverPopover
              url={website}
              unoptimized={unoptimized}
              containerSize={iconSizeContainerMap[currentSocialPreset]}
              iconSize={iconSizeMap[currentSocialPreset]}
            />
          ) : website.includes("truthsocial.com") ? (
            <SocialLinkButton
              unoptimized
              containerSize={iconSizeContainerMap[currentSocialPreset]}
              iconSize={iconSizeMap[currentSocialPreset]}
              variant={"primary"}
              size="sm"
              href={website}
              icon="truthsocial"
              label="Truth Social"
              typeImage="svg"
            />
          ) : (
            <SocialLinkButton
              unoptimized
              containerSize={iconSizeContainerMap[currentSocialPreset]}
              iconSize={iconSizeMap[currentSocialPreset]}
              variant={"primary"}
              size="sm"
              href={website}
              icon="website"
              label="Website"
              typeImage="svg"
            />
          ))}
        {/* Special Case */}
        {twitter &&
          (twitter.includes("truthsocial.com") && twitter.includes("posts") ? (
            <TruthSocialHoverPopover
              url={twitter}
              unoptimized={unoptimized}
              containerSize={iconSizeContainerMap[currentSocialPreset]}
              iconSize={iconSizeMap[currentSocialPreset]}
            />
          ) : (
            twitter.includes("truthsocial.com") && (
              <SocialLinkButton
                unoptimized
                containerSize={iconSizeContainerMap[currentSocialPreset]}
                iconSize={iconSizeMap[currentSocialPreset]}
                variant={"primary"}
                size="sm"
                href={twitter}
                icon="truthsocial"
                label="Truth Social"
                typeImage="svg"
              />
            )
          ))}

        {youtube && (
          <SocialLinkButton
            unoptimized
            containerSize={iconSizeContainerMap[currentSocialPreset]}
            iconSize={iconSizeMap[currentSocialPreset]}
            variant={"primary"}
            size="sm"
            href={youtube ?? ""}
            icon="youtube-white"
            label="YouTube"
            typeImage="svg"
          />
        )}

        <InstagramPopover
          href={"https://www.instagram.com/reel/DJFvFiJJyFw"}
          containerSize={iconSizeContainerMap[currentSocialPreset]}
          iconSize={iconSizeMap[currentSocialPreset]}
        />
        {Boolean(instagram) && (
          <>
            {instagram?.includes("instagram.com") &&
            instagram?.includes("p") ? (
              <InstagramPopover
                href={instagram}
                containerSize={iconSizeContainerMap[currentSocialPreset]}
                iconSize={iconSizeMap[currentSocialPreset]}
              />
            ) : (
              <SocialLinkButton
                unoptimized
                containerSize={iconSizeContainerMap[currentSocialPreset]}
                iconSize={iconSizeMap[currentSocialPreset]}
                variant={"primary"}
                size="sm"
                href={instagram ?? ""}
                icon="instagram-white"
                label="Instagram"
                typeImage="svg"
              />
            )}
          </>
        )}

        {/*
          # For Testing, delete this comment

        <TiktokHoverPopover
              url={"https://www.tiktok.com/@ortegavsedits/photo/7497157575759138070"}
              unoptimized={unoptimized}
              containerSize={iconSizeContainerMap[currentSocialPreset]}
              iconSize={iconSizeMap[currentSocialPreset]}
              variant='photo'
            />

            <TiktokHoverPopover
              url={"https://www.tiktok.com/@arvhiehanafi/video/7498182088307330312"}
              unoptimized={unoptimized}
              containerSize={iconSizeContainerMap[currentSocialPreset]}
              iconSize={iconSizeMap[currentSocialPreset]}
              variant='video'
            />*/}
        {tiktok &&
          (tiktok.includes("tiktok.com") && tiktok.includes("video") || tiktok.includes("vm.tiktok.com")? (
            <TiktokHoverPopover
              url={tiktok}
              unoptimized={unoptimized}
              containerSize={iconSizeContainerMap[currentSocialPreset]}
              iconSize={iconSizeMap[currentSocialPreset]}
              variant="video"
            />
          ) : tiktok.includes("tiktok.com") && tiktok.includes("photo") ? (
            <TiktokHoverPopover
              url={tiktok}
              unoptimized={unoptimized}
              containerSize={iconSizeContainerMap[currentSocialPreset]}
              iconSize={iconSizeMap[currentSocialPreset]}
              variant="photo"
            />
          ) : (
            <SocialLinkButton
              unoptimized
              containerSize={iconSizeContainerMap[currentSocialPreset]}
              iconSize={iconSizeMap[currentSocialPreset]}
              variant={"primary"}
              size="sm"
              href={tiktok ?? ""}
              icon="tiktok-white"
              label="TikTok"
              typeImage="svg"
            />
          ))}
      </div>
    );
  },
);
SocialLinks.displayName = "SocialLinks";
export default SocialLinks;

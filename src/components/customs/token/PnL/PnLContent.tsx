"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toPng } from "html-to-image";
import Handlebars from "handlebars";
// ######## Components 🧩 ########
import Image from "next/image";
import BaseButton from "@/components/customs/buttons/BaseButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import WalletSelectionButton from "@/components/customs/WalletSelectionButton";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
// ######## Utils & Helpers 🤝 ########
import {
  formatAmountDollar,
  formatAmountWithoutLeadingZero,
} from "@/utils/formatAmount";
// ######## Types 🗨️ ########
import { Wallet } from "@/apis/rest/wallet-manager";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Copy } from "lucide-react";
import { useTokenMessageStore } from "@/stores/token/use-token-messages.store";
import { useWindowSizeStore } from "@/stores/use-window-size.store";

const PnLContent = ({
  mint,
  profitAndLoss,
  profitAndLossUsdRaw,
  profitAndLossPercentage,
  sold,
  soldDRaw,
  invested,
  investedDRaw,
  closeElement,
  scrollable,
  solPrice,
  wallets,
  setWallets,
  title,
  image,
  type,
  remaining,
  remainingDRaw,
}: {
  mint?: string;
  profitAndLoss: string | number;
  profitAndLossUsdRaw?: string | number;
  profitAndLossPercentage: string | number;
  sold: string | number;
  soldDRaw?: string | number;
  invested: string | number;
  investedDRaw?: string | number;
  closeElement: React.ReactNode;
  scrollable?: boolean;
  solPrice: number;
  wallets?: Wallet[];
  setWallets?: (wallets: Wallet[]) => void;
  title: string;
  image?: string;
  type?: string;
  remaining: string | number;
  remainingDRaw?: string | number;
}) => {
  const width = useWindowSizeStore((state) => state.width);

  const [templateHtml, setTemplateHtml] = useState<string>("");
  const [isLoadingDownload, setIsLoadingDownload] = useState(false);
  const [base64Image, setBase64Image] = useState<string | ArrayBuffer | null>(
    "",
  );
  const [showUSD, setShowUSD] = useState(false);

  const selectedWalletAddresses = wallets?.map((wallet) => wallet.address);
  const referralCode = "TYWQ901LO709R";

  // Add new ref for template root
  const templateRootRef = useRef<HTMLDivElement | null>(null);

  const getAmount = (
    value: any,
    formatter: (value: number, param?: any) => string,
    suffix: string = "",
    additionalParam: any = undefined,
  ) => formatter(Number(value) || 0, additionalParam) + suffix;

  const convertImageToBase64 = (imageUrl: string) => {
    fetch(`${process.env.NEXT_PUBLIC_IMAGE_PROXY_URL}/proxy?url=` + imageUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setBase64Image(reader.result);
        };
        reader.readAsDataURL(blob);
      })
      .catch((error) => {
        console.warn("Error converting image to Base64:", error);
      });
  };

  useEffect(() => {
    if (image) {
      convertImageToBase64(image);
    }
  }, [image]);

  const [templateChangedCount, setTemplateChangedCount] = useState(0);

  useEffect(() => {
    // Register conditional helper for currency display
    Handlebars.registerHelper("currency", function (usdValue, solValue) {
      return showUSD ? usdValue : solValue;
    });

    // Force template to update when helpers change
    // setTemplateChangedCount((prev) => prev + 1);
  }, [showUSD]);

  // Modify templateData to exclude all dynamic values including image
  const templateData = useMemo(() => {
    // setTemplateChangedCount((prev) => prev + 1);
    return {
      pnlBg:
        type !== "holding" && Number(profitAndLoss || 0) > 0
          ? "/template/assets/bg-pnl-2.webp"
          : "/template/assets/bg-pnl.webp",
      symbol:
        type === "holding" && Number(profitAndLoss || 0) > 0
          ? "All Time Profit"
          : title,
      image: base64Image || "/template/assets/logo-single.png",
      imageBg: base64Image
        ? "token-image-container"
        : "token-image-container-nova",
      gradientLogo: base64Image ? "hide" : "gradient-logo",
      leftHeader:
        type === "holding"
          ? Number(profitAndLoss || 0) > 0
            ? "All Time Profit"
            : "Nova"
          : title,
      rightHeader: "PNL",
      showUSD,
      invested: getAmount(invested, formatAmountWithoutLeadingZero, " SOL"),
      sold: getAmount(sold, formatAmountWithoutLeadingZero, " SOL"),
      holding: getAmount(remaining, formatAmountWithoutLeadingZero, " SOL"),
      investedD: investedDRaw
        ? getAmount(investedDRaw, formatAmountDollar, "", "suffix")
        : getAmount(
            Number(invested || 0) * solPrice,
            formatAmountDollar,
            "",
            "suffix",
          ),
      soldD: soldDRaw
        ? getAmount(soldDRaw, formatAmountDollar, "", "suffix")
        : getAmount(
            Number(sold || 0) * solPrice,
            formatAmountDollar,
            "",
            "suffix",
          ),
      holdingD: remainingDRaw
        ? getAmount(remainingDRaw, formatAmountDollar, "", "suffix")
        : getAmount(
            Number(remaining || 0) * solPrice,
            formatAmountDollar,
            "",
            "suffix",
          ),
      roi:
        Number(invested || 0) !== 0
          ? (Number(profitAndLoss || 0) / Number(invested || 1)).toFixed(2) +
            " X"
          : "0 X",
      profitD: profitAndLossUsdRaw
        ? getAmount(profitAndLossUsdRaw, formatAmountDollar)
        : getAmount(Number(profitAndLoss || 0) * solPrice, formatAmountDollar),
      profitOrLoss: Number(profitAndLoss || 0) > 0 ? "Profit" : "Loss",
      profit: getAmount(profitAndLoss, formatAmountWithoutLeadingZero),
      profitSol: getAmount(
        profitAndLoss,
        formatAmountWithoutLeadingZero,
        " SOL",
      ),
      referralCode: referralCode,
      percentage24h: `${Number(profitAndLossPercentage) > 0 ? "+" : ""}${Number(profitAndLossPercentage).toFixed(2)}%`,
      newHolding: getAmount(
        (Number(invested || 0) - Number(sold || 0)) * solPrice,
        formatAmountDollar,
        "",
      ),
      gainLossIcon:
        Number(profitAndLossPercentage ?? 0) > 0
          ? "/template/assets/icon-profit.svg"
          : "/template/assets/icon-loss.svg",
      gainLossGradient:
        Number(profitAndLoss) > 0
          ? "/template/assets/bg-gradient-profit.svg"
          : "/template/assets/bg-gradient-loss.svg",
      percentageClass:
        Number(profitAndLossPercentage) > 0
          ? "percentage profit-percentage"
          : "percentage loss-percentage",
      percentageTextClass:
        Number(profitAndLossPercentage) > 0 ? "profit-text" : "loss-text",
      summaryTotalClass:
        Number(profitAndLoss) > 0
          ? type === "holding"
            ? "total-profit-holding"
            : "total-profit"
          : "total-loss",
      footerHeaderClass:
        type !== "holding" && Number(profitAndLoss || 0) > 0
          ? "pnl-header"
          : "pnl-footer",
      lossGradOverlayClass:
        Number(profitAndLoss || 0) > 0
          ? "loss-grad-overlay-hidden"
          : "loss-grad-overlay",
    };
  }, [
    selectedWalletAddresses,
    profitAndLoss,
    profitAndLossPercentage,
    solPrice,
    title,
    base64Image,
    showUSD,
  ]);

  const templateStylesRef = useRef<{
    templateText: string;
    styleText: string;
    fontText: string;
  } | null>(null);

  useEffect(() => {
    const loadTemplateAndStyles = async () => {
      try {
        // Load the template, styles, and font CSS only if not already loaded
        if (!templateStylesRef.current) {
          const [templateResponse, styleResponse, fontResponse] =
            await Promise.all([
              fetch("/template/template.html.hbs"),
              fetch("/template/style.css"),
              fetch("/template/assets/fonts/font.css"),
            ]);

          const [templateText, styleText, fontText] = await Promise.all([
            templateResponse.text(),
            styleResponse.text(),
            fontResponse.text(),
          ]);

          templateStylesRef.current = { templateText, styleText, fontText };
        }

        const template = Handlebars.compile(
          templateStylesRef.current.templateText,
        );
        const html = template(templateData);

        const htmlWithStyles = html.replace(
          "</head>",
          `<style>${templateStylesRef.current.styleText}\n${templateStylesRef.current.fontText}</style></head>`,
        );
        setTemplateHtml(htmlWithStyles);
      } catch (error) {
        console.warn("Error loading template or styles:", error);
      }
    };

    loadTemplateAndStyles();
  }, [templateData]); // Only re-run when templateData changes

  const handleTweet = () => {
    // Get the profit/loss value for the tweet
    const pnlValue = showUSD
      ? getAmount(
          profitAndLossUsdRaw
            ? profitAndLossUsdRaw
            : Number(profitAndLoss || 0) * solPrice,
          formatAmountDollar,
        )
      : getAmount(profitAndLoss, formatAmountWithoutLeadingZero);

    // Construct the tweet text
    const tweetText = `I just made ${pnlValue}${showUSD ? "USD" : "SOL"} on ${title} with Nova 💜\n\nThe fastest speeds and highest earning rewards.\n\nTrade with me - https://nova.trade/`;

    // URL encode the tweet text
    const encodedTweet = encodeURIComponent(tweetText);

    // Create the Twitter intent URL
    const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodedTweet}`;

    // Open in a new window
    window.open(twitterIntentUrl, "_blank");
  };

  // ✨✨✨ SOLUTION ✨✨✨
  const htmlToCanvasRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleImageAction = useCallback(
    (action: "download" | "copy" | "both") => {
      if (!htmlToCanvasRef.current) return;
      setIsLoadingDownload(true);

      toPng(htmlToCanvasRef.current, {
        cacheBust: true,
        quality: 1, // Ensuring high quality
        fetchRequestInit: {
          mode: "no-cors",
        },
      })
        .then(async (dataUrl) => {
          // ✅ **Download Image**
          if (action === "download" || action === "both") {
            const link = document.createElement("a");
            link.download = "pnl-image.png";
            link.href = dataUrl;
            link.click();
          }

          // ✅ **Copy Image to Clipboard**
          if (action === "copy" || action === "both") {
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const item = new ClipboardItem({ "image/png": blob });

            await navigator.clipboard.write([item]);
            console.log("✅ Image copied to clipboard!");
          }
        })
        .catch((err) => console.warn("❌ Error:", err))
        .finally(() => {
          timeoutRef.current = setTimeout(() => {
            setIsLoadingDownload(false);
          }, 2000);
        });
    },
    [],
  );

  // Add these constants for template dimensions
  const TEMPLATE_WIDTH = 645;
  const TEMPLATE_HEIGHT = 363;
  const ASPECT_RATIO = TEMPLATE_WIDTH / TEMPLATE_HEIGHT;

  // Add state for scale
  const [scale, setScale] = useState(1);

  // Add resize observer
  useEffect(() => {
    if (!htmlToCanvasRef.current) return;

    const updateScale = () => {
      const container = htmlToCanvasRef.current;
      if (!container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Calculate scales based on both dimensions
      const scaleX = containerWidth / TEMPLATE_WIDTH;
      const scaleY = containerHeight / TEMPLATE_HEIGHT;

      // Use the smaller scale to ensure template fits
      const newScale = Math.min(scaleX, scaleY);

      setScale(newScale);
    };

    // Create resize observer
    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(htmlToCanvasRef.current);

    // Initial scale calculation
    updateScale();

    return () => {
      resizeObserver.disconnect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const renderedTemplate = useMemo(() => {
    return (
      <div
        ref={templateRootRef}
        dangerouslySetInnerHTML={{ __html: templateHtml }}
      />
    );
  }, [templateHtml]);

  return (
    <>
      <div className="flex h-[64px] w-full items-center justify-between gap-x-5 border-b border-border px-4 py-[19px]">
        <h4 className="text-nowrap font-geistSemiBold text-[18px] text-fontColorPrimary">
          P&L Image
        </h4>

        {wallets && setWallets && (
          <WalletSelectionButton
            value={wallets}
            setValue={setWallets}
            isMultipleSelect={true}
            maxWalletShow={10}
            isGlobal={false}
          />
        )}

        {closeElement}
      </div>

      {/* <div className="flex w-full flex-grow bg-amber-300"></div> */}

      <div className="flex w-full flex-grow flex-col gap-y-3 p-4">
        {/* ############ TEMPLATE HERE ############ */}
        <>
          <ContextMenu>
            <ContextMenuTrigger>
              <>
                {scrollable ? (
                  width! > 768 ? (
                    <OverlayScrollbarsComponent
                      defer
                      element="div"
                      className="relative h-[60vh] w-full flex-grow overflow-y-scroll min-[1140px]:h-fit"
                    >
                      <div
                        ref={htmlToCanvasRef}
                        className="relative w-full overflow-hidden rounded-[8px] border border-border"
                        style={{
                          aspectRatio: `${TEMPLATE_WIDTH}/${TEMPLATE_HEIGHT}`,
                          maxWidth: "1548px",
                          maxHeight: "870px",
                          margin: "0 auto",
                        }}
                      >
                        <div
                          className="pointer-events-none absolute left-0 top-0 origin-top-left"
                          style={{
                            width: TEMPLATE_WIDTH,
                            height: TEMPLATE_HEIGHT,
                            transform: `scale(${scale})`,
                            transformOrigin: "top left",
                          }}
                        >
                          {renderedTemplate}
                        </div>
                      </div>
                    </OverlayScrollbarsComponent>
                  ) : (
                    <OverlayScrollbarsComponent
                      defer
                      element="div"
                      className="relative flex h-[60vh] w-full flex-grow"
                    >
                      <div className="absolute left-0 top-0 h-full w-full">
                        <div
                          ref={htmlToCanvasRef}
                          className="relative h-fit w-full overflow-hidden rounded-[8px] border border-border min-[400px]:h-full min-[400px]:w-fit"
                          style={{
                            aspectRatio: `${TEMPLATE_WIDTH}/${TEMPLATE_HEIGHT}`,
                            maxWidth: "1548px",
                            maxHeight: "870px",
                            margin: "0 auto",
                          }}
                        >
                          <div
                            className="pointer-events-none absolute left-0 top-0 origin-top-left"
                            style={{
                              width: TEMPLATE_WIDTH,
                              height: TEMPLATE_HEIGHT,
                              transform: `scale(${scale})`,
                              transformOrigin: "top left",
                            }}
                          >
                            {renderedTemplate}
                          </div>
                        </div>
                      </div>
                    </OverlayScrollbarsComponent>
                  )
                ) : (
                  <div
                    ref={htmlToCanvasRef}
                    className="relative w-full overflow-hidden rounded-[8px] border border-border"
                    style={{
                      aspectRatio: `${TEMPLATE_WIDTH}/${TEMPLATE_HEIGHT}`,
                      maxWidth: "1548px",
                      maxHeight: "870px",
                      margin: "0 auto",
                    }}
                  >
                    <div
                      className="pointer-events-none absolute left-0 top-0 origin-top-left"
                      style={{
                        width: TEMPLATE_WIDTH,
                        height: TEMPLATE_HEIGHT,
                        transform: `scale(${scale})`,
                        transformOrigin: "top left",
                      }}
                    >
                      {renderedTemplate}
                    </div>
                  </div>
                )}
              </>
            </ContextMenuTrigger>
            <ContextMenuContent className="gb__white__popover z-[1000] w-56 border border-border bg-background">
              <ContextMenuItem
                onClick={() => handleImageAction("copy")}
                inset
                className="cursor-pointer bg-shadeTable text-fontColorPrimary transition-colors duration-300 hover:bg-shadeTableHover hover:text-fontColorPrimary"
              >
                <Copy
                  className="mr-2 h-4 w-4 text-fontColorPrimary"
                  size={16}
                />
                Copy Image
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </>
        {/* ############ TEMPLATE HERE END ############ */}

        <div className="grid w-full grid-cols-3 items-center justify-between gap-x-3">
          <BaseButton
            // onClick={handleDownload}
            disabled={isLoadingDownload}
            isLoading={isLoadingDownload}
            onClick={() => handleImageAction("download")}
            variant="gray"
            className="h-[40px]"
            prefixIcon={
              <div className="relative aspect-square h-5 w-5">
                <Image
                  src="/icons/download.png"
                  alt="Download Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
            }
          >
            <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
              Download
            </span>
          </BaseButton>
          <BaseButton
            variant="gray"
            prefixIcon={
              <div className="relative aspect-square size-5">
                <Image
                  src="/icons/arrows-exchange.svg"
                  alt="Exchange Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
            }
            className="h-[40px] bg-primary/[8%] text-primary hover:bg-primary/[24%] focus:bg-primary/[24%]"
            onClick={() => setShowUSD(!showUSD)}
          >
            Change to {showUSD ? "SOL" : "USD"}
          </BaseButton>
          <BaseButton
            onClick={handleTweet}
            variant="primary"
            className="h-[40px]"
            prefixIcon={
              <div className="relative aspect-square h-5 w-5">
                <Image
                  src="/icons/social/twitter.png"
                  alt="Twitter Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
            }
          >
            <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
              Tweet
            </span>
          </BaseButton>
        </div>
      </div>
    </>
  );
};

export default React.memo(PnLContent);

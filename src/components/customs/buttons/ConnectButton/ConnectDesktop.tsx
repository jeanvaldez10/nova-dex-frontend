"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletMultiButton } from "@solana/wallet-adapter-base-ui";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import bs58 from "bs58";

// ######## Components 🧩 ########
import Image from "next/image";
import BaseButton from "@/components/customs/buttons/BaseButton";
import CustomToast from "@/components/customs/toasts/CustomToast";
import { cn } from "@/libraries/utils";

// ######## APIs 🛜 ########
import { generateNonce } from "@/apis/rest/auth";
import { useEventEmitter } from "@/hooks/useEventEmitter";
import { EventNames } from "@/types/events";

interface ConnectDesktopProps {
  onSuccess?: (authResponse: any) => void;
  className?: string;
  variant?: "primary" | "gray";
}

const ConnectDesktop = ({
  onSuccess,
  className,
  variant = "primary",
}: ConnectDesktopProps) => {
  const { setVisible: setModalVisible } = useWalletModal();
  const { buttonState, onConnect, onDisconnect } = useWalletMultiButton({
    onSelectWallet() {
      setModalVisible(true);
    },
  });
  const { publicKey, signMessage } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [isSigned, setIsSigned] = useState(false);

  const generateNonceMutation = useMutation({
    mutationFn: generateNonce,
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

  const handleConnect = async () => {
    try {
      setIsLoading(true);

      const nonce = await generateNonceMutation.mutateAsync();

      if (!signMessage || !publicKey) {
        throw new Error("Wallet not connected");
      }

      const message = new TextEncoder().encode(
        `Welcome to TradeOnNova. Please sign this message to authenticate your wallet: ${nonce}`,
      );

      const signature = await signMessage(message);
      const signatureStr = bs58.encode(signature);

      const authResponse = {
        signature: signatureStr,
        nonce,
        signer: publicKey.toString(),
      };
      setIsSigned(true);
      onSuccess?.(authResponse);
    } catch (error) {
      console.warn("Authentication error:", error);
      onDisconnect?.();
      setIsSigned(false);
    } finally {
      setTimeout(() => setIsLoading(false), 100);
    }
  };

  useEffect(() => {
    if (buttonState == "connected" && !isLoading && !isSigned) {
      handleConnect();
    }
  }, [isLoading, buttonState, isSigned]);

  useEventEmitter(EventNames.DisconnectWallet, () => {
    onDisconnect?.();
    setIsSigned(false);
  });

  return (
    <BaseButton
      variant={variant}
      onClick={
        buttonState == "no-wallet" ? () => setModalVisible(true) : onConnect
      }
      className={cn(
        className,
        "h-[48px]",
        buttonState === "connecting" || isLoading ? "" : "",
      )}
      disabled={!["has-wallet", "no-wallet"].includes(buttonState) || isLoading}
      prefixIcon={
        buttonState === "connecting" || isLoading ? (
          <div className="relative aspect-square h-6 w-6 flex-shrink-0 animate-spin">
            <Image
              src={
                variant === "primary"
                  ? "/icons/dark-loading.svg"
                  : "/icons/pink-loading.svg"
              }
              alt="Black Wallet Icon"
              fill
              quality={100}
              className="object-contain"
            />
          </div>
        ) : (
          <div className="relative aspect-square h-6 w-6 flex-shrink-0">
            <Image
              src={
                variant === "primary"
                  ? "/icons/black-wallet.png"
                  : "/icons/white-wallet.svg"
              }
              alt="Black Wallet Icon"
              fill
              quality={100}
              className="object-contain"
            />
          </div>
        )
      }
    >
      <span className="inline-block font-geistSemiBold text-base">
        {buttonState === "no-wallet"
          ? "Select Wallet"
          : buttonState === "has-wallet"
            ? "Connect Wallet"
            : buttonState === "connecting" || isLoading
              ? "Connecting Wallet"
              : "Redirecting..."}
      </span>
    </BaseButton>
  );
};

export default ConnectDesktop;

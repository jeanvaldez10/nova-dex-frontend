"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
// ######## Components 🧩 ########
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import TwitterMonitorCard from "@/components/customs/cards/footer/TwitterMonitorCard";
// ######## Types 🗨️ ########
import { TwitterMonitorMessageType } from "@/types/ws-general";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import EmptyState from "../../EmptyState";
import { useTwitterMonitorMessageStore } from "@/stores/footer/use-twitter-monitor-message.store";

// Define the ref type
export interface TwitterMonitorListRef {
  scrollTo: (options: ScrollToOptions) => void;
  scrollToTop: () => void;
  scrollToBottom: () => void;
  getScrollInstance: () => any;
  getScrollElement: () => HTMLElement | null;
}

const AllVariantTwitterMonitorList = forwardRef<
  TwitterMonitorListRef,
  {
    list: TwitterMonitorMessageType[];
    variant: "small" | "large";
    isFullscreen: boolean;
    className?: string;
    showScrollbar?: boolean;
  }
>(
  (
    {
      list,
      variant = "small",
      isFullscreen = false,
      className,
      showScrollbar = false,
    },
    ref,
  ) => {
    const osRef = useRef<any>(null);
    const accounts = useTwitterMonitorMessageStore((state) => state.accounts);

    // Expose scroll methods to parent through ref
    useImperativeHandle(ref, () => ({
      scrollTo: (options: ScrollToOptions) => {
        try {
          const instance = osRef.current?.osInstance();
          if (instance) {
            const viewport = instance.elements()?.viewport;
            if (viewport) {
              viewport.scrollTo(options);
            }
          }
        } catch (error) {
          console.warn("Error in scrollTo:", error);
        }
      },
      scrollToTop: () => {
        try {
          const instance = osRef.current?.osInstance();
          if (instance) {
            const viewport = instance.elements()?.viewport;
            if (viewport) {
              viewport.scrollTo({ top: 0, behavior: "smooth" });
            }
          }
        } catch (error) {
          console.warn("Error in scrollToTop:", error);
        }
      },
      scrollToBottom: () => {
        try {
          const instance = osRef.current?.osInstance();
          if (instance) {
            const viewport = instance.elements()?.viewport;
            if (viewport) {
              viewport.scrollTo({
                top: viewport.scrollHeight,
                behavior: "smooth",
              });
            }
          }
        } catch (error) {
          console.warn("Error in scrollToBottom:", error);
        }
      },
      getScrollInstance: () => osRef.current?.osInstance(),
      getScrollElement: () => {
        try {
          const instance = osRef.current?.osInstance();
          return instance?.elements()?.viewport || null;
        } catch (error) {
          console.warn("Error getting scroll element:", error);
          return null;
        }
      },
    }));

    if (accounts.length === 0)
      return (
        <div className="flex h-full w-full items-center justify-center p-4">
          <EmptyState
            state="Twitter"
            size="sm"
            className="-mt-5 max-w-[520px]"
            paragraphClassname="!text-fontColorSecondary"
          />
        </div>
      );

    return (
      <div className={cn("col-span-1 flex w-full flex-grow", className)}>
        {list.length > 0 ? (
          <OverlayScrollbarsComponent
            ref={osRef}
            defer
            element="div"
            className={cn(
              "relative w-full flex-grow",
              showScrollbar
                ? "twitter__overlayscrollbar"
                : "invisible__overlayscrollbar",
            )}
          >
            <div
              className={cn(
                "absolute left-0 top-0 w-full flex-grow",
                variant === "small" && "pb-4",
              )}
            >
              <div
                className={cn(
                  "flex h-auto w-full flex-col",
                  variant === "small" ? "gap-y-2" : "gap-y-2 lg:gap-y-4",
                )}
              >
                {list.map((item) => (
                  <TwitterMonitorCard
                    key={item.tweet_id}
                    data={item}
                    variant={variant}
                  />
                ))}
              </div>
            </div>
          </OverlayScrollbarsComponent>
        ) : !isFullscreen ? (
          <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-xl p-8 shadow-md">
            <div className="mb-6 flex items-center justify-center">
              {/* Twitter animation */}
              <div className="relative">
                {/* Main circle with pulsing effect */}
                <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-gray-900 bg-opacity-80">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-900">
                    {/* Simplified Twitter/X bird icon */}
                    <svg
                      className="h-8 w-8 text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.14l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                </div>

                {/* Animated dots */}
                <div className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 transform space-x-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-2 w-2 rounded-full bg-gray-500"
                      style={{
                        animation: `bounce 1.4s infinite ease-in-out both`,
                        animationDelay: `${i * 0.16}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <h3 className="mb-1 text-lg font-medium text-white">
              Waiting for accounts to tweet
            </h3>
            <p className="text-center text-sm text-gray-500">
              We&apos;ll notify you when new tweets arrive
            </p>

            {/* CSS for the animations */}
            <style jsx>{`
              @keyframes bounce {
                0%,
                80%,
                100% {
                  transform: scale(0);
                }
                40% {
                  transform: scale(1);
                }
              }
            `}</style>
          </div>
        ) : (
          ""
        )}
      </div>
    );
  },
);

AllVariantTwitterMonitorList.displayName = "AllVariantTwitterMonitorList";

export default AllVariantTwitterMonitorList;

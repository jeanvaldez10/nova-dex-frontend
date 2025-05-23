"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import {
  useState,
  useCallback,
  useRef,
  useEffect,
  memo,
  forwardRef,
} from "react";
import {
  RecentToken,
  useRecentSearchTokensStore,
} from "@/stores/use-recent-search-tokens";
import debounce from "lodash/debounce";
// ######## APIs 🛜 ########
import { searchTokens } from "@/apis/rest/search";
// ######## Components 🧩 ########
import Image from "next/image";
import { Input } from "@/components/ui/input";
import BaseButton from "@/components/customs/buttons/BaseButton";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import GlobalSearchResultList from "@/components/customs/lists/GlobalSearchResultList";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import GlobalRecentTokenCard from "../cards/GlobalRecentTokenCard";
import { useRouter } from "nextjs-toploader/app";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField } from "@/components/ui/form";

// Constants
const DEBOUNCE_SEARCH_QUERY_DELAY = 200;
export interface GlobalSearchModalFilter {
  sortBy?: string;
  order?: string;
  searchQuery?: string;
  isOg?: boolean;
}

// Define Zod schema for form validation
const globalSearchFilterSchema = z.object({
  sortBy: z.string().optional(),
  order: z.string().optional(),
  searchQuery: z.string().optional(),
  isOg: z.boolean(),
});

const fetchSearchResults = async (data: GlobalSearchModalFilter) => {
  try {
    const results = await searchTokens({
      q: data?.searchQuery as string,
      order: (data?.isOg ? "asc" : data?.order) || undefined,
      sortBy: (data?.isOg ? "creationDate" : data?.sortBy) || undefined,
    });
    return {
      results: results.map((result) => ({
        ...result,
      })),
    };
  } catch (error) {
    console.warn("Search error:", error);
  }
};

const GlobalSearchModal = () => {
  const router = useRouter();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [focusedItemIndex, setFocusedItemIndex] = useState<number>(-1);
  const [keyword, setKeyword] = useState<string>("");
  const resultCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);

  const form = useForm<GlobalSearchModalFilter>({
    resolver: zodResolver(globalSearchFilterSchema),
    defaultValues: {
      sortBy: "creationDate",
      order: "desc",
      searchQuery: "",
      isOg: false,
    },
  });

  const { recentTokens, setRecentSearchTokens } = useRecentSearchTokensStore();

  // Keyboard shortcut to open dialog
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "/" && !openDialog) {
        e.preventDefault();
        setOpenDialog(true);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [openDialog]);

  const { data: searchTokenResults, isLoading } = useQuery({
    queryKey: [
      "search-tokens",
      keyword,
      form.watch("isOg"),
      form.watch("sortBy"),
    ],
    queryFn: async () => {
      const data = await fetchSearchResults(form.getValues());
      return data ? data : { results: [] };
    },
    enabled: !!keyword,
  });

  const filteredData = searchTokenResults?.results || [];

  // global keyboard event handler when dialog is open
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !openDialog) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!openDialog || !filteredData?.length) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedItemIndex((prev) =>
            Math.min(prev + 1, filteredData.length - 1),
          );
          break;

        case "ArrowUp":
          e.preventDefault();
          setFocusedItemIndex((prev) => Math.max(prev - 1, 0));
          break;

        case "Enter":
          if (focusedItemIndex >= 0 && filteredData[focusedItemIndex]) {
            e.preventDefault();
            const token = filteredData[focusedItemIndex] as RecentToken;
            const updatedTokens = recentTokens.filter(
              (existingToken) => existingToken.mint !== token.mint,
            );
            setRecentSearchTokens([token, ...updatedTokens]);
            router.push(`/token/${filteredData[focusedItemIndex].mint}`);
            handleDialogClose(!openDialog);
          }
          break;

        case "Escape":
          e.preventDefault();
          handleDialogClose(openDialog);
          break;
      }
    };

    dialog.addEventListener("keydown", handleKeyDown, true);
    return () => dialog.removeEventListener("keydown", handleKeyDown, true);
  }, [openDialog, filteredData, focusedItemIndex, router, recentTokens]);

  useEffect(() => {
    if (!openDialog) return;

    if (focusedItemIndex >= 0) {
      const element = resultCardsRef.current[focusedItemIndex];
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [focusedItemIndex]);
  // Last global keyboard event handler when dialog is open

  // Reset focus when search results change
  useEffect(() => {
    if (filteredData?.length > 0) {
      setFocusedItemIndex(0);
    }
  }, [filteredData]);

  const debouncedSetSearchQuery = useCallback(
    debounce(async (value: string) => {
      setKeyword(value);
    }, DEBOUNCE_SEARCH_QUERY_DELAY),
    [],
  );

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleDialogClose = (isOpen: boolean) => {
    setOpenDialog(isOpen);
    if (!isOpen) {
      // Reset states when dialog is closed
      timeoutRef.current = setTimeout(() => {
        form.setValue("searchQuery", "");
        setFocusedItemIndex(0);
      }, 500);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return (
    <Dialog open={openDialog} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <BaseButtonModal setOpenDialog={setOpenDialog} />
      </DialogTrigger>

      <DialogContent
        ref={dialogRef}
        className="flex h-full w-full max-w-none flex-col gap-y-0 rounded-none bg-[#080812] sm:h-auto sm:max-w-[600px] sm:rounded-[8px] 2xl:max-w-[720px] [&>button]:hidden"
      >
        <Form {...form}>
          <DialogTitle className="hidden"></DialogTitle>
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <FormField
              control={form.control}
              name="isOg"
              render={({ field }) => (
                <BaseButton
                  onClick={() => field.onChange(!field.value)}
                  className={cn(
                    "gap-2 border-solid text-sm",
                    field.value &&
                      "border border-solid !border-primary text-primary",
                  )}
                >
                  <Image
                    src={
                      field.value
                        ? "/icons/og-mode-primary.svg"
                        : "/icons/og-mode.svg"
                    }
                    alt="Og Mode Icon"
                    width={16}
                    height={15}
                    quality={100}
                    className="object-contain"
                  />
                  OG Mode
                </BaseButton>
              )}
            />

            <FormField
              control={form.control}
              name="sortBy"
              render={({ field }) => (
                <Select
                  value={field.value as string}
                  defaultValue={field.value as string}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="h-[32px] max-w-[200px]">
                    <span className="inline-block space-x-1 text-nowrap font-geistSemiBold text-fontColorPrimary">
                      <span className="text-sm text-[#9191A4]">Sort by:</span>
                      <SelectValue className="text-sm" />
                    </span>
                  </SelectTrigger>
                  <SelectContent className="z-[1000]">
                    <SelectItem
                      value="marketCap"
                      className="font-geistSemiBold"
                    >
                      Market Cap
                    </SelectItem>
                    <SelectItem
                      value="lastTrade"
                      className="font-geistSemiBold"
                    >
                      Last Trade
                    </SelectItem>
                    <SelectItem
                      value="creationDate"
                      className="font-geistSemiBold"
                    >
                      Creation Time
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Search Input & Close */}
          <div className="flex h-[50px] flex-row items-center border-b border-border py-2 pl-1 pr-4">
            <div
              className={cn("base__input relative h-full w-full rounded-[8px]")}
            >
              <div className="absolute left-3 top-1/2 z-10 aspect-square h-4 w-4 flex-shrink-0 -translate-y-1/2">
                <Image
                  src="/icons/search-input.png"
                  alt="Search Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>

              <FormField
                control={form.control}
                name="searchQuery"
                render={({ field }) => (
                  <>
                    <Input
                      id="global-search"
                      autoFocus
                      value={field.value}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const isPasteEvent =
                          (e.nativeEvent as any).inputType ===
                          "insertFromPaste";

                        field.onChange(e.target.value);
                        form.setValue("sortBy", "");
                        form.setValue("order", "");
                        if (isPasteEvent) {
                          setKeyword(e.target.value);
                        } else {
                          // Apply debounce for normal input changes
                          debouncedSetSearchQuery(e.target.value);
                        }
                      }}
                      placeholder="Search by ticker, token name or contract address"
                      className={`relative -bottom-[0.5px] z-20 flex h-full w-full border border-transparent bg-transparent py-1 pl-9 pr-3 text-sm text-fontColorPrimary shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-950 placeholder:text-fontColorSecondary focus:border-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
                      autoComplete="off"
                    />

                    {(field?.value as string).length > 0 && (
                      <button
                        onClick={() => {
                          field.onChange("");
                          setKeyword("");
                        }}
                        title="Clear search"
                        type="button"
                        className="absolute right-2.5 top-1/2 z-30 aspect-square h-4 w-4 flex-shrink-0 -translate-y-1/2 duration-300 hover:opacity-70"
                      >
                        <Image
                          src="/icons/circle-close.png"
                          alt="Close Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </button>
                    )}
                  </>
                )}
              />
            </div>

            <div
              onClick={() => handleDialogClose(!openDialog)}
              className="relative aspect-square h-6 w-6 flex-shrink-0 cursor-pointer"
            >
              <Image
                src="/icons/close.png"
                alt="Close Icon"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
          </div>
        </Form>

        {/* Recents */}
        <RecentSearchTokens setOpenDialog={setOpenDialog} />

        {/* Search Result List */}
        <div className="flex h-full w-full flex-grow flex-col sm:flex-grow-0">
          {form.getValues("searchQuery")?.trim() !== "" ? (
            isLoading ? (
              <div className="flex flex-grow items-center justify-center px-4 sm:h-[300px] sm:flex-grow-0">
                <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                  <Image
                    src="/icons/search-loading.png"
                    alt="Search Loading Icon"
                    fill
                    quality={100}
                    className="animate-spin object-contain"
                  />
                </div>
              </div>
            ) : (
              <>
                {searchTokenResults?.results &&
                searchTokenResults?.results?.length > 0 ? (
                  <GlobalSearchResultList
                    data={searchTokenResults?.results}
                    focusedItemIndex={focusedItemIndex}
                    resultCardsRef={resultCardsRef}
                    setOpenDialog={setOpenDialog}
                  />
                ) : (
                  <NoResults />
                )}
              </>
            )
          ) : (
            <div className="flex flex-grow items-center justify-center px-4 sm:h-[194px] sm:flex-grow-0">
              <span className="text-center text-sm text-fontColorSecondary">
                Search by ticker, token name or contract address
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default memo(GlobalSearchModal);
GlobalSearchModal.displayName = "GlobalSearchModal";

const NoResults = () => {
  return (
    <div className="flex flex-grow flex-col items-center justify-center gap-y-3 sm:h-[194px] sm:flex-grow-0">
      <div className="relative aspect-[160/160] h-auto w-full max-w-[100px] flex-shrink-0">
        <Image
          src="/images/page-states/no_result.svg"
          alt="No Result Image"
          fill
          quality={100}
          className="object-contain"
        />
      </div>
      <p className="text-center text-sm text-fontColorSecondary">
        No tokens matched this search
      </p>
    </div>
  );
};

const RecentSearchTokens = ({
  setOpenDialog,
}: {
  setOpenDialog: (value: boolean) => void;
}) => {
  const recentSearchTokens = useRecentSearchTokensStore(
    (state) => state.recentTokens,
  );
  return (
    <div className="flex w-full items-center gap-x-4 px-4 pt-2">
      <h4 className="text-xs text-fontColorSecondary">Recents:</h4>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {recentSearchTokens.slice(0, 5).map((token, index) => (
          <GlobalRecentTokenCard
            key={token.mint + index}
            {...token}
            setOpenDialog={setOpenDialog}
          />
        ))}
      </div>
    </div>
  );
};

const BaseButtonModal = forwardRef<
  HTMLButtonElement,
  { setOpenDialog: (value: boolean) => void }
>(({ setOpenDialog }, ref) => {
  return (
    <BaseButton
      ref={ref}
      type="button"
      onClick={() => setOpenDialog(true)}
      variant="gray"
      size="long"
      className="flex h-8 w-8 items-center gap-x-2 bg-[#17171F] pl-0 pr-0 focus:bg-white/[6%] 2xl:w-auto 2xl:px-2"
      prefixIcon={
        <div className="relative hidden aspect-square size-6 flex-shrink-0 2xl:block">
          <Image
            src="/icons/main-search.svg"
            alt="Main Search Logo"
            fill
            quality={100}
            className="object-contain"
          />
        </div>
      }
    >
      <div className="relative mx-auto block aspect-square size-5 flex-shrink-0 2xl:hidden">
        <Image
          src="/icons/main-search.svg"
          alt="Main Search Logo"
          fill
          quality={100}
          className="object-contain"
        />
      </div>
      <span className="hidden text-nowrap text-start font-geistRegular text-xs text-fontColorSecondary 2xl:inline-block">
        Search by token or LP contract
      </span>
      <div className="hidden rounded-sm bg-[#FFFFFF]/[4%] p-[3px] font-geistRegular text-xs font-bold text-fontColorSecondary 2xl:block">
        <div className="size-4">/</div>
      </div>
    </BaseButton>
  );
});

BaseButtonModal.displayName = "BaseButtonModal";

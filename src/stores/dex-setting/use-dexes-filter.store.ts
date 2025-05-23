import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import cookies from "js-cookie";

export type DexesFilterState = {
  filters: {
    preview: {
      checkBoxes: {
        pumpfun: boolean;
        moonshot: boolean;
        launchlab: boolean;
        raydium: boolean;
        boop: boolean;
        dynamic_bonding_curve: boolean;
        meteora_dlmm: boolean;
        meteora_dyn: boolean;
        pumpswap: boolean;
      };
    };
    genuine: {
      checkBoxes: {
        pumpfun: boolean;
        moonshot: boolean;
        launchlab: boolean;
        raydium: boolean;
        boop: boolean;
        dynamic_bonding_curve: boolean;
        meteora_dlmm: boolean;
        meteora_dyn: boolean;
        pumpswap: boolean;
      };
    };
  };
  toggleDexesFilter: (
    filterKey: keyof DexesFilterState["filters"]["preview"]["checkBoxes"],
    filterType: keyof DexesFilterState["filters"],
  ) => void;
  resetDexesFilters: (filterType: keyof DexesFilterState["filters"]) => void;
  applyDexesFilters: () => void;
};

export const useDexesFilterStore = create<DexesFilterState>()(
  persist(
    (set) => ({
      filters: {
        preview: {
          checkBoxes: {
            pumpfun: true,
            moonshot: true,
            launchlab: true,
            raydium: true,
            boop: true,
            dynamic_bonding_curve: true,
            meteora_dlmm: true,
            meteora_dyn: true,
            pumpswap: true,
          },
        },
        genuine: {
          checkBoxes: {
            raydium: true,
            moonshot: true,
            launchlab: true,
            pumpfun: true,
            boop: true,
            dynamic_bonding_curve: true,
            meteora_dlmm: true,
            meteora_dyn: true,
            pumpswap: true,
          },
        },
      },
      toggleDexesFilter: (filterKey, filterType) =>
        set((state) => ({
          filters: {
            ...state.filters,
            [filterType]: {
              ...state.filters[filterType],
              checkBoxes: {
                ...state.filters[filterType].checkBoxes,
                [filterKey]: !state.filters[filterType].checkBoxes[filterKey],
              },
            },
          },
        })),
      resetDexesFilters: (filterType) =>
        set((state) => {
          const updatedFilters = {
            ...state.filters,
            [filterType]: {
              checkBoxes: {
                raydium: true,
                moonshot: true,
                launchlab: true,
                pumpfun: true,
                boop: true,
                dynamic_bonding_curve: true,
                meteora_dlmm: true,
                meteora_dyn: true,
                pumpswap: true,
              },
            },
          };

          cookies.remove("trending-dexes-filter");

          return { filters: updatedFilters };
        }),
      applyDexesFilters: () =>
        set((state) => {
          const newGenuine = { ...state.filters.preview };

          const encodedNewGenuine = btoa(JSON.stringify(newGenuine));
          cookies.set("trending-dexes-filter", encodedNewGenuine);
          return { filters: { ...state.filters, genuine: newGenuine } };
        }),
    }),
    {
      name: "trending-dexes-filter",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

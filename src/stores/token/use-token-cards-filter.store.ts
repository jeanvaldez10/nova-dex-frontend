import { create } from "zustand";

export type SolUsdc = "SOL" | "USDC";

type TokenCardsFilterState = {
  tradesDateType: "DATE" | "AGE";
  setTradesDateType: (value: "DATE" | "AGE") => void;
  tradesDate: "ASC" | "DESC";
  setTradesDate: (value: "ASC" | "DESC") => void;
  tradesType: {
    buy: boolean;
    sell: boolean;
    add: boolean;
    remove: boolean;
  };
  setTradesType: (value: {
    buy: boolean;
    sell: boolean;
    add: boolean;
    remove: boolean;
  }) => void;
  tradesTotal: {
    min: number;
    max: number;
  };
  setTradesTotal: (value: { min: number; max: number }) => void;
  tradesValue: SolUsdc;
  setTradesValue: (value: SolUsdc) => void;
  tradesTokenSol: SolUsdc;
  setTradesTokenSol: (value: SolUsdc) => void;
  holdersBought: SolUsdc;
  setHoldersBought: (value: SolUsdc) => void;
  holdersSold: SolUsdc;
  setHoldersSold: (value: SolUsdc) => void;
  topTradersBought: SolUsdc;
  setTopTradersBought: (value: SolUsdc) => void;
  topTradersSold: SolUsdc;
  setTopTradersSold: (value: SolUsdc) => void;
  myPositionInvested: SolUsdc;
  setMyPositionInvested: (value: SolUsdc) => void;
  resetFilters: () => void;
};

export const useTokenCardsFilter = create<TokenCardsFilterState>()((set) => ({
  tradesDateType: "DATE",
  setTradesDateType: (value) => set({ tradesDateType: value }),
  tradesDate: "DESC",
  setTradesDate: (value) => set({ tradesDate: value }),
  tradesType: {
    buy: false,
    sell: false,
    add: false,
    remove: false,
  },
  tradesTotal: {
    min: 0,
    max: 0,
  },
  setTradesTotal: (value) => set({ tradesTotal: value }),
  setTradesType: (value) => set({ tradesType: value }),
  tradesValue: "SOL",
  setTradesValue: (value) => set({ tradesValue: value }),
  tradesTokenSol: "SOL",
  setTradesTokenSol: (value) => set({ tradesTokenSol: value }),
  holdersBought: "SOL",
  setHoldersBought: (value) => set({ holdersBought: value }),
  holdersSold: "SOL",
  setHoldersSold: (value) => set({ holdersSold: value }),
  topTradersBought: "SOL",
  setTopTradersBought: (value) => set({ topTradersBought: value }),
  topTradersSold: "SOL",
  setTopTradersSold: (value) => set({ topTradersSold: value }),
  myPositionInvested: "SOL",
  setMyPositionInvested: (value) => set({ myPositionInvested: value }),
  resetFilters: () =>
    set({
      tradesDateType: "DATE",
      tradesDate: "DESC",
      tradesType: {
        buy: false,
        sell: false,
        add: false,
        remove: false,
      },
      tradesTotal: {
        min: 0,
        max: 0,
      },
      tradesValue: "SOL",
      tradesTokenSol: "SOL",
      holdersBought: "SOL",
      holdersSold: "SOL",
      topTradersBought: "SOL",
      topTradersSold: "SOL",
      myPositionInvested: "SOL",
    }),
}));

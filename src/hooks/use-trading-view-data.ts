"use client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { fetchHistoricalData, fetchInitTradesData } from "@/apis/rest/candles";
import { HistoricalDataParams } from "@/apis/rest/candles";

export function useCandles({ params }: { params: HistoricalDataParams }) {
  return useQuery({
    queryKey: ["candles", params?.mint, params.currency, params.interval],
    queryFn: async () => {
      console.time("⌛ FETCHING CANDLES DATA");
      try {
        const data = await fetchHistoricalData(params);
        console.timeEnd("⌛ FETCHING CANDLES DATA");
        return data;
      } catch (error) {
        console.log("ERROR FETCHING CANDLES DATA 🚫:", error);
        throw error;
      }
    },
    // staleTime: 2_000,
  });
}
export function useTrades({ mintAddress }: { mintAddress: string }) {
  const router = useRouter();

  return useQuery({
    queryKey: ["trades", mintAddress],
    queryFn: async () => {
      console.time("⌛ FETCHING TRADES DATA");
      try {
        const data = await fetchInitTradesData(mintAddress);
        console.timeEnd("⌛ FETCHING TRADES DATA");
        return data;
      } catch (error) {
        console.log("ERROR FETCHING TRADES DATA 🚫:", error);
        router.push("/");
        throw error;
      }
    },
    staleTime: 2_000,
  });
}

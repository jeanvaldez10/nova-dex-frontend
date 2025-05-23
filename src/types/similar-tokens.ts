export interface SimilarToken {
  name: string;
  symbol: string;
  mint: string;
  dex:
    | "Pump.Fun"
    | "Moonshot"
    | "LaunchLab"
    | "Meteora"
    | "Raydium"
    | "Pump.Swap";
  image: string;
  marketCap: string;
  createdAt: number;
  lastTrade: number;
}

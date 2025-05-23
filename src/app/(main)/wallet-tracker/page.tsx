import WalletTrackerClient from "@/components/customs/WalletTrackerClient";
import { generateMetadata } from "@/utils/generateMetadata";

export const metadata = generateMetadata({
  title: "Wallet Tracker",
});

export default async function WalletTrackerPage() {
  return <WalletTrackerClient />;
}

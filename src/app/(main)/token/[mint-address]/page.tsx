import ScrollLayout from "@/components/layouts/ScrollLayout";
import TokenClientSSR from "@/components/customs/token/TokenClientSSR";

export default function TokenPage() {
  return (
    <ScrollLayout withPadding={false}>
      <TokenClientSSR />
    </ScrollLayout>
  );
}

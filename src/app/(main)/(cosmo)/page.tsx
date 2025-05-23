export const dynamic = "force-dynamic";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CosmoClient from "@/components/customs/CosmoClient";
import { generateMetadata } from "@/utils/generateMetadata";
import OnboardingModal from "@/components/customs/modals/OnboardingModal";
import NoScrollLayout from "@/components/layouts/NoScrollLayout";
import PageHeading from "@/components/customs/headings/PageHeading";
import BlacklistedModal from "@/components/customs/modals/BlacklistedModal";
import CustomCardView from "@/components/customs/CustomCardView";
import CosmoBuySettings from "@/components/customs/CosmoBuySettings";
import Separator from "@/components/customs/Separator";
import CosmoListTabSection from "@/components/customs/sections/CosmoListTabSection";
export const metadata = generateMetadata({
  title: "Cosmo",
});

export default async function Home() {
  const isNew = (await cookies()).get("isNew")?.value === "true";
  if (isNew) {
    redirect("/login");
  }
  const initialIsNewUser =
    (await cookies()).get("_is_new_user")?.value === "true";

  return (
    <>
      <NoScrollLayout>
        <div className="flex w-full flex-col flex-wrap justify-between gap-y-2 px-4 pb-4 pt-4 lg:px-0 xl:flex-row xl:items-center xl:gap-y-4">
          <div className="flex items-center gap-x-2">
            <PageHeading
              title="The Cosmo"
              description="Real-time feed of tokens throughout their lifespan."
              line={1}
            />
            <BlacklistedModal />
          </div>

          <div className="flex items-center gap-x-2">
            <CustomCardView />
            <CosmoBuySettings />
          </div>
        </div>

        <Separator color="#242436" className="hidden xl:block" />

        <CosmoListTabSection />
      </NoScrollLayout>
      <CosmoClient initialIsNewUser={initialIsNewUser} />
      {initialIsNewUser && <OnboardingModal />}
    </>
  );
}

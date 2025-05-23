// ######## Components 🧩 ########
import NoScrollLayout from "@/components/layouts/NoScrollLayout";
import PageHeading from "@/components/customs/headings/PageHeading";
import SettingsMenu from "@/components/customs/setting/SettingsMenu";
import { generateMetadata } from "@/utils/generateMetadata";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { get2FAStatus } from "@/apis/rest/settings/two-factor-auth";
import { cookies } from "next/headers";

export const metadata = generateMetadata({
  title: "Settings",
});

export default async function SettingsPage() {
  const queryClient = new QueryClient();

  const token = (await cookies()).get("_nova_session");
  await queryClient.prefetchQuery({
    queryKey: ["2faStatus"],
    queryFn: () => get2FAStatus(token?.value),
  });

  return (
    <NoScrollLayout>
      <div className="mt-4 flex w-full items-center justify-between border-border px-4 md:mt-2 md:border-t-0 md:px-0 md:pb-4 md:pt-2">
        <PageHeading title="Settings" description="" line={1} />
      </div>

      <div className="relative grid w-full flex-grow grid-cols-1 md:mb-[70px]">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <SettingsMenu />
        </HydrationBoundary>
      </div>
    </NoScrollLayout>
  );
}

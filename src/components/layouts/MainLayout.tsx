// ######## Components 🧩 ########
const Header = dynamic(() => import("@/components/layouts/partials/Header"), {
  loading: () => (
    <div className="h-[48.8px] w-full animate-pulse bg-shadeTable" />
  ),
});

const Footer = dynamic(() => import("@/components/layouts/partials/Footer"), {
  loading: () => (
    <div className="h-[42.8px] w-full animate-pulse bg-shadeTable" />
  ),
});
const GlobalSnapLayout = dynamic(() => import("./GlobalSnapLayout"));
const GarbageCollector = dynamic(
  () => import("@/components/customs/GarbageCollector"),
);
import dynamic from "next/dynamic";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex h-auto min-h-dvh w-full flex-col xl:h-screen xl:min-h-fit">
      <Header />
      <GarbageCollector />
      {/* <Cleaner /> */}
      <main className="flex w-full grow flex-col">
        <GlobalSnapLayout>{children}</GlobalSnapLayout>
      </main>
      <Footer />
    </section>
  );
}

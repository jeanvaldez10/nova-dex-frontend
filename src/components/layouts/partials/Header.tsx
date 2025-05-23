// ######## Components 🧩 ########
import Separator from "@/components/customs/Separator";
import Image from "next/image";
import Link from "next/link";
const QuickClipboard = dynamic(
  () => import("@/components/customs/QuickClipboard"),
);
const GlobalSearchModal = dynamic(
  () => import("@/components/customs/modals/GlobalSearchModal"),
);
const UserWallet = dynamic(() => import("@/components/customs/UserWallet"));
const UserAccount = dynamic(() => import("@/components/customs/UserAccount"));
const MobileNav = dynamic(
  () => import("@/components/layouts/partials/MobileNav"),
);
const NavLink = dynamic(() => import("@/components/layouts/partials/NavLink"));
const Announcement = dynamic(() => import("./Announcement"));

// ######## Utils & Helpers 🤝 ########
import dynamic from "next/dynamic";

const navigationLinks = [
  {
    label: "Cosmo",
    href: "/",
  },
  {
    label: "Trending",
    href: "/trending",
  },
  {
    label: "Wallet Tracker",
    href: "/wallet-tracker",
  },
  {
    label: "Twitter Monitor",
    href: "/twitter-monitor",
  },
  {
    label: "Holdings",
    href: "/holdings",
  },
  {
    label: "Points",
    href: "/points",
  },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-[100]">
      <Announcement />
      <div className="flex w-full justify-between border-b border-border bg-background px-4 py-2 xl:border-transparent">
        <div className="flex w-fit items-center gap-x-4">
          <Link
            href={"/"}
            prefetch
            className="relative aspect-square h-8 w-8 flex-shrink-0"
          >
            <Image
              src="/logo.png"
              alt="Nova Logo"
              fill
              quality={100}
              className="object-contain"
              loading="eager"
              priority
            />
          </Link>
          <Separator
            color="#202037"
            orientation="vertical"
            unit="fixed"
            className="hidden xl:block"
            fixedHeight={16}
          />
          <nav className="hidden items-center justify-start gap-x-3 xl:flex">
            {navigationLinks?.map((link, index) => (
              <NavLink link={link} key={index + "-" + link.label} />
            ))}
          </nav>
        </div>

        <div className="flex w-auto items-center justify-end gap-x-2">
          <QuickClipboard
            parentClassName="hidden md:flex relative right-0 top-0 translate-y-0"
            wrapperClassName="h-8 pr-1"
          />

          <GlobalSearchModal />

          <UserWallet />

          {/* <Notifications /> */}

          <UserAccount />

          <MobileNav />
        </div>
      </div>
    </header>
  );
}

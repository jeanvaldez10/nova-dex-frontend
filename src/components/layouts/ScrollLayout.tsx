// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";

export default function ScrollLayout({
  children,
  withPadding = true,
}: {
  children: React.ReactNode;
  withPadding?: boolean;
}) {
  // <TestSnapLayout scrollable>
  return (
    <main
      className={cn("flex h-auto w-full flex-col px-4", !withPadding && "px-0")}
    >
      {children}
    </main>
  );
  {
    /* </TestSnapLayout> */
  }
}

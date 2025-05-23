// ######## Components 🧩 ########
import EmptyLayout from "@/components/layouts/EmptyLayout";
import EmptyState from "@/components/customs/EmptyState";

export default function NotFoundPage() {
  return (
    <EmptyLayout>
      <div className="flex w-full flex-grow flex-col items-center justify-center bg-[#080811]">
        <EmptyState state="404" />
      </div>
    </EmptyLayout>
  );
}

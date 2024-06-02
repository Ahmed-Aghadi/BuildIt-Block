import Image from "next/image";
import { AuthCore } from "@/components/AuthCore";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900">
      <AuthCore />
    </main>
  );
}

import { AppShell } from "@/components/app/AppShell";
import { ensureProfile, getUser } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (user) {
    await ensureProfile(user.email?.split("@")[0] ?? "");
  }

  return <AppShell>{children}</AppShell>;
}

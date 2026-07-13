import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProjectId } from "@/lib/project";
import type { RynxpenseProfile } from "@/lib/types";

export const getUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export async function requireUser(): Promise<User> {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

/** For Route Handlers — returns 401 instead of redirect. */
export async function getApiUser(): Promise<User | NextResponse> {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return user;
}

export async function ensureProfile(displayName = ""): Promise<void> {
  const supabase = await createClient();
  const projectId = await getProjectId();
  await supabase.rpc("rynxpense_ensure_profile", {
    p_project_id: projectId,
    p_display_name: displayName,
  });
}

export const getProfile = cache(async (): Promise<RynxpenseProfile | null> => {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("rynxpense_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!existing || (user.email && existing.email !== user.email)) {
    await ensureProfile(user.email?.split("@")[0] ?? "");
    const { data } = await supabase
      .from("rynxpense_profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    return (data as RynxpenseProfile) ?? null;
  }

  return existing as RynxpenseProfile;
});

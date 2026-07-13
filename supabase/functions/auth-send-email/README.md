# Auth email hook — Rynxpense patch for shared `auth-send-email`

Apply these changes to the **shared** Supabase project function (same repo as InaanApp):

`inaanapp/supabase/functions/auth-send-email/templates.ts`

## 1. Add to `AuthApp` type

```ts
export type AuthApp = "debtnote" | "inaanapp" | "yes-honey" | "avocado-go" | "tekadok" | "rynxpense" | "default";
```

## 2. Add to `matchAppFromString`

```ts
if (v.includes("rynxpense")) return "rynxpense";
```

## 3. Add subject + HTML renderer

See `rynxpense-auth-email-snippet.ts` in this folder for copy-paste functions.

## 4. Supabase Auth redirect URLs

Add to shared project Auth settings:

- `rynxpense://login-callback`
- `https://rynxpense.com/**`

## OTP sign-in metadata (web + mobile)

```ts
emailRedirectTo: "rynxpense://login-callback",
data: { app: "rynxpense", app_origin: "rynxpense" },
```

import { createBrowserClient } from "@supabase/ssr";

let browserClient:
  | ReturnType<typeof createBrowserClient>
  | undefined;

export const createClient = () =>
  (browserClient ??=
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookieOptions: {
          maxAge: 60 * 60 * 24 * 365, // 1 year — survives app restarts on mobile PWA
          sameSite: "lax",
          secure: true,
          path: "/",
        },
      }
    ));

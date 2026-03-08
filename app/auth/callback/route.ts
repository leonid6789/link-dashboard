import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { SIGNUP_NAME_COOKIE } from "@/lib/supabase/client";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const cookieStore = await cookies();
        const nameCookie = cookieStore.get(SIGNUP_NAME_COOKIE)?.value;
        const name = nameCookie ? decodeURIComponent(nameCookie) : null;
        await supabase
          .from("users_tbl")
          .upsert(
            {
              id: user.id,
              email: user.email ?? undefined,
              ...(name != null && name !== "" && { name }),
            },
            { onConflict: "id" }
          );
      }
    }
  }

  const response = NextResponse.redirect(new URL("/", requestUrl.origin));
  response.cookies.set(SIGNUP_NAME_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}

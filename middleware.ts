import {
    createServerClient,
    type CookieOptions,
} from "@supabase/ssr";

import {
    NextResponse,
    type NextRequest,
} from "next/server";

type CookieToSet = {
    name: string;
    value: string;
    options: CookieOptions;
};

const PUBLIC_ROUTES = [
    "/login",
    "/manifest.json",
    "/icon-192.png",
    "/icon-512.png",
];

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    if (PUBLIC_ROUTES.includes(pathname)) {
        return NextResponse.next();
    }

    let response = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet: CookieToSet[]) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    const isAdminRoute = pathname.startsWith("/admin");
    const isStaffRoute = pathname.startsWith("/staff");

    if (isAdminRoute || isStaffRoute || pathname === "/login") {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("auth_id", user.id)
            .single();

        const role = profile?.role;

        if (pathname === "/login") {
            return NextResponse.redirect(
                new URL(
                    role === "admin" ? "/admin/dashboard" : "/staff/dashboard",
                    request.url
                )
            );
        }

        if (isAdminRoute && role !== "admin") {
            return NextResponse.redirect(
                new URL("/staff/dashboard", request.url)
            );
        }

        if (isStaffRoute && role !== "staff") {
            return NextResponse.redirect(
                new URL("/admin/dashboard", request.url)
            );
        }
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};

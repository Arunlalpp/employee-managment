"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    return (
        <button
            onClick={handleLogout}
            className="bg-black text-white px-px py-2 rounded-xl"
        >
            Logout
        </button>
    );
}
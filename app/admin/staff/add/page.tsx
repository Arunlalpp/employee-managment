import {
    Suspense,
} from "react";
import CreateStaffContent from "../../CreateStaffContent";
import Loading from "@/components/Loading";


export default function Page() {

    return (

        <Suspense
            fallback={<Loading className="px-4 pt-14 text-white" />}
        >

            <CreateStaffContent />

        </Suspense>
    );
}
import {
    Suspense,
} from "react";
import CreateStaffContent from "../../CreateStaffContent";


export default function Page() {

    return (

        <Suspense
            fallback={
                <div className="px-4 pt-14 text-white">
                    Loading...
                </div>
            }
        >

            <CreateStaffContent />

        </Suspense>
    );
}
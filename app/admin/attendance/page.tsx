import {
    Suspense,
} from "react";
import AdminAttendanceContent from "../AdminAttendanceContent";


export default function Page() {

    return (

        <Suspense
            fallback={
                <div className="px-4 pt-14 text-white">
                    Loading...
                </div>
            }
        >

            <AdminAttendanceContent />

        </Suspense>
    );
}
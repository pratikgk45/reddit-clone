import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { signIn, signOut, useSession } from "next-auth/react";
import { Tooltip } from "react-tooltip";
import Avatar from "./Avatar";

export default function SignIn() {
    const { data: session } = useSession();

    if (session) {
        return (
            <div className="flex space-x-4 items-center">
                <div 
                    data-tooltip-id="user-initials"
                    data-tooltip-place="bottom-end"
                    className="w-8 h-8 text-center items-center content-center font-medium 
                        bg-orange-500 text-white rounded-full cursor-default">
                    <Avatar imageUrl={session?.user?.image} />
                </div>
                <Tooltip id="user-initials">
                    <div>
                        <p>{session.user?.name}</p>
                    </div>
                </Tooltip>

                <div className="mx-3 flex items-center text-gray-500">
                    <ArrowRightStartOnRectangleIcon 
                        data-tooltip-id="log-out"
                        data-tooltip-place="bottom-end"
                        className="header-icon rounded-md" onClick={() => signOut()}
                    />

                    <Tooltip id="log-out">
                        Log Out
                    </Tooltip>
                </div>
            </div>
        );
    }

    return (
        <button className="flex items-center bg-orange-600 px-5 py-2 rounded-3xl text-white" onClick={() => signIn()}>
            Log In
        </button>
    )
}
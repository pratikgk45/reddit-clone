import { Bars4Icon, BellAlertIcon, ChatBubbleOvalLeftEllipsisIcon, GlobeAltIcon, MagnifyingGlassIcon, PlusCircleIcon, PlusIcon, SparklesIcon, SpeakerWaveIcon, UserIcon, VideoCameraIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import SignIn from "./SignIn";
import Link from "next/link";

export function Header() {
    return (
        <div className="sticky top-0 z-50 flex items-center bg-white px-4 py-2 shadow-sm">
            <div className="flex flex-1">
                <Link className="relative h-12 w-20 cursor-pointer" href="/">
                    <Image src="/reddit-logo.jpeg" layout="fill" alt="" objectFit="contain" />
                </Link>
            </div>

            <form className="flex flex-1 items-center space-x-2 border border-gray-300 rounded-3xl hover:border-gray-500 px-3 py-1">
                <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
                <input type="text" placeholder="Search..." className="flex-1 bg-transparent outline-none" />
                <button type="submit" hidden></button>
            </form>

            <div className="flex-1">
                {/* <div className="mx-5 space-x-2 items-center text-gray-500 hidden lg:inline-flex">
                    <SparklesIcon className="header-icon" />
                    <GlobeAltIcon className="header-icon" />
                    <VideoCameraIcon className="header-icon" />

                    <hr className="h-10 border border-gray-200"></hr>
                    
                    <ChatBubbleOvalLeftEllipsisIcon className="header-icon" />
                    <BellAlertIcon className="header-icon" />
                    <PlusIcon className="header-icon" />
                    <SpeakerWaveIcon className="header-icon" />
                </div>

                <div className="mx-3 flex items-center text-gray-500 lg:hidden">
                    <Bars4Icon className="header-icon" />
                </div> */}
            </div>
            
            <SignIn />
        </div>
    )
}
'use client';

import { shapes } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import { useSession } from "next-auth/react";

export default function Avatar({ seed, large }: Props) {
    const { data: session } = useSession();

    const image = session?.user?.image || createAvatar(shapes, {
        seed: seed || session?.user?.name || 'pikachu'
    }).toDataUriSync();

    return (
        <div className={
            `h-10 w-10 rounded-full overflow-hidden border-gray-300 bg-white ${large && 'h-20 w-20'}`
        }>
            <img alt="" src={image} />
        </div>
    );
}

interface Props {
    seed?: string;
    large?: boolean;
}
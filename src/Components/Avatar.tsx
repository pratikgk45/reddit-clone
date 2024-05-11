'use client';

import { shapes } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";

export default function Avatar({ seed, large, imageUrl }: Props) {
    const image = imageUrl || createAvatar(shapes, {
        seed: seed || 'pikachu'
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
    imageUrl?: string | null;
}
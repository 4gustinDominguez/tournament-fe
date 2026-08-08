import { Player } from "./player";

export interface Team {
    id: string;
    name: string;
    logo?: string;
    tournaments: string[];
    player?: Player[];
    placeId?: string;
    coach?: string;
    crestUrl?: string;
    kitColor?: string;
    kitPattern?: 'solid' | 'horizontal-stripes' | 'vertical-stripes' | 'quartered' | 'sash';
    kitColors?: string[];
    formation?: {
        gameFormat: '5' | '7' | '11';
        formationType: string;
        positions: Record<string, string | null>;
    };
}
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
}
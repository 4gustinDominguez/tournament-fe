'use client';

import { createApiTournamentRepository } from "@/modules/tournament/infrastructure/api-tournament-repository";
import { TournamentContextProvider } from "./tournaments-context";
import { ReactNode, useState } from "react";

export function TournamentProvider({ children }: { children: ReactNode }) {
    const [repository] = useState(() => createApiTournamentRepository());

    return (
        <TournamentContextProvider repository={repository}>
            {children}
        </TournamentContextProvider>
    );
}
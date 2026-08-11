'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { TeamStats } from '@/modules/tournament/domain/standings';
import { Team } from '@/modules/tournament/domain/team';
import { TeamCrest } from './TeamCrest';
import { useTranslations } from 'next-intl';

interface StandingsTableProps {
    standings: TeamStats[];
    teams?: Team[];
}

const positionBadge = (index: number) => {
    if (index === 0) return "bg-amber-400 text-amber-950 shadow-card";
    if (index === 1) return "bg-neutral-300 text-neutral-800";
    if (index === 2) return "bg-amber-700 text-amber-50";
    return "bg-neutral-100 text-muted-foreground";
};

const StandingsTable: React.FC<StandingsTableProps> = ({ standings, teams = [] }) => {
    const t = useTranslations('Standings');

    const getTeamCrest = (teamId: string) => {
        return teams.find(t => t.id === teamId)?.crestUrl;
    };
    return (
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <Table>
                <TableHeader className="bg-neutral-50">
                    <TableRow>
                        <TableHead className="w-[50px] text-center font-black">{t('headers.pos')}</TableHead>
                        <TableHead className="font-black">{t('headers.team')}</TableHead>
                        <TableHead className="text-center font-black">{t('headers.played')}</TableHead>
                        <TableHead className="text-center font-black">{t('headers.won')}</TableHead>
                        <TableHead className="text-center font-black">{t('headers.drawn')}</TableHead>
                        <TableHead className="text-center font-black">{t('headers.lost')}</TableHead>
                        <TableHead className="text-center font-black hidden sm:table-cell">{t('headers.gf')}</TableHead>
                        <TableHead className="text-center font-black hidden sm:table-cell">{t('headers.gc')}</TableHead>
                        <TableHead className="text-center font-black">{t('headers.dg')}</TableHead>
                        <TableHead className="text-center font-black bg-brand-500/5 text-brand-700">{t('headers.pts')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {standings.map((team, index) => (
                        <TableRow key={team.teamId} className="group transition-colors hover:bg-brand-50/30">
                            <TableCell className="text-center">
                                <span className={cn(
                                    "inline-flex items-center justify-center h-6 w-6 rounded-md font-display font-bold text-xs",
                                    positionBadge(index)
                                )}>
                                    {index + 1}
                                </span>
                            </TableCell>
                            <TableCell className="font-bold tracking-tight text-foreground">
                                <div className="flex items-center gap-2">
                                    <TeamCrest crestId={getTeamCrest(team.teamId)} teamName={team.teamName} size={28} />
                                    {team.teamName}
                                </div>
                            </TableCell>
                            <TableCell className="text-center font-medium text-muted-foreground">{team.played}</TableCell>
                            <TableCell className="text-center font-bold text-brand-600">{team.won}</TableCell>
                            <TableCell className="text-center font-medium text-muted-foreground">{team.drawn}</TableCell>
                            <TableCell className="text-center font-medium text-destructive">{team.lost}</TableCell>
                            <TableCell className="text-center text-muted-foreground hidden sm:table-cell">{team.goalsFor}</TableCell>
                            <TableCell className="text-center text-muted-foreground hidden sm:table-cell">{team.goalsAgainst}</TableCell>
                            <TableCell className={cn("text-center font-bold", team.goalDifference > 0 ? 'text-brand-600' : team.goalDifference < 0 ? 'text-destructive' : 'text-muted-foreground')}>
                                {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                            </TableCell>
                            <TableCell className="text-center font-black text-brand-700 bg-brand-500/5">
                                {team.points}
                            </TableCell>
                        </TableRow>
                    ))}
                    {standings.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={10} className="h-24 text-center italic text-muted-foreground">
                                {t('empty')}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default StandingsTable;

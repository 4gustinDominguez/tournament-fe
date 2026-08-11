'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import EditPlayerForm from "@/components/EditPlayerForm";
import PlayerStatisticsCard from "@/components/PlayerStatisticsCard";
import { useTournamentContext } from "@/sections/tournaments/tournaments-context";
import { useAuth, UserRole } from '@/sections/tournaments/auth-context';
import { Link, useRouter } from '@/navigation';
import { Button } from "@/components/ui/button";
import { useTranslations } from 'next-intl';
import { UserRound, Trash2 } from 'lucide-react';
import { notify } from '@/lib/notify';

export default function PlayerPage() {
    const t = useTranslations('PlayerPage');
    const tCommon = useTranslations('Common');
    const params = useParams();
    const tournamentId = params.id as string;
    const teamId = params.teams as string;
    const playerId = params.playerId as string;

    const { getTeams, teams, tournaments, deletePlayer } = useTournamentContext();
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [showEdit, setShowEdit] = useState(false);

    const tournament = tournaments.find(t => String(t.id) === tournamentId);
    const team = teams.find(t => String(t.id) === teamId);
    const player = team?.player?.find(p => String(p.id) === playerId);

    const isOwner = tournament?.ownerId === user?.id;
    const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
    const canManage = isAuthenticated && (isSuperAdmin || isOwner);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                await getTeams(tournamentId);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        }

        if (tournamentId && (!team || !player)) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [tournamentId, team, player, getTeams]);

    const handleDeletePlayer = async () => {
        if (confirm(t('deleteConfirm'))) {
            try {
                await deletePlayer({ playerId, tournamentId });
                notify.success(t('deleteSuccess'));
                router.push(`/manage/my-tournaments/${tournamentId}/${teamId}`);
            } catch (error: any) {
                notify.error(error?.message || t('deleteError'));
            }
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">{t('loading')}</div>;
    if (!player || !team) return (
        <div className="p-8 text-center space-y-4">
            <div className="text-destructive text-xl font-bold">{t('notFound')}</div>
            <Link href={`/manage/my-tournaments/${tournamentId}/${teamId}`} className="text-brand-600 hover:underline">
                {t('backToTeam')}
            </Link>
        </div>
    );

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="display-title text-3xl md:text-4xl text-foreground flex items-center gap-3">
                        <span className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 grid place-items-center">
                            <UserRound className="h-5 w-5" />
                        </span>
                        {player.name}
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium">
                        @{player.nickname} · {team.name}
                    </p>
                </div>
                {canManage && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDeletePlayer}
                        className="h-9 text-destructive hover:text-destructive hover:bg-red-50 font-bold"
                    >
                        <Trash2 className="h-4 w-4 mr-2" /> {tCommon('delete')}
                    </Button>
                )}
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Header Card */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl shadow-card border border-border overflow-hidden">
                        <div className="h-32 bg-gradient-to-br from-night-800 via-brand-800 to-brand-700 relative">
                            {canManage && (
                                <button
                                    onClick={() => setShowEdit(!showEdit)}
                                    className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md transition-all"
                                    title={t('editProfile')}
                                >
                                    {showEdit ? '✕' : '✎'}
                                </button>
                            )}
                        </div>
                        <div className="px-6 pb-6 text-center -mt-16 relative">
                            <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-elevated mx-auto overflow-hidden bg-neutral-100 mb-4">
                                {player.photoUrl ? (
                                    <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl text-muted-foreground/40">
                                        👤
                                    </div>
                                )}
                            </div>
                            <h1 className="display-title text-3xl text-foreground leading-tight">{player.name}</h1>
                            <p className="text-brand-600 font-bold">@{player.nickname}</p>

                            <div className="mt-4 flex flex-wrap justify-center gap-2">
                                {player.position && (
                                    <span className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-black uppercase tracking-wider border border-brand-100">
                                        {player.position}
                                    </span>
                                )}
                                <span className="px-3 py-1 bg-neutral-50 text-muted-foreground rounded-full text-xs font-black uppercase tracking-wider border border-border">
                                    {team.name}
                                </span>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-4 text-center border-t border-border pt-6">
                                <div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase">{t('height')}</p>
                                    <p className="font-bold text-foreground">{player.height ? `${player.height} cm` : '--'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase">{t('weight')}</p>
                                    <p className="font-bold text-foreground">{player.weight ? `${player.weight} kg` : '--'}</p>
                                </div>
                            </div>

                            {player.socialMedia && (player.socialMedia.instagram || player.socialMedia.twitter) && (
                                <div className="mt-6 flex justify-center gap-4 border-t border-border pt-6">
                                    {player.socialMedia.instagram && (
                                        <a href={player.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:scale-110 transition-transform">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                        </a>
                                    )}
                                    {player.socialMedia.twitter && (
                                        <a href={player.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-foreground hover:scale-110 transition-transform">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profile Details (Stats or Edit Form) */}
                <div className="md:col-span-2 space-y-6">
                    {showEdit ? (
                        <div className="bg-white rounded-2xl shadow-card border border-border p-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="display-title text-2xl text-foreground">{t('editTitle')}</h2>
                                <button onClick={() => setShowEdit(false)} className="text-muted-foreground hover:text-foreground transition-colors font-medium">{tCommon('cancel')}</button>
                            </div>
                            <EditPlayerForm
                                player={player}
                                teamId={teamId}
                                tournamentId={tournamentId}
                                onSuccess={() => setShowEdit(false)}
                            />
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="bg-white rounded-2xl shadow-card border border-border p-8">
                                <h2 className="display-title text-2xl text-foreground mb-6 flex items-center gap-2">
                                    <span className="text-2xl">📊</span> {t('statsTitle')}
                                </h2>
                                <PlayerStatisticsCard statistics={player.statistics || {
                                    matchesPlayed: 0,
                                    goals: 0,
                                    assists: 0,
                                    yellowCards: 0,
                                    redCards: 0,
                                    minutesPlayed: 0
                                }} />
                            </div>

                            <div className="bg-gradient-to-br from-night-800 via-brand-800 to-brand-700 rounded-2xl p-8 text-white shadow-elevated overflow-hidden relative group">
                                <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-brand-600 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                <h3 className="display-title text-2xl tracking-tight mb-2">{t('upcomingMatches')}</h3>
                                <p className="text-night-100 text-sm mb-6">{t('upcomingText', { team: team.name })}</p>
                                <Link
                                    href={`/manage/my-tournaments/${tournamentId}`}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-900 font-bold rounded-xl hover:bg-brand-50 transition-colors"
                                >
                                    {t('viewCalendar')} &rarr;
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="text-center">
                <Link
                    href={`/manage/my-tournaments/${tournamentId}/${teamId}`}
                    className="text-muted-foreground hover:text-brand-600 font-bold transition-colors flex items-center justify-center gap-2"
                >
                    &larr; {t('backToTeamName', { team: team.name })}
                </Link>
            </div>
        </div>
    );
}

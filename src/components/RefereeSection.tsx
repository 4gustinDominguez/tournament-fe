'use client';

import React, { useEffect, useState } from 'react';
import Image from "next/image";
import { useTournamentContext } from '@/sections/tournaments/tournaments-context';
import CreateRefereeForm from './CreateRefereeForm';
import { EditRefereeForm } from './EditRefereeForm';
import { useAuth, UserRole } from '@/sections/tournaments/auth-context';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    User as UserIcon,
    Link as LinkIcon,
    Plus,
    CheckCircle2,
    Mail,
    ShieldCheck,
    Search,
    AlertCircle,
    Trash2,
    Pencil,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Referee } from "@/modules/referees/domain/referee";
import { notify } from "@/lib/notify";

interface RefereeSectionProps {
    tournamentId: string;
}

const RefereeSection: React.FC<RefereeSectionProps> = ({ tournamentId }) => {
    const t = useTranslations('Referees');
    const tCommon = useTranslations('Common');
    const { getReferees, referees, tournaments, getAllReferees, updateReferee, deleteReferee } = useTournamentContext();
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);
    const [allReferees, setAllReferees] = useState<any[]>([]);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [selectedRefereeId, setSelectedRefereeId] = useState('');
    const [linking, setLinking] = useState(false);
    const [editingReferee, setEditingReferee] = useState<Referee | null>(null);

    const tournament = tournaments.find(t => t.id === tournamentId);
    const isOwner = tournament?.ownerId === user?.id;
    const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
    const canManage = isAuthenticated && (isSuperAdmin || isOwner);

    useEffect(() => {
        const fetchReferees = async () => {
            setLoading(true);
            try {
                await getReferees(tournamentId);
            } catch (error) {
                console.error("Error fetching referees:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReferees();
    }, [tournamentId, getReferees]);

    const handleLinkReferee = async () => {
        if (!selectedRefereeId) return;
        setLinking(true);
        try {
            const refereeToLink = allReferees.find(r => r.id === selectedRefereeId);
            if (refereeToLink) {
                const updatedReferee = {
                    ...refereeToLink,
                    tournamentIds: [...(refereeToLink.tournamentIds || []), tournamentId]
                };

                await updateReferee(updatedReferee);
                await getReferees(tournamentId); // Refresh list
                setShowLinkModal(false);
                setSelectedRefereeId('');
            }
        } catch (error) {
            console.error("Error linking referee:", error);
        } finally {
            setLinking(false);
        }
    };

    const openLinkModal = async () => {
        setLoading(true);
        try {
            const all = await getAllReferees();
            // Filter out referees already in this tournament
            const available = all.filter(r => !referees.some(existing => existing.id === r.id));
            setAllReferees(available);
            setShowLinkModal(true);
        } catch (error) {
            console.error("Error loading all referees:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReferee = async (refereeId: string) => {
        if (confirm(t('deleteConfirm'))) {
            try {
                await deleteReferee({ refereeId, tournamentId });
                notify.success(t('deleteSuccess'));
            } catch (error: any) {
                notify.error(error?.message || t('deleteError'));
            }
        }
    };

    const handleSaveEdit = async (updates: Partial<Referee>) => {
        if (!editingReferee) return;
        await updateReferee({ ...editingReferee, ...updates });
        setEditingReferee(null);
    };

    if (loading && !showLinkModal) {
        return (
            <div className="space-y-6 mt-8">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-28 w-full rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8 space-y-8 pb-10">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h2 className="display-title text-2xl md:text-3xl text-foreground">{t('title')}</h2>
                    <p className="text-sm text-muted-foreground">
                        {t('count', { count: referees.length })}
                    </p>
                </div>

                {canManage && (
                    <div className="flex items-center gap-3">
                        <Dialog open={showLinkModal} onOpenChange={setShowLinkModal}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={openLinkModal} className="font-bold border-border">
                                    <LinkIcon className="mr-2 h-4 w-4" /> {t('linkExisting')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold">{t('linkTitle')}</DialogTitle>
                                    <DialogDescription>
                                        {t('linkDescription')}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-6">
                                    {allReferees.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                                            <AlertCircle className="h-8 w-8 text-muted-foreground opacity-50" />
                                            <p className="text-sm text-muted-foreground font-medium">{t('noAvailable')}</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                                                    {t('searchReferee')}
                                                </label>
                                                <Select value={selectedRefereeId} onValueChange={setSelectedRefereeId}>
                                                    <SelectTrigger className="w-full h-12 bg-gray-50/50 border-gray-100">
                                                        <SelectValue placeholder={t('selectPlaceholder')} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {allReferees.map(r => (
                                                            <SelectItem key={r.id} value={r.id} className="py-3">
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold">{r.name}</span>
                                                                    <span className="text-xs text-muted-foreground">{r.email || t('noEmail')}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button variant="ghost" onClick={() => setShowLinkModal(false)} className="font-bold">
                                        {tCommon('cancel')}
                                    </Button>
                                    <Button
                                        onClick={handleLinkReferee}
                                        disabled={!selectedRefereeId || linking}
                                        className="bg-primary px-8 font-bold"
                                    >
                                        {linking ? t('linking') : t('confirmLink')}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </header>

            {referees.length === 0 ? (
                <Card className="bg-muted/30 border-dashed border-2 py-10">
                    <CardContent className="flex flex-col items-center justify-center space-y-4">
                        <div className="p-4 rounded-3xl bg-white shadow-sm ring-1 ring-gray-100">
                            <ShieldCheck className="h-8 w-8 text-muted-foreground opacity-50" />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-lg font-bold text-gray-700">{t('emptyTitle')}</p>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto italic">
                                {t('emptyText')}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {referees.map((referee) => (
                        <Card key={referee.id} className="group overflow-hidden border-border shadow-card hover:shadow-elevated transition-all duration-300 rounded-2xl">
                            <CardContent className="p-0">
                                <div className="p-6 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            {referee.photoUrl ? (
                                                <div className="h-10 w-10 rounded-xl overflow-hidden flex-shrink-0">
                                                    <Image
                                                        src={referee.photoUrl}
                                                        alt={referee.name}
                                                        width={40}
                                                        height={40}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-display font-bold">
                                                    {referee.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="font-bold text-foreground group-hover:text-brand-600 transition-colors line-clamp-1">
                                                    {referee.name}
                                                </h3>
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                                    <Mail className="h-3 w-3" />
                                                    <span className="truncate">{referee.email || t('noEmail')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-border flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {referee.userId ? (
                                                <Badge variant="secondary" className="bg-status-success-soft text-brand-700 hover:bg-status-success-soft border-none font-bold text-[10px] flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3" /> {t('activeAccount')}
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-muted-foreground border-border text-[10px] font-bold">
                                                    {t('noAccount')}
                                                </Badge>
                                            )}
                                        </div>
                                        {canManage && (
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="sm" onClick={() => setEditingReferee(referee)} className="h-8 font-bold text-[10px] tracking-wider uppercase hover:bg-brand-50 hover:text-brand-600">
                                                    <Pencil className="h-3 w-3 mr-1" /> {tCommon('edit')}
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteReferee(referee.id)} className="h-8 text-destructive font-bold text-[10px] tracking-wider uppercase hover:text-destructive hover:bg-red-50">
                                                    <Trash2 className="h-3 w-3 mr-1" /> {tCommon('delete')}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {canManage && (
                <div className="pt-12 border-t border-border">
                    <div className="bg-white rounded-2xl border border-border shadow-card overflow-hidden">
                        <div className="bg-neutral-50/50 px-8 py-4 border-b border-border flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-brand-50 text-brand-600">
                                <Plus className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-lg">{t('registerNew')}</h3>
                        </div>
                        <div className="p-8">
                            <CreateRefereeForm tournamentId={tournamentId} />
                        </div>
                    </div>
                </div>
            )}

            <Dialog open={!!editingReferee} onOpenChange={(open) => !open && setEditingReferee(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">{t('editReferee')}</DialogTitle>
                    </DialogHeader>
                    {editingReferee && (
                        <EditRefereeForm
                            referee={editingReferee}
                            onSave={handleSaveEdit}
                            onCancel={() => setEditingReferee(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default RefereeSection;

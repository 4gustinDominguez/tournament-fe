'use client';
import React from "react";
import { PlayerStatistics } from "@/modules/tournament/domain/player";
import { useTranslations } from "next-intl";

interface PlayerStatisticsCardProps {
    statistics: PlayerStatistics;
}

const PlayerStatisticsCard: React.FC<PlayerStatisticsCardProps> = ({ statistics }) => {
    const t = useTranslations('PlayerStats');
    const stats = [
        { label: t('matches'), value: statistics.matchesPlayed, icon: "🏟️" },
        { label: t('goals'), value: statistics.goals, icon: "⚽" },
        { label: t('assists'), value: statistics.assists, icon: "🎯" },
        { label: t('yellowCards'), value: statistics.yellowCards, icon: "🟨" },
        { label: t('redCards'), value: statistics.redCards, icon: "🟥" },
        { label: t('minutes'), value: statistics.minutesPlayed, icon: "⏱️" },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="bg-white p-4 rounded-xl border border-border shadow-card flex flex-col items-center justify-center text-center hover:shadow-elevated transition-shadow"
                >
                    <span className="text-2xl mb-1">{stat.icon}</span>
                    <span className="text-xl font-bold text-foreground">{stat.value}</span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                        {stat.label}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default PlayerStatisticsCard;

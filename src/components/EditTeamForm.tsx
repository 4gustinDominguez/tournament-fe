'use client';
import React, { ChangeEvent, useState, useEffect } from 'react';
import { Team } from '@/modules/tournament/domain/team';
import { useTournamentContext } from '@/sections/tournaments/tournaments-context';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';

type KitPattern = 'solid' | 'horizontal-stripes' | 'vertical-stripes' | 'quartered' | 'sash';

interface EditTeamFormProps {
    team: Team;
    kitPattern: KitPattern;
    kitColors: string[];
    onKitChange: (patch: { kitPattern?: KitPattern; kitColors?: string[] }) => void;
}

function getKitPreviewStyle(pattern: KitPattern, colors: string[]): React.CSSProperties {
    const [c0, c1 = '#ffffff', c2 = '#ffffff', c3 = '#ffffff'] = colors;
    const base = c0 || '#000000';

    switch (pattern) {
        case 'solid':
            return { background: base };
        case 'horizontal-stripes':
            return {
                background: `repeating-linear-gradient(0deg, ${base} 0% 50%, ${c1} 50% 100%)`,
            };
        case 'vertical-stripes':
            return {
                background: `repeating-linear-gradient(90deg, ${base} 0% 50%, ${c1} 50% 100%)`,
            };
        case 'quartered':
            return {
                background: `conic-gradient(${base} 0deg 90deg, ${c1} 90deg 180deg, ${c2} 180deg 270deg, ${c3} 270deg 360deg)`,
            };
        case 'sash':
            return {
                background: `linear-gradient(135deg, ${base} 50%, ${c1} 50%)`,
            };
    }
}

const EditTeamForm: React.FC<EditTeamFormProps> = ({ team, kitPattern, kitColors, onKitChange }) => {
    const t = useTranslations('EditTeamForm');
    const { places, getPlaces } = useTournamentContext();
    const [localColors, setLocalColors] = useState<string[]>(kitColors);

    useEffect(() => {
        getPlaces(team.tournaments[0]);
    }, [team.tournaments, getPlaces]);

    useEffect(() => {
        setLocalColors(kitColors);
    }, [kitColors]);

    function handlePatternChange(event: ChangeEvent<HTMLSelectElement>): void {
        onKitChange({ kitPattern: event.target.value as KitPattern });
    }

    function handleColorChange(index: number, value: string): void {
        const updated = [...localColors];
        updated[index] = value;
        setLocalColors(updated);
        onKitChange({ kitColors: updated });
    }

    function addColor(): void {
        if (localColors.length >= 4) return;
        const updated = [...localColors, '#ffffff'];
        setLocalColors(updated);
        onKitChange({ kitColors: updated });
    }

    function removeColor(index: number): void {
        if (localColors.length <= 1) return;
        const updated = localColors.filter((_, i) => i !== index);
        setLocalColors(updated);
        onKitChange({ kitColors: updated });
    }

    return (
        <div className="space-y-4">
            <div className="mb-4 flex items-center justify-center">
                <div
                    className="w-24 h-32 rounded-lg border border-border shadow-inner"
                    style={getKitPreviewStyle(kitPattern, localColors)}
                />
            </div>

            <label className="block mb-4">
                <span className="text-sm font-semibold text-foreground">{t('kitPattern')}</span>
                <select
                    name="kitPattern"
                    value={kitPattern}
                    onChange={handlePatternChange}
                    className="border border-input rounded-lg px-3 py-2 mt-1 w-full bg-white text-foreground focus:ring-2 focus:ring-ring outline-none"
                >
                    <option value="solid">{t('kitPatternSolid')}</option>
                    <option value="horizontal-stripes">{t('kitPatternHorizontalStripes')}</option>
                    <option value="vertical-stripes">{t('kitPatternVerticalStripes')}</option>
                    <option value="quartered">{t('kitPatternQuartered')}</option>
                    <option value="sash">{t('kitPatternSash')}</option>
                </select>
            </label>

            <div className="mb-2">
                <span className="text-sm font-semibold text-foreground">{t('kitColors')}</span>
                <div className="flex flex-wrap gap-2 mt-1">
                    {localColors.map((color, i) => (
                        <div key={i} className="flex items-center gap-1">
                            <input
                                type="color"
                                value={color || '#000000'}
                                onChange={(e) => handleColorChange(i, e.target.value)}
                                className="h-10 w-12 border border-input rounded-md cursor-pointer bg-white"
                            />
                            <input
                                type="text"
                                value={color}
                                onChange={(e) => handleColorChange(i, e.target.value)}
                                placeholder="#000000"
                                className="w-24 border border-input rounded-lg px-2 py-1.5 bg-white text-foreground text-sm focus:ring-2 focus:ring-ring outline-none"
                            />
                            {localColors.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeColor(i)}
                                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                    title={t('kitColorRemove')}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                {localColors.length < 4 && (
                    <button
                        type="button"
                        onClick={addColor}
                        className="mt-2 text-sm text-brand-600 hover:text-brand-800 font-medium transition-colors"
                    >
                        + {t('kitColorAdd')}
                    </button>
                )}
            </div>
        </div>
    );
};

export default EditTeamForm;

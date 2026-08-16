"use client";
import React, { useState, useEffect, useRef } from "react";
import { Team } from "@/modules/tournament/domain/team";
import { useTranslations } from "next-intl";
import { Shirt } from "lucide-react";

type GameFormat = "5" | "7" | "11";

interface Position {
  id: string;
  row: number;
  col: number;
  label: string;
}

interface FormationPreset {
  type: string;
  label: string;
  positions: Position[];
}

const FORMATION_PRESETS: Record<GameFormat, FormationPreset[]> = {
  "5": [
    {
      type: "1-2-1",
      label: "1-2-1",
      positions: [
        { id: "pos-0-0", row: 0, col: 0, label: "GK" },
        { id: "pos-1-0", row: 1, col: 0, label: "DEF" },
        { id: "pos-2-0", row: 2, col: 0, label: "MID" },
        { id: "pos-2-1", row: 2, col: 1, label: "MID" },
        { id: "pos-3-0", row: 3, col: 0, label: "FWD" },
      ],
    },
    {
      type: "1-2-2",
      label: "1-2-2",
      positions: [
        { id: "pos-0-0", row: 0, col: 0, label: "GK" },
        { id: "pos-1-0", row: 1, col: 0, label: "DEF" },
        { id: "pos-1-1", row: 1, col: 1, label: "DEF" },
        { id: "pos-2-0", row: 2, col: 0, label: "FWD" },
        { id: "pos-2-1", row: 2, col: 1, label: "FWD" },
      ],
    },
  ],
  "7": [
    {
      type: "1-2-3-1",
      label: "1-2-3-1",
      positions: [
        { id: "pos-0-0", row: 0, col: 0, label: "GK" },
        { id: "pos-1-0", row: 1, col: 0, label: "DEF" },
        { id: "pos-1-1", row: 1, col: 1, label: "DEF" },
        { id: "pos-2-0", row: 2, col: 0, label: "MID" },
        { id: "pos-2-1", row: 2, col: 1, label: "MID" },
        { id: "pos-2-2", row: 2, col: 2, label: "MID" },
        { id: "pos-3-0", row: 3, col: 0, label: "FWD" },
      ],
    },
    {
      type: "1-3-2-1",
      label: "1-3-2-1",
      positions: [
        { id: "pos-0-0", row: 0, col: 0, label: "GK" },
        { id: "pos-1-0", row: 1, col: 0, label: "DEF" },
        { id: "pos-1-1", row: 1, col: 1, label: "DEF" },
        { id: "pos-1-2", row: 1, col: 2, label: "DEF" },
        { id: "pos-2-0", row: 2, col: 0, label: "MID" },
        { id: "pos-2-1", row: 2, col: 1, label: "MID" },
        { id: "pos-3-0", row: 3, col: 0, label: "FWD" },
      ],
    },
    {
      type: "1-2-2-2",
      label: "1-2-2-2",
      positions: [
        { id: "pos-0-0", row: 0, col: 0, label: "GK" },
        { id: "pos-1-0", row: 1, col: 0, label: "DEF" },
        { id: "pos-1-1", row: 1, col: 1, label: "DEF" },
        { id: "pos-2-0", row: 2, col: 0, label: "MID" },
        { id: "pos-2-1", row: 2, col: 1, label: "MID" },
        { id: "pos-3-0", row: 3, col: 0, label: "FWD" },
        { id: "pos-3-1", row: 3, col: 1, label: "FWD" },
      ],
    },
  ],
  "11": [
    {
      type: "4-4-2",
      label: "4-4-2",
      positions: [
        { id: "pos-0-0", row: 0, col: 0, label: "GK" },
        { id: "pos-1-0", row: 1, col: 0, label: "RB" },
        { id: "pos-1-1", row: 1, col: 1, label: "CB" },
        { id: "pos-1-2", row: 1, col: 2, label: "CB" },
        { id: "pos-1-3", row: 1, col: 3, label: "LB" },
        { id: "pos-2-0", row: 2, col: 0, label: "RM" },
        { id: "pos-2-1", row: 2, col: 1, label: "CM" },
        { id: "pos-2-2", row: 2, col: 2, label: "CM" },
        { id: "pos-2-3", row: 2, col: 3, label: "LM" },
        { id: "pos-3-0", row: 3, col: 0, label: "ST" },
        { id: "pos-3-1", row: 3, col: 1, label: "ST" },
      ],
    },
    {
      type: "4-3-3",
      label: "4-3-3",
      positions: [
        { id: "pos-0-0", row: 0, col: 0, label: "GK" },
        { id: "pos-1-0", row: 1, col: 0, label: "RB" },
        { id: "pos-1-1", row: 1, col: 1, label: "CB" },
        { id: "pos-1-2", row: 1, col: 2, label: "CB" },
        { id: "pos-1-3", row: 1, col: 3, label: "LB" },
        { id: "pos-2-0", row: 2, col: 0, label: "CM" },
        { id: "pos-2-1", row: 2, col: 1, label: "CM" },
        { id: "pos-2-2", row: 2, col: 2, label: "CM" },
        { id: "pos-3-0", row: 3, col: 0, label: "RW" },
        { id: "pos-3-1", row: 3, col: 1, label: "ST" },
        { id: "pos-3-2", row: 3, col: 2, label: "LW" },
      ],
    },
    {
      type: "3-5-2",
      label: "3-5-2",
      positions: [
        { id: "pos-0-0", row: 0, col: 0, label: "GK" },
        { id: "pos-1-0", row: 1, col: 0, label: "CB" },
        { id: "pos-1-1", row: 1, col: 1, label: "CB" },
        { id: "pos-1-2", row: 1, col: 2, label: "CB" },
        { id: "pos-2-0", row: 2, col: 0, label: "RM" },
        { id: "pos-2-1", row: 2, col: 1, label: "CM" },
        { id: "pos-2-2", row: 2, col: 2, label: "CM" },
        { id: "pos-2-3", row: 2, col: 3, label: "CM" },
        { id: "pos-2-4", row: 2, col: 4, label: "LM" },
        { id: "pos-3-0", row: 3, col: 0, label: "ST" },
        { id: "pos-3-1", row: 3, col: 1, label: "ST" },
      ],
    },
    {
      type: "4-2-3-1",
      label: "4-2-3-1",
      positions: [
        { id: "pos-0-0", row: 0, col: 0, label: "GK" },
        { id: "pos-1-0", row: 1, col: 0, label: "RB" },
        { id: "pos-1-1", row: 1, col: 1, label: "CB" },
        { id: "pos-1-2", row: 1, col: 2, label: "CB" },
        { id: "pos-1-3", row: 1, col: 3, label: "LB" },
        { id: "pos-2-0", row: 2, col: 0, label: "CDM" },
        { id: "pos-2-1", row: 2, col: 1, label: "CDM" },
        { id: "pos-3-0", row: 3, col: 0, label: "RW" },
        { id: "pos-3-1", row: 3, col: 1, label: "CAM" },
        { id: "pos-3-2", row: 3, col: 2, label: "LW" },
        { id: "pos-4-0", row: 4, col: 0, label: "ST" },
      ],
    },
  ],
};

function getPlayerInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

interface FormationBoardProps {
  team: Team;
  formation: Team["formation"];
  onFormationChange: (formation: Team["formation"]) => void;
}

const FormationBoard: React.FC<FormationBoardProps> = ({
  team,
  formation,
  onFormationChange,
}) => {
  const t = useTranslations("EditTeamForm");
  const rosterPlayers = team.player || [];

  const [gameFormat, setGameFormat] = useState<GameFormat>(
    formation?.gameFormat || "5",
  );
  const [formationType, setFormationType] = useState(
    formation?.formationType || FORMATION_PRESETS["5"][0].type,
  );
  const [positions, setPositions] = useState<Record<string, string | null>>(
    formation?.positions || {},
  );
  const [openDropdownFor, setOpenDropdownFor] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentPresets = FORMATION_PRESETS[gameFormat];
  const currentPreset =
    currentPresets.find((p) => p.type === formationType) || currentPresets[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenDropdownFor(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function switchFormat(newFormat: GameFormat) {
    const newPresets = FORMATION_PRESETS[newFormat];
    const newPreset = newPresets[0];
    const labelToPlayer: Record<string, string | null> = {};
    Object.entries(positions).forEach(([posId, playerId]) => {
      const oldPos = currentPreset.positions.find((p) => p.id === posId);
      if (oldPos) {
        labelToPlayer[oldPos.label] = playerId;
      }
    });

    const newPositions: Record<string, string | null> = {};
    newPreset.positions.forEach((pos) => {
      newPositions[pos.id] = labelToPlayer[pos.label] ?? null;
    });

    setGameFormat(newFormat);
    setFormationType(newPreset.type);
    setPositions(newPositions);
    setOpenDropdownFor(null);
    onFormationChange({
      gameFormat: newFormat,
      formationType: newPreset.type,
      positions: newPositions,
    });
  }

  function handleFormationTypeChange(newType: string) {
    const newPreset = currentPresets.find((p) => p.type === newType);
    if (!newPreset) return;

    const labelToPlayer: Record<string, string | null> = {};
    currentPreset.positions.forEach((pos) => {
      labelToPlayer[pos.label] = positions[pos.id] ?? null;
    });

    const newPositions: Record<string, string | null> = {};
    newPreset.positions.forEach((pos) => {
      newPositions[pos.id] = labelToPlayer[pos.label] ?? null;
    });

    setFormationType(newType);
    setPositions(newPositions);
    setOpenDropdownFor(null);
    onFormationChange({
      gameFormat,
      formationType: newType,
      positions: newPositions,
    });
  }

  function handlePlayerChange(positionId: string, playerId: string) {
    const next = { ...positions, [positionId]: playerId || null };
    setPositions(next);
    setOpenDropdownFor(null);
    onFormationChange({ gameFormat, formationType, positions: next });
  }

  const maxColsByFormat: Record<GameFormat, number> = {
    "5": 2,
    "7": 3,
    "11": 5,
  };
  const totalCols = maxColsByFormat[gameFormat];

  const rows = currentPreset.positions.reduce<number[][]>((acc, pos) => {
    if (!acc[pos.row]) acc[pos.row] = [];
    if (!acc[pos.row].includes(pos.col)) acc[pos.row].push(pos.col);
    return acc;
  }, []);

  return (
    <div className="space-y-4" ref={dropdownRef}>
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label className="text-sm font-semibold text-foreground mr-2">
            {t("formationFormat")}
          </label>
          <select
            value={gameFormat}
            onChange={(e) => switchFormat(e.target.value as GameFormat)}
            className="border border-input rounded-lg px-3 py-2 bg-white text-foreground focus:ring-2 focus:ring-ring outline-none"
          >
            <option value="5">5</option>
            <option value="7">7</option>
            <option value="11">11</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-foreground mr-2">
            {t("formationType")}
          </label>
          <select
            value={formationType}
            onChange={(e) => handleFormationTypeChange(e.target.value)}
            className="border border-input rounded-lg px-3 py-2 bg-white text-foreground focus:ring-2 focus:ring-ring outline-none"
          >
            {currentPresets.map((preset) => (
              <option key={preset.type} value={preset.type}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-green-800 rounded-xl p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-full bg-white" />
          <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 h-px bg-white" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-white" />
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-40 h-16 border-2 border-white rounded-t-full" />
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-16 border-2 border-white rounded-b-full" />
        </div>

        <div
          className="relative flex flex-col items-center justify-center gap-4"
          style={{ minHeight: "320px" }}
        >
          {rows.map((cols, rowIndex) => {
            const rowPositions = currentPreset.positions.filter(
              (p) => p.row === rowIndex,
            );

            return (
              <div
                key={rowIndex}
                className={`flex ${cols.length > 1 ? "gap-12" : "gap-8"} items-center justify-center w-full px-4`}
              >
                {cols.map((_, colIndex) => {
                  const pos = rowPositions.find((p) => p.col === colIndex);
                  if (!pos) return null;
                  const assignedPlayerId = positions[pos.id];
                  const assignedPlayer = rosterPlayers.find(
                    (p) => p.id === assignedPlayerId,
                  );
                  const isOpen = openDropdownFor === pos.id;

                  return (
                    <div key={pos.id} className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenDropdownFor(isOpen ? null : pos.id)
                        }
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                          assignedPlayer
                            ? "bg-brand-600 border-brand-600 text-white shadow-lg cursor-pointer"
                            : "bg-white/20 border-dashed border-white text-white/60 cursor-pointer"
                        }`}
                      >
                        <span className="text-white w-full text-center">
                          {assignedPlayer
                            ? getPlayerInitials(assignedPlayer.name)
                            : pos.label}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 z-20 w-44">
                          <select
                            value={assignedPlayerId || ""}
                            onChange={(e) =>
                              handlePlayerChange(pos.id, e.target.value)
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-white border border-border rounded-lg px-2 py-1.5 text-xs text-foreground shadow-elevated cursor-pointer"
                            autoFocus
                          >
                            <option value="">
                              {t("formationSelectPlayer")}
                            </option>
                            {rosterPlayers.map((player) => (
                              <option key={player.id} value={player.id}>
                                {player.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="relative flex justify-center mt-2">
          <div className="bg-white/20 rounded-full px-3 py-1">
            <Shirt className="h-4 w-4 text-white/60 inline mr-1" />
            <span className="text-xs text-white/60 font-medium">
              {team.name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormationBoard;

"use client";

import Image from "next/image";

const CRESTS = [
	{ id: "shield", name: "Shield", file: "/crests/shield.svg" },
	{ id: "star", name: "Star", file: "/crests/star.svg" },
	{ id: "crown", name: "Crown", file: "/crests/crown.svg" },
	{ id: "lion", name: "Lion", file: "/crests/lion.svg" },
	{ id: "eagle", name: "Eagle", file: "/crests/eagle.svg" },
	{ id: "ball", name: "Ball", file: "/crests/ball.svg" },
	{ id: "flame", name: "Flame", file: "/crests/flame.svg" },
	{ id: "sword", name: "Sword", file: "/crests/sword.svg" },
	{ id: "mountain", name: "Mountain", file: "/crests/mountain.svg" },
	{ id: "shield-star", name: "Shield Star", file: "/crests/shield-star.svg" },
];

interface CrestPickerProps {
	value?: string;
	onChange: (crestId: string) => void;
}

export function CrestPicker({ value, onChange }: CrestPickerProps) {
	return (
		<div className="space-y-2">
			<label className="text-sm font-medium">Team Crest</label>
			<div className="grid grid-cols-5 gap-3">
				{CRESTS.map((crest) => (
					<button
						key={crest.id}
						type="button"
						onClick={() => onChange(crest.id)}
						className={`relative aspect-square rounded-lg border-2 p-2 transition-all hover:scale-105 ${
							value === crest.id
								? "border-primary bg-primary/10 ring-2 ring-primary/20"
								: "border-muted-foreground/20 hover:border-muted-foreground/40"
						}`}
					>
						<Image
							src={crest.file}
							alt={crest.name}
							fill
							className="object-contain"
							sizes="(max-width: 768px) 20vw, 10vw"
						/>
					</button>
				))}
			</div>
		</div>
	);
}

import Image from "next/image";

const CREST_MAP: Record<string, string> = {
	shield: "/crests/shield.svg",
	star: "/crests/star.svg",
	crown: "/crests/crown.svg",
	lion: "/crests/lion.svg",
	eagle: "/crests/eagle.svg",
	ball: "/crests/ball.svg",
	flame: "/crests/flame.svg",
	sword: "/crests/sword.svg",
	mountain: "/crests/mountain.svg",
	"shield-star": "/crests/shield-star.svg",
};

interface TeamCrestProps {
	crestId?: string;
	teamName: string;
	size?: number;
	className?: string;
}

export function TeamCrest({ crestId, teamName, size = 40, className = "" }: TeamCrestProps) {
	const src = crestId ? CREST_MAP[crestId] : undefined;

	if (src) {
		return (
			<div
				className={`relative flex-shrink-0 ${className}`}
				style={{ width: size, height: size }}
			>
				<Image
					src={src}
					alt={`${teamName} crest`}
					fill
					className="object-contain"
					sizes={`${size}px`}
				/>
			</div>
		);
	}

	return (
		<div
			className={`flex-shrink-0 rounded-xl bg-brand-50 text-brand-600 grid place-items-center font-display font-bold ${className}`}
			style={{ width: size, height: size, fontSize: size * 0.4 }}
		>
			{teamName.charAt(0).toUpperCase()}
		</div>
	);
}

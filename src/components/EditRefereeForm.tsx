"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Referee } from "@/modules/referees/domain/referee";
import { Button } from "@/components/ui/button";

interface EditRefereeFormProps {
	referee: Referee;
	onSave: (updates: Partial<Referee>) => Promise<void>;
	onCancel: () => void;
}

export function EditRefereeForm({ referee, onSave, onCancel }: EditRefereeFormProps) {
	const t = useTranslations("RefereeSection");
	const [name, setName] = useState(referee.name);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;

		setLoading(true);
		try {
			await onSave({
				name: name.trim(),
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="space-y-1">
				<label className="text-xs font-semibold text-muted-foreground uppercase">
					{t("name")}
				</label>
				<input
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ring outline-none"
					required
				/>
			</div>

			<div className="flex gap-2 justify-end">
				<Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
					{t("cancel")}
				</Button>
				<Button type="submit" disabled={loading || !name.trim()}>
					{loading ? t("saving") : t("save")}
				</Button>
			</div>
		</form>
	);
}

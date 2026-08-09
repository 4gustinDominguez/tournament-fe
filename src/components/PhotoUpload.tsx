"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { validateImageFile, uploadImage } from "@/services/imageService";

interface PhotoUploadProps {
	value?: string;
	onChange: (url: string | null) => void;
	folder?: string;
	accept?: string;
}

export function PhotoUpload({ value, onChange, folder = "tournament" }: PhotoUploadProps) {
	const [preview, setPreview] = useState<string | null>(value ?? null);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;

			const validationError = validateImageFile(file);
			if (validationError) {
				setError(validationError);
				return;
			}

			setError(null);
			setUploading(true);

			try {
				const localPreview = URL.createObjectURL(file);
				setPreview(localPreview);

				const result = await uploadImage(file, folder);
				onChange(result.url);
			} catch {
				setError("Upload failed. Try again.");
				setPreview(null);
			} finally {
				setUploading(false);
			}
		},
		[onChange, folder],
	);

	const handleRemove = useCallback(() => {
		setPreview(null);
		setError(null);
		onChange(null);
		if (inputRef.current) {
			inputRef.current.value = "";
		}
	}, [onChange]);

	return (
		<div className="space-y-2">
			<input
				ref={inputRef}
				type="file"
				accept="image/jpeg,image/png,image/webp"
				capture="environment"
				onChange={handleFileChange}
				className="hidden"
				id="photo-upload"
			/>

			{preview ? (
				<div className="relative inline-block">
					<Image
						src={preview}
						alt="Photo preview"
						width={120}
						height={120}
						className="rounded-lg object-cover"
					/>
					<Button
						type="button"
						variant="destructive"
						size="icon"
						className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
						onClick={handleRemove}
						disabled={uploading}
					>
						<X className="h-3 w-3" />
					</Button>
				</div>
			) : (
				<label
				 htmlFor="photo-upload"
					className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
				>
					<Upload className="h-8 w-8 text-muted-foreground" />
					<span className="text-xs text-muted-foreground mt-1">
						{uploading ? "Uploading..." : "Upload photo"}
					</span>
				</label>
			)}

			{error && <p className="text-sm text-destructive">{error}</p>}
		</div>
	);
}

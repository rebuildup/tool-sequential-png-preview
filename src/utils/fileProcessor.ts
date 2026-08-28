import type { FrameData } from "../types";

export async function processFiles(files: File[]): Promise<FrameData[]> {
	const frames: FrameData[] = [];

	for (const file of files) {
		if (
			!file.type.includes("png") &&
			!file.name.toLowerCase().endsWith(".png")
		) {
			continue;
		}

		try {
			const dataUrl = await fileToDataUrl(file);
			const dimensions = await getImageDimensions(dataUrl);

			frames.push({
				name: file.name,
				dataUrl,
				width: dimensions.width,
				height: dimensions.height,
				size: file.size,
				file,
			});
		} catch (error) {
			console.warn(`Failed to process file ${file.name}:`, error);
		}
	}

	return frames;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function processZipFile(_zipFile: File): Promise<FrameData[]> {
	// For now, we'll implement a basic ZIP processing
	// In a real implementation, you'd use a library like JSZip
	throw new Error(
		"ZIP file processing is not yet implemented. Please use individual files or folder selection.",
	);
}

export function sortFramesByName(frames: FrameData[]): FrameData[] {
	return [...frames].sort((a, b) => {
		// Extract numbers from filenames for natural sorting
		const aMatch = a.name.match(/(\d+)/);
		const bMatch = b.name.match(/(\d+)/);

		if (aMatch && bMatch) {
			const aNum = parseInt(aMatch[1], 10);
			const bNum = parseInt(bMatch[1], 10);
			if (aNum !== bNum) {
				return aNum - bNum;
			}
		}

		// Fallback to alphabetical sorting
		return a.name.localeCompare(b.name);
	});
}

function fileToDataUrl(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

function getImageDimensions(
	dataUrl: string,
): Promise<{ width: number; height: number }> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			resolve({ width: img.width, height: img.height });
		};
		img.onerror = reject;
		img.src = dataUrl;
	});
}

function _validatePngFile(file: File): boolean {
	return file.type === "image/png" || file.name.toLowerCase().endsWith(".png");
}

export function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

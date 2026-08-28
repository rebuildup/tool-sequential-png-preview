export interface FrameData {
	name: string;
	dataUrl: string;
	width: number;
	height: number;
	size: number;
	file: File;
}

export interface AnimationSettings {
	frameRate: number;
	loop: boolean;
	direction: "forward" | "backward" | "pingpong";
	quality: "low" | "medium" | "high";
}

export type PreviewMode = "animation" | "grid" | "list";

export interface ExportSettings {
	format: "gif" | "mp4" | "frames";
	quality: number;
	width?: number;
	height?: number;
	frameRate?: number;
}

export interface UploadMethod {
	type: "files" | "folder" | "zip";
	label: string;
	description: string;
	accept?: string;
	multiple?: boolean;
	webkitdirectory?: boolean;
}

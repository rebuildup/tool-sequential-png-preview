"use client";

import { useCallback, useRef, useState } from "react";
import type { FrameData, UploadMethod } from "../types";
import {
	processFiles,
	processZipFile,
	sortFramesByName,
} from "../utils/fileProcessor";

interface FileUploaderProps {
	onFilesLoaded: (frames: FrameData[]) => void;
}

const UPLOAD_METHODS: UploadMethod[] = [
	{
		type: "files",
		label: "複数ファイル選択",
		description: "複数のPNGファイルを選択",
		accept: "image/png",
		multiple: true,
	},
	{
		type: "folder",
		label: "フォルダ選択",
		description: "フォルダ内のPNGを一括選択",
		accept: "image/png",
		webkitdirectory: true,
	},
	{
		type: "zip",
		label: "ZIPファイル",
		description: "ZIP内のPNGを展開",
		accept: ".zip,application/zip",
	},
];

export default function FileUploader({ onFilesLoaded }: FileUploaderProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selectedMethod, setSelectedMethod] =
		useState<UploadMethod["type"]>("files");

	const fileInputRef = useRef<HTMLInputElement>(null);
	const folderInputRef = useRef<HTMLInputElement>(null);
	const zipInputRef = useRef<HTMLInputElement>(null);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	}, []);

	const handleDrop = useCallback(
		async (e: React.DragEvent) => {
			e.preventDefault();
			setIsDragging(false);
			setError(null);
			setIsProcessing(true);

			try {
				const items = Array.from(e.dataTransfer.items);
				const files: File[] = [];
				const zipFiles: File[] = [];

				for (const item of items) {
					if (item.kind !== "file") continue;
					const file = item.getAsFile();
					if (!file) continue;
					if (
						file.type === "application/zip" ||
						file.name.toLowerCase().endsWith(".zip")
					) {
						zipFiles.push(file);
					} else if (
						file.type === "image/png" ||
						file.name.toLowerCase().endsWith(".png")
					) {
						files.push(file);
					}
				}

				if (zipFiles.length > 0) {
					const frameLists = await Promise.all(
						zipFiles.map((zip) => processZipFile(zip)),
					);
					const merged = frameLists.flat();
					const sortedFrames = sortFramesByName(merged);
					onFilesLoaded(sortedFrames);
					return;
				}

				if (files.length > 0) {
					const frames = await processFiles(files);
					const sortedFrames = sortFramesByName(frames);
					onFilesLoaded(sortedFrames);
				} else {
					setError("PNGファイルまたはZIPファイルをドロップしてください.");
				}
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "ファイルの処理中にエラーが発生しました.",
				);
			} finally {
				setIsProcessing(false);
			}
		},
		[onFilesLoaded],
	);

	const handleFileSelect = useCallback(
		async (files: FileList | null) => {
			if (!files || files.length === 0) return;

			setError(null);
			setIsProcessing(true);

			try {
				const fileArray = Array.from(files);

				if (selectedMethod === "zip") {
					const zipFile = fileArray.find(
						(f) =>
							f.type === "application/zip" ||
							f.name.toLowerCase().endsWith(".zip"),
					);
					if (zipFile) {
						const frames = await processZipFile(zipFile);
						const sortedFrames = sortFramesByName(frames);
						onFilesLoaded(sortedFrames);
					} else {
						setError("ZIPファイルを選択してください.");
					}
				} else {
					const pngFiles = fileArray.filter(
						(f) =>
							f.type === "image/png" || f.name.toLowerCase().endsWith(".png"),
					);
					if (pngFiles.length === 0) {
						setError("PNGファイルが見つかりませんでした.");
						return;
					}
					const frames = await processFiles(pngFiles);
					const sortedFrames = sortFramesByName(frames);
					onFilesLoaded(sortedFrames);
				}
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "ファイルの処理中にエラーが発生しました.",
				);
			} finally {
				setIsProcessing(false);
			}
		},
		[selectedMethod, onFilesLoaded],
	);

	const triggerFileSelect = useCallback(() => {
		const inputRef =
			selectedMethod === "folder"
				? folderInputRef
				: selectedMethod === "zip"
					? zipInputRef
					: fileInputRef;
		inputRef.current?.click();
	}, [selectedMethod]);

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr 1fr",
					gap: "8px",
				}}
			>
				{UPLOAD_METHODS.map((method) => (
					<button
						type="button"
						key={method.type}
						onClick={() => setSelectedMethod(method.type)}
						style={{
							padding: "10px",
							textAlign: "left",
							border:
								selectedMethod === method.type
									? "2px solid #000"
									: "1px solid #ccc",
							fontSize: "13px",
							cursor: "pointer",
						}}
					>
						<div style={{ fontWeight: "bold", marginBottom: "3px" }}>
							{method.label}
						</div>
						<div style={{ fontSize: "11px", color: "#666" }}>
							{method.description}
						</div>
					</button>
				))}
			</div>

			<button
				type="button"
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onClick={triggerFileSelect}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						triggerFileSelect();
					}
				}}
				aria-label="ファイルをアップロード"
				style={{
					border: isDragging ? "2px dashed #000" : "2px dashed #ccc",
					padding: "40px",
					textAlign: "center",
					cursor: "pointer",
					background: isDragging ? "#f5f5f5" : "transparent",
					width: "100%",
					font: "inherit",
					color: "inherit",
				}}
			>
				<p style={{ marginBottom: "8px" }}>
					{selectedMethod === "files" && "ファイルを選択またはドロップ"}
					{selectedMethod === "folder" && "フォルダを選択またはドロップ"}
					{selectedMethod === "zip" && "ZIPファイルを選択またはドロップ"}
				</p>
				<p style={{ fontSize: "12px", color: "#666" }}>
					{selectedMethod === "files" && "複数のPNGファイルを選択できます"}
					{selectedMethod === "folder" &&
						"フォルダ内のPNGファイルを自動検出します"}
					{selectedMethod === "zip" && "ZIP内のPNGファイルを展開します"}
				</p>
			</button>

			<input
				ref={fileInputRef}
				type="file"
				accept="image/png"
				multiple
				onChange={(e) => handleFileSelect(e.target.files)}
				style={{ display: "none" }}
				aria-label="PNGファイルを選択"
			/>
			<input
				ref={folderInputRef}
				type="file"
				accept="image/png"
				{...({ webkitdirectory: "" } as Record<string, string>)}
				onChange={(e) => handleFileSelect(e.target.files)}
				style={{ display: "none" }}
				aria-label="フォルダを選択"
			/>
			<input
				ref={zipInputRef}
				type="file"
				accept=".zip,application/zip"
				onChange={(e) => handleFileSelect(e.target.files)}
				style={{ display: "none" }}
				aria-label="ZIPファイルを選択"
			/>

			{isProcessing && (
				<div
					style={{
						textAlign: "center",
						padding: "15px",
						fontSize: "13px",
						color: "#666",
					}}
				>
					ファイルを処理中...
				</div>
			)}

			{error && (
				<div
					style={{
						border: "1px solid #cc0000",
						padding: "10px",
						color: "#cc0000",
						fontSize: "13px",
					}}
				>
					<strong>エラー:</strong> {error}
				</div>
			)}
		</div>
	);
}

"use client";

import { useState } from "react";
import type { AnimationSettings, ExportSettings, FrameData } from "../types";

function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

interface ExportPanelProps {
	frames: FrameData[];
	settings: AnimationSettings;
	onClose: () => void;
}

export default function ExportPanel({
	frames,
	settings,
	onClose,
}: ExportPanelProps) {
	const [exportSettings, setExportSettings] = useState<ExportSettings>({
		format: "gif",
		quality: 80,
		width: frames[0]?.width || 800,
		height: frames[0]?.height || 600,
		frameRate: settings.frameRate,
	});
	const [isExporting, setIsExporting] = useState(false);
	const [exportProgress, setExportProgress] = useState(0);

	const handleExport = async () => {
		setIsExporting(true);
		setExportProgress(0);

		try {
			if (exportSettings.format === "frames") {
				await exportFrames();
			} else if (exportSettings.format === "gif") {
				alert("GIF export is not yet implemented.");
			} else if (exportSettings.format === "mp4") {
				alert("MP4 export is not yet implemented.");
			}
		} catch (error) {
			console.error("Export failed:", error);
			alert("エクスポートに失敗しました.");
		} finally {
			setIsExporting(false);
			setExportProgress(0);
		}
	};

	const exportFrames = async () => {
		for (let i = 0; i < frames.length; i++) {
			const frame = frames[i];
			const link = document.createElement("a");
			link.href = frame.dataUrl;
			link.download = `frame_${String(i + 1).padStart(3, "0")}_${frame.name}`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			setExportProgress(((i + 1) / frames.length) * 100);
			await new Promise((resolve) => setTimeout(resolve, 100));
		}
	};

	const estimatedFileSize = () => {
		const avgFrameSize =
			frames.reduce((total, frame) => total + frame.size, 0) / frames.length;
		const qualityMultiplier = exportSettings.quality / 100;
		if (exportSettings.format === "frames") {
			return avgFrameSize * frames.length;
		} else if (exportSettings.format === "gif") {
			return avgFrameSize * frames.length * qualityMultiplier * 0.3;
		} else {
			return avgFrameSize * frames.length * qualityMultiplier * 0.1;
		}
	};

	return (
		<fieldset style={{ border: "1px solid #ccc", padding: "15px" }}>
			<legend>エクスポート設定</legend>

			<div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
				<div>
					<span
						id="export-format-label"
						style={{ display: "block", fontSize: "12px", marginBottom: "5px" }}
					>
						エクスポート形式
					</span>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr 1fr",
							gap: "8px",
						}}
					>
						{[
							{
								key: "frames" as const,
								label: "個別フレーム",
								desc: "各フレームをPNGとして出力",
							},
							{
								key: "gif" as const,
								label: "アニメーションGIF",
								desc: "GIFとして出力",
							},
							{ key: "mp4" as const, label: "MP4動画", desc: "MP4として出力" },
						].map(({ key, label, desc }) => (
							<button
								type="button"
								key={key}
								onClick={() =>
									setExportSettings((prev) => ({ ...prev, format: key }))
								}
								style={{
									padding: "10px",
									textAlign: "left",
									border:
										exportSettings.format === key
											? "2px solid #000"
											: "1px solid #ccc",
									fontSize: "13px",
									cursor: "pointer",
								}}
							>
								<div style={{ fontWeight: "bold", marginBottom: "3px" }}>
									{label}
								</div>
								<div style={{ fontSize: "11px", color: "#666" }}>{desc}</div>
							</button>
						))}
					</div>
				</div>

				{exportSettings.format !== "frames" && (
					<div>
						<label
							htmlFor="export-panel-quality"
							style={{
								display: "block",
								fontSize: "12px",
								marginBottom: "3px",
							}}
						>
							品質: {exportSettings.quality}%
						</label>
						<input
							id="export-panel-quality"
							type="range"
							min="10"
							max="100"
							step="10"
							value={exportSettings.quality}
							onChange={(e) =>
								setExportSettings((prev) => ({
									...prev,
									quality: parseInt(e.target.value, 10),
								}))
							}
							style={{ width: "100%" }}
						/>
					</div>
				)}

				{exportSettings.format !== "frames" && (
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: "10px",
						}}
					>
						<div>
							<label
								htmlFor="export-panel-width"
								style={{
									display: "block",
									fontSize: "12px",
									marginBottom: "3px",
								}}
							>
								幅 (px)
							</label>
							<input
								id="export-panel-width"
								type="number"
								min="100"
								max="4000"
								value={exportSettings.width}
								onChange={(e) =>
									setExportSettings((prev) => ({
										...prev,
										width: parseInt(e.target.value, 10) || 800,
									}))
								}
								style={{
									width: "100%",
									padding: "4px 8px",
									fontSize: "13px",
									boxSizing: "border-box",
								}}
							/>
						</div>
						<div>
							<label
								htmlFor="export-panel-height"
								style={{
									display: "block",
									fontSize: "12px",
									marginBottom: "3px",
								}}
							>
								高さ (px)
							</label>
							<input
								id="export-panel-height"
								type="number"
								min="100"
								max="4000"
								value={exportSettings.height}
								onChange={(e) =>
									setExportSettings((prev) => ({
										...prev,
										height: parseInt(e.target.value, 10) || 600,
									}))
								}
								style={{
									width: "100%",
									padding: "4px 8px",
									fontSize: "13px",
									boxSizing: "border-box",
								}}
							/>
						</div>
					</div>
				)}

				<div style={{ fontSize: "12px", color: "#666" }}>
					<div>フレーム数: {frames.length}</div>
					<div>推定ファイルサイズ: {formatFileSize(estimatedFileSize())}</div>
				</div>

				{isExporting && (
					<div>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								fontSize: "12px",
								marginBottom: "3px",
							}}
						>
							<span>エクスポート中...</span>
							<span>{Math.round(exportProgress)}%</span>
						</div>
						<progress
							value={exportProgress}
							max={100}
							style={{ width: "100%", height: "15px" }}
						/>
					</div>
				)}

				<div style={{ display: "flex", gap: "8px" }}>
					<button
						type="button"
						onClick={handleExport}
						disabled={isExporting || frames.length === 0}
						style={{
							border: "none",
							padding: "4px 12px",
							fontSize: "13px",
						}}
					>
						{isExporting ? "エクスポート中..." : "エクスポート開始"}
					</button>
					<button
						type="button"
						onClick={onClose}
						style={{
							border: "none",
							padding: "4px 12px",
							fontSize: "13px",
						}}
					>
						閉じる
					</button>
				</div>
			</div>
		</fieldset>
	);
}

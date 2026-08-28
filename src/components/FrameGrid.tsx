"use client";

import Image from "next/image";
import { useState } from "react";
import type { FrameData } from "../types";
import { formatFileSize } from "../utils/fileProcessor";

interface FrameGridProps {
	frames: FrameData[];
	currentFrame: number;
	onFrameSelect: (frameIndex: number) => void;
}

const GRID_COLS = {
	small: "repeat(8, 1fr)",
	medium: "repeat(6, 1fr)",
	large: "repeat(4, 1fr)",
} as const;

const THUMB_HEIGHT = { small: "64px", medium: "96px", large: "128px" } as const;

export default function FrameGrid({
	frames,
	currentFrame,
	onFrameSelect,
}: FrameGridProps) {
	const [gridSize, setGridSize] = useState<"small" | "medium" | "large">(
		"medium",
	);
	const [showInfo, setShowInfo] = useState(true);

	if (frames.length === 0) {
		return (
			<div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
				フレームが読み込まれていません
			</div>
		);
	}

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<h3 style={{ fontSize: "14px", fontWeight: "bold", margin: 0 }}>
					フレームグリッド ({frames.length} フレーム)
				</h3>
				<div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
					<div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
						<label htmlFor="frame-grid-size" style={{ fontSize: "12px" }}>
							表示サイズ:
						</label>
						<select
							id="frame-grid-size"
							value={gridSize}
							onChange={(e) =>
								setGridSize(e.target.value as "small" | "medium" | "large")
							}
							style={{
								border: "none",
								padding: "2px 4px",
								fontSize: "12px",
							}}
						>
							<option value="small">小</option>
							<option value="medium">中</option>
							<option value="large">大</option>
						</select>
					</div>
					<label
						htmlFor="frame-grid-show-info"
						style={{
							display: "flex",
							alignItems: "center",
							gap: "5px",
							fontSize: "12px",
							cursor: "pointer",
						}}
					>
						<input
							id="frame-grid-show-info"
							type="checkbox"
							checked={showInfo}
							onChange={(e) => setShowInfo(e.target.checked)}
							style={{ border: "none" }}
						/>
						詳細情報を表示
					</label>
				</div>
			</div>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: GRID_COLS[gridSize],
					gap: "8px",
				}}
			>
				{frames.map((frame, index) => (
					<button
						type="button"
						key={frame.dataUrl}
						onClick={() => onFrameSelect(index)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								onFrameSelect(index);
							}
						}}
						aria-label={`フレーム ${index + 1} を選択`}
						aria-pressed={index === currentFrame}
						style={{
							cursor: "pointer",
							border:
								index === currentFrame ? "2px solid #000" : "1px solid #ddd",
							overflow: "hidden",
							background: index === currentFrame ? "#f0f0f0" : "#fff",
							padding: 0,
							textAlign: "left",
							color: "inherit",
							font: "inherit",
						}}
					>
						<div
							style={{
								position: "relative",
								height: THUMB_HEIGHT[gridSize],
								background: "#fafafa",
							}}
						>
							<Image
								src={frame.dataUrl}
								alt={`Frame ${index + 1}`}
								width={frame.width}
								height={frame.height}
								style={{ width: "100%", height: "100%", objectFit: "contain" }}
								loading="lazy"
								unoptimized={true}
							/>
							<div
								style={{
									position: "absolute",
									top: "2px",
									left: "2px",
									background: "rgba(0,0,0,0.7)",
									color: "#fff",
									padding: "1px 3px",
									fontSize: "10px",
								}}
							>
								{index + 1}
							</div>
						</div>
						{showInfo && (
							<div
								style={{
									padding: "4px",
									fontSize: "10px",
									borderTop: "1px solid #eee",
								}}
							>
								<div
									style={{
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
									}}
									title={frame.name}
								>
									{frame.name}
								</div>
								<div style={{ color: "#666" }}>
									{frame.width} × {frame.height}px
								</div>
								<div style={{ color: "#666" }}>
									{formatFileSize(frame.size)}
								</div>
							</div>
						)}
					</button>
				))}
			</div>

			<fieldset
				style={{ border: "1px solid #eee", padding: "10px", fontSize: "12px" }}
			>
				<legend>統計情報</legend>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: "5px",
					}}
				>
					<div>総フレーム数: {frames.length}</div>
					<div>
						総ファイルサイズ:{" "}
						{formatFileSize(frames.reduce((t, f) => t + f.size, 0))}
					</div>
					<div>
						平均解像度:{" "}
						{Math.round(
							frames.reduce((t, f) => t + f.width, 0) / frames.length,
						)}{" "}
						×{" "}
						{Math.round(
							frames.reduce((t, f) => t + f.height, 0) / frames.length,
						)}
						px
					</div>
					<div>
						現在のフレーム: {currentFrame + 1} / {frames.length}
					</div>
				</div>
			</fieldset>
		</div>
	);
}

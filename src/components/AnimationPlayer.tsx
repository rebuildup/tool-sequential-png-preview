"use client";

import { useEffect, useRef } from "react";
import type { AnimationSettings, FrameData } from "../types";

interface AnimationPlayerProps {
	frames: FrameData[];
	currentFrame: number;
	onFrameSelect: (frameIndex: number) => void;
	settings: AnimationSettings;
}

export default function AnimationPlayer({
	frames,
	currentFrame,
	onFrameSelect,
	settings,
}: AnimationPlayerProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!canvasRef.current || frames.length === 0) return;

		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const frame = frames[currentFrame];
		const img = new Image();

		img.onload = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			const containerWidth = containerRef.current?.clientWidth || 800;
			const containerHeight = Math.min(600, containerWidth * 0.75);

			canvas.width = containerWidth;
			canvas.height = containerHeight;

			const scaleX = containerWidth / img.width;
			const scaleY = containerHeight / img.height;
			const scale = Math.min(scaleX, scaleY);

			const scaledWidth = img.width * scale;
			const scaledHeight = img.height * scale;

			const x = (containerWidth - scaledWidth) / 2;
			const y = (containerHeight - scaledHeight) / 2;

			if (settings.quality === "low") {
				ctx.imageSmoothingEnabled = false;
			} else if (settings.quality === "high") {
				ctx.imageSmoothingEnabled = true;
				ctx.imageSmoothingQuality = "high";
			} else {
				ctx.imageSmoothingEnabled = true;
				ctx.imageSmoothingQuality = "medium";
			}

			ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
		};

		img.src = frame.dataUrl;
	}, [frames, currentFrame, settings.quality]);

	const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
		if (frames.length <= 1) return;

		const canvas = canvasRef.current;
		if (!canvas) return;

		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const clickRatio = x / rect.width;

		const targetFrame = Math.floor(clickRatio * frames.length);
		const clampedFrame = Math.max(0, Math.min(frames.length - 1, targetFrame));
		onFrameSelect(clampedFrame);
	};

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
				ref={containerRef}
				style={{
					border: "1px solid #ccc",
					position: "relative",
					overflow: "hidden",
				}}
			>
				<canvas
					ref={canvasRef}
					onClick={handleCanvasClick}
					style={{ width: "100%", cursor: "pointer", display: "block" }}
				/>
				<div
					style={{
						position: "absolute",
						top: "8px",
						left: "8px",
						background: "rgba(0,0,0,0.7)",
						color: "#fff",
						padding: "2px 6px",
						fontSize: "12px",
					}}
				>
					{currentFrame + 1} / {frames.length}
				</div>
				<div
					style={{
						position: "absolute",
						bottom: "8px",
						left: "8px",
						background: "rgba(0,0,0,0.7)",
						color: "#fff",
						padding: "2px 6px",
						fontSize: "12px",
					}}
				>
					{frames[currentFrame].name}
				</div>
				<div
					style={{
						position: "absolute",
						bottom: "8px",
						right: "8px",
						background: "rgba(0,0,0,0.7)",
						color: "#fff",
						padding: "2px 6px",
						fontSize: "12px",
					}}
				>
					{frames[currentFrame].width} × {frames[currentFrame].height}px
				</div>
			</div>

			<div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						fontSize: "12px",
					}}
				>
					<span>フレーム選択</span>
					<span>
						{currentFrame + 1} / {frames.length}
					</span>
				</div>
				<input
					type="range"
					min="0"
					max={frames.length - 1}
					value={currentFrame}
					onChange={(e) => onFrameSelect(parseInt(e.target.value, 10))}
					style={{ width: "100%" }}
					aria-label="フレーム"
				/>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						fontSize: "11px",
					}}
				>
					<button
						type="button"
						onClick={() => onFrameSelect(0)}
						style={{
							background: "none",
							border: "none",
							cursor: "pointer",
							fontSize: "11px",
						}}
					>
						最初
					</button>
					<button
						type="button"
						onClick={() => onFrameSelect(Math.floor(frames.length / 4))}
						style={{
							background: "none",
							border: "none",
							cursor: "pointer",
							fontSize: "11px",
						}}
					>
						25%
					</button>
					<button
						type="button"
						onClick={() => onFrameSelect(Math.floor(frames.length / 2))}
						style={{
							background: "none",
							border: "none",
							cursor: "pointer",
							fontSize: "11px",
						}}
					>
						50%
					</button>
					<button
						type="button"
						onClick={() => onFrameSelect(Math.floor((frames.length * 3) / 4))}
						style={{
							background: "none",
							border: "none",
							cursor: "pointer",
							fontSize: "11px",
						}}
					>
						75%
					</button>
					<button
						type="button"
						onClick={() => onFrameSelect(frames.length - 1)}
						style={{
							background: "none",
							border: "none",
							cursor: "pointer",
							fontSize: "11px",
						}}
					>
						最後
					</button>
				</div>
			</div>
		</div>
	);
}

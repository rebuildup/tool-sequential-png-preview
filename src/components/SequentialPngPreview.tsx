"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RawDOMContainer } from "../../../../external/ui/src/RawDOMContainer";
import type { AnimationSettings, FrameData, PreviewMode } from "../types";
import AnimationPlayer from "./AnimationPlayer";
import ExportPanel from "./ExportPanel";
import FileUploader from "./FileUploader";
import FrameGrid from "./FrameGrid";

export default function SequentialPngPreview() {
	const [frames, setFrames] = useState<FrameData[]>([]);
	const [currentFrame, setCurrentFrame] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [previewMode, setPreviewMode] = useState<PreviewMode>("animation");
	const [showSettings, _setShowSettings] = useState(false);
	const [showExport, setShowExport] = useState(false);
	const [settings, setSettings] = useState<AnimationSettings>({
		frameRate: 12,
		loop: true,
		direction: "forward",
		quality: "medium",
	});

	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	const handleFilesLoaded = useCallback((loadedFrames: FrameData[]) => {
		setFrames(loadedFrames);
		setCurrentFrame(0);
		setIsPlaying(false);
	}, []);

	const togglePlayback = useCallback(() => {
		setIsPlaying((prev) => !prev);
	}, []);

	const resetAnimation = useCallback(() => {
		setCurrentFrame(0);
		setIsPlaying(false);
	}, []);

	const nextFrame = useCallback(() => {
		if (frames.length === 0) return;

		setCurrentFrame((prev) => {
			if (settings.direction === "forward") {
				return prev >= frames.length - 1
					? settings.loop
						? 0
						: prev
					: prev + 1;
			} else if (settings.direction === "backward") {
				return prev <= 0
					? settings.loop
						? frames.length - 1
						: prev
					: prev - 1;
			} else {
				return prev >= frames.length - 1
					? settings.loop
						? 0
						: prev
					: prev + 1;
			}
		});
	}, [frames.length, settings.direction, settings.loop]);

	useEffect(() => {
		if (isPlaying && frames.length > 0) {
			intervalRef.current = setInterval(() => {
				nextFrame();
			}, 1000 / settings.frameRate);
		} else {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		}

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [isPlaying, frames.length, settings.frameRate, nextFrame]);

	const handleFrameSelect = useCallback((frameIndex: number) => {
		setCurrentFrame(frameIndex);
		setIsPlaying(false);
	}, []);

	return (
		<RawDOMContainer
			title="Sequential PNG Preview"
			breadcrumbs={[
				{ label: "Home", href: "/" },
				{ label: "Tools", href: "/tools" },
				{ label: "Sequential PNG Preview" },
			]}
		>
			<div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
				{frames.length === 0 ? (
					<FileUploader onFilesLoaded={handleFilesLoaded} />
				) : (
					<>
						{/* Controls */}
						<fieldset style={{ border: "1px solid #ccc", padding: "10px" }}>
							<legend>操作</legend>
							<div
								style={{
									display: "flex",
									gap: "8px",
									flexWrap: "wrap",
									alignItems: "center",
								}}
							>
								<button
									type="button"
									onClick={togglePlayback}
									style={{
										border: "none",
										padding: "4px 12px",
										fontSize: "13px",
									}}
								>
									{isPlaying ? "一時停止" : "再生"}
								</button>
								<button
									type="button"
									onClick={resetAnimation}
									style={{
										border: "none",
										padding: "4px 12px",
										fontSize: "13px",
									}}
								>
									リセット
								</button>
								<button
									type="button"
									onClick={() => setShowExport(!showExport)}
									style={{
										border: "none",
										padding: "4px 12px",
										fontSize: "13px",
									}}
								>
									{showExport ? "エクスポートを閉じる" : "エクスポート"}
								</button>
								<button
									type="button"
									onClick={() =>
										setPreviewMode(
											previewMode === "animation" ? "grid" : "animation",
										)
									}
									style={{
										border: "none",
										padding: "4px 12px",
										fontSize: "13px",
									}}
								>
									{previewMode === "animation"
										? "グリッド表示"
										: "アニメーション表示"}
								</button>
								<span style={{ fontSize: "12px", color: "#666" }}>
									{currentFrame + 1} / {frames.length} フレーム
								</span>
							</div>
						</fieldset>

						{/* Settings */}
						{showSettings && (
							<fieldset style={{ border: "1px solid #ccc", padding: "10px" }}>
								<legend>設定</legend>
								<div
									style={{
										display: "grid",
										gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
										gap: "10px",
									}}
								>
									<div>
										<label
											style={{
												display: "block",
												fontSize: "12px",
												marginBottom: "3px",
											}}
										>
											フレームレート: {settings.frameRate}fps
										</label>
										<input
											type="range"
											min="1"
											max="60"
											value={settings.frameRate}
											onChange={(e) =>
												setSettings((prev) => ({
													...prev,
													frameRate: parseInt(e.target.value, 10),
												}))
											}
											style={{ width: "100%" }}
											aria-label="フレームレート"
										/>
									</div>
									<div>
										<label
											style={{
												display: "block",
												fontSize: "12px",
												marginBottom: "3px",
											}}
										>
											ループ
										</label>
										<label
											style={{
												display: "flex",
												alignItems: "center",
												gap: "5px",
												fontSize: "13px",
												cursor: "pointer",
											}}
										>
											<input
												type="checkbox"
												checked={settings.loop}
												onChange={(e) =>
													setSettings((prev) => ({
														...prev,
														loop: e.target.checked,
													}))
												}
												style={{ border: "none" }}
											/>
											有効
										</label>
									</div>
									<div>
										<label
											htmlFor="direction"
											style={{
												display: "block",
												fontSize: "12px",
												marginBottom: "3px",
											}}
										>
											方向
										</label>
										<select
											id="direction"
											value={settings.direction}
											onChange={(e) =>
												setSettings((prev) => ({
													...prev,
													direction: e.target
														.value as AnimationSettings["direction"],
												}))
											}
											style={{
												width: "100%",
												padding: "4px 8px",
												fontSize: "13px",
											}}
										>
											<option value="forward">順方向</option>
											<option value="backward">逆方向</option>
										</select>
									</div>
								</div>
							</fieldset>
						)}

						{/* Main Content */}
						{previewMode === "animation" ? (
							<AnimationPlayer
								frames={frames}
								currentFrame={currentFrame}
								onFrameSelect={handleFrameSelect}
								settings={settings}
							/>
						) : (
							<FrameGrid
								frames={frames}
								currentFrame={currentFrame}
								onFrameSelect={handleFrameSelect}
							/>
						)}

						{/* Export Panel */}
						{showExport && (
							<ExportPanel
								frames={frames}
								settings={settings}
								onClose={() => setShowExport(false)}
							/>
						)}

						{/* Load More */}
						<FileUploader onFilesLoaded={handleFilesLoaded} />
					</>
				)}
			</div>
		</RawDOMContainer>
	);
}

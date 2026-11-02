import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import SequentialPngPreviewApp from "./SequentialPngPreviewApp";

const container = document.getElementById("root");

if (!container) {
	throw new Error("Sequential PNG Preview: missing #root element");
}

createRoot(container).render(
	<StrictMode>
		<SequentialPngPreviewApp />
	</StrictMode>,
);

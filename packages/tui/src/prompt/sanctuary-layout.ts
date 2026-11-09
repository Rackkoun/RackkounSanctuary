/** Width allocation for the responsive Sanctuary sidebar and conversation pane. */
export interface SanctuaryLayout {
	readonly mode: "full" | "compact" | "rail" | "ultra" | "hidden";
	readonly sidebarWidth: number;
	readonly mainWidth: number;
}

export function sanctuaryLayout(totalWidth: number, enabled = true, expanded = false): SanctuaryLayout {
	const width = Math.max(1, Math.floor(totalWidth));
	if (!enabled) return { mode: "hidden", sidebarWidth: 0, mainWidth: width };
	if (width < 58) {
		return expanded
			? { mode: "full", sidebarWidth: Math.max(1, width - 1), mainWidth: 0 }
			: { mode: "ultra", sidebarWidth: 1, mainWidth: Math.max(1, width - 2) };
	}
	const sidebarWidth = width >= 110 ? 30 : width >= 82 ? 24 : 13;
	const mode = width >= 110 ? "full" : width >= 82 ? "compact" : "rail";
	return { mode, sidebarWidth, mainWidth: width - sidebarWidth - 1 };
}

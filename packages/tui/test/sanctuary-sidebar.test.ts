import { describe, expect, it } from "bun:test";
import { sanctuaryLayout } from "../src/prompt/sanctuary-layout";

describe("Sanctuary sidebar responsive layout", () => {
	it("uses the requested full, compact, rail and ultra-compact terminal widths", () => {
		expect(sanctuaryLayout(110)).toEqual({ mode: "full", sidebarWidth: 30, mainWidth: 79 });
		expect(sanctuaryLayout(109)).toEqual({ mode: "compact", sidebarWidth: 24, mainWidth: 84 });
		expect(sanctuaryLayout(82)).toEqual({ mode: "compact", sidebarWidth: 24, mainWidth: 57 });
		expect(sanctuaryLayout(81)).toEqual({ mode: "rail", sidebarWidth: 13, mainWidth: 67 });
		expect(sanctuaryLayout(58)).toEqual({ mode: "rail", sidebarWidth: 13, mainWidth: 44 });
		expect(sanctuaryLayout(57)).toEqual({ mode: "ultra", sidebarWidth: 1, mainWidth: 55 });
		expect(sanctuaryLayout(57, true, true)).toEqual({ mode: "full", sidebarWidth: 56, mainWidth: 0 });
	});

	it("preserves the terminal width while keeping a conversation column where the sidebar is permanent", () => {
		for (let width = 58; width <= 240; width++) {
			const layout = sanctuaryLayout(width);
			expect(layout.mainWidth).toBeGreaterThan(0);
			expect(layout.mainWidth + layout.sidebarWidth + 1).toBe(width);
		}
	});

	it("opens the detailed Observatory as a full-width panel below 58 columns", () => {
		for (let width = 20; width < 58; width++) {
			const layout = sanctuaryLayout(width, true, true);
			expect(layout.mode).toBe("full");
			expect(layout.mainWidth + layout.sidebarWidth + 1).toBe(width);
		}
	});
});

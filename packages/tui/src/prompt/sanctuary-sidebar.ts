import { theme } from "../theme/theme";
import { Ellipsis, singleLine, truncateToWidth, visibleWidth } from "../utils";
import { sanctuaryLayout, type SanctuaryLayout } from "./sanctuary-layout";

export type SanctuaryActivity = "idle" | "thinking" | "executing" | "verifying" | "complete";

export interface SanctuarySnapshot {
	readonly model?: string;
	readonly project?: string;
	readonly session?: string;
	readonly tokenRate?: string;
	readonly context?: string;
	readonly compaction?: string;
	readonly threshold?: string;
	readonly agents?: readonly {
		readonly name: string;
		readonly model?: string;
		readonly task?: string;
		readonly status: "running" | "idle" | "error" | "complete";
		readonly tool?: string;
	}[];
	readonly route?: string;
	readonly memory?: string;
	readonly cpu?: string;
	readonly ram?: string;
	readonly gpu?: string;
	readonly activity?: SanctuaryActivity | "error";
	readonly activeTools?: readonly string[];
	readonly tasks?: readonly {
		readonly label: string;
		readonly status: "running" | "failed" | "pending" | "blocked";
	}[];
}

/** Adaptive right-hand Observatory panel for the Rackkoun Sanctuary composer. */
export class SanctuarySidebar {
	layout(totalWidth: number, enabled = true, expanded = false): SanctuaryLayout {
		return sanctuaryLayout(totalWidth, enabled, expanded);
	}

	render(
		width: number,
		height: number,
		mode: SanctuaryLayout["mode"],
		snapshot: SanctuarySnapshot = {},
	): readonly string[] {
		if (mode === "hidden" || height <= 0) return [];
		const w = Math.max(1, Math.floor(width));
		const rows = Math.max(0, Math.floor(height));
		if (mode === "ultra") return Array.from({ length: rows }, (_, i) => (i === 0 ? theme.fg("accent", "◈") : " "));
		const inner = Math.max(0, w - 2);
		const short = (value: string | undefined, fallback = "—") => value ?? fallback;
		const activeAgents = snapshot.agents ?? [];
		const tasks = snapshot.tasks ?? [];
		const activity = snapshot.activity ?? "idle";
		const modeName: Record<SanctuaryActivity | "error", string> = {
			idle: "IDLE",
			thinking: "THINKING",
			executing: "EXECUTING",
			verifying: "VERIFYING",
			complete: "COMPLETE",
			error: "ERROR",
		};
		const lines =
			mode === "full"
				? [
						{ text: "◈ RACKKOUN SANCTUARY", kind: "title" },
						{ text: " ", kind: "spacer" },
						{ text: "SESSION", kind: "heading" },
						{ text: "WORKSPACE", kind: "label" },
						{ text: short(snapshot.project ?? snapshot.session, "workspace"), kind: "value" },
						{ text: "TITLE", kind: "label" },
						{ text: short(snapshot.session, "untitled session"), kind: "value" },
						{ text: " ", kind: "spacer" },
						{ text: "CORE", kind: "heading" },
						{ text: `ORCHESTRATOR · ${short(snapshot.model, "resolving model…")}`, kind: "pair" },
						{ text: `STATUS · ${modeName[activity]}`, kind: "pairStatus" },
						{
							text: `SUBAGENTS · ${activeAgents.filter(agent => agent.status === "running").length} active`,
							kind: "pairCount",
						},
						...(activeAgents.length
							? activeAgents
									.slice(0, 2)
									.flatMap(agent => [
										{ text: `${agent.name} · ${agent.status.toUpperCase()}`, kind: "status" },
										...(agent.model ? [{ text: agent.model, kind: "value" }] : []),
										...(agent.task ? [{ text: `TASK · ${agent.task}`, kind: "muted" }] : []),
										...(agent.tool ? [{ text: `TOOL · ${agent.tool}`, kind: "muted" }] : []),
									])
							: []),
						{ text: " ", kind: "spacer" },
						{ text: "PERFORMANCE", kind: "heading" },
						{ text: `CONTEXT · ${short(snapshot.context, "waiting for usage")}`, kind: "pair" },
						{
							text: `COMPACTION · ${short(snapshot.threshold, "default")} · ${short(snapshot.compaction, "ready")}`,
							kind: "pair",
						},
						...(snapshot.tokenRate ? [{ text: `OUTPUT · ${snapshot.tokenRate}`, kind: "pair" }] : []),
						{ text: `CPU · ${short(snapshot.cpu, "unavailable")}`, kind: "pair" },
						{ text: `RAM · ${short(snapshot.ram, "unavailable")}`, kind: "pair" },
						{ text: " ", kind: "spacer" },
						{ text: "SYSTEM PULSE", kind: "heading" },
						{ text: `INFERENCE · ${short(snapshot.route, "unknown")}`, kind: "pair" },
						{ text: `GPU · ${short(snapshot.gpu, "not exposed")}`, kind: "pair" },
						{ text: " ", kind: "spacer" },
						{ text: "STATUS", kind: "heading" },
						{ text: `◉ ${modeName[activity]}`, kind: "status" },
						...(tasks.length
							? [
									{ text: "TASKS", kind: "label" },
									...tasks.slice(0, 2).map(task => ({
										text: `${task.status.toUpperCase()} · ${task.label}`,
										kind: task.status === "failed" ? "status" : "pairStatus",
									})),
								]
							: []),
						...(snapshot.activeTools?.length
							? [{ text: snapshot.activeTools.slice(0, 2).join(" · "), kind: "muted" }]
							: []),
					]
				: mode === "compact"
					? [
							{ text: "◈ SANCTUARY", kind: "title" },
							{ text: `MODEL · ${short(snapshot.model, "loading")}`, kind: "value" },
							{ text: `CTX · ${short(snapshot.context, "waiting")}`, kind: "value" },
							{ text: `COMPACT · ${short(snapshot.threshold, "default")}`, kind: "value" },
							{ text: `AGENTS · ${activeAgents.length} active`, kind: "value" },
							{ text: `PULSE · ${short(snapshot.route, "unknown")}`, kind: "value" },
							{ text: `MEMORY · ${short(snapshot.memory, "unknown")}`, kind: "value" },
							{ text: `RAM · ${short(snapshot.ram, "unavailable")}`, kind: "value" },
							{ text: `◉ ${modeName[activity]}`, kind: "activity" },
						]
					: [
							{ text: "◈ OBS", kind: "title" },
							{ text: short(snapshot.model, "MODEL"), kind: "value" },
							{ text: `CTX ${short(snapshot.context, "—")}`, kind: "value" },
							{ text: `AGT ${activeAgents.length}`, kind: "value" },
							{ text: short(snapshot.route, "LOCAL"), kind: "muted" },
							{ text: `◉ ${modeName[activity]}`, kind: "activity" },
						];
		const style = (text: string, kind: string): string => {
			switch (kind) {
				case "title":
				case "heading":
					return theme.fg("accent", kind === "title" ? theme.bold(text) : text);
				case "label":
				case "muted":
				case "rule":
					return theme.fg("muted", text);
				case "spacer":
					return "";
				case "pair":
				case "pairCount": {
					const divider = text.indexOf(" · ");
					if (divider < 0) return theme.fg("text", text);
					const key = theme.fg("muted", text.slice(0, divider));
					const value = text.slice(divider + 3);
					const percentDivider = value.lastIndexOf(" · ");
					if (percentDivider >= 0 && value.slice(percentDivider + 3).endsWith("%")) {
						return `${key} · ${theme.fg("text", value.slice(0, percentDivider))} · ${theme.fg("warning", value.slice(percentDivider + 3))}`;
					}
					return `${key} · ${theme.fg(kind === "pairCount" && value.startsWith("0") ? "text" : kind === "pairCount" ? "warning" : "text", value)}`;
				}
				case "pairStatus": {
					const divider = text.indexOf(" · ");
					if (divider < 0) return theme.fg("muted", text);
					const value = text.slice(divider + 3);
					const color =
						value.toLowerCase().includes("failed") || value.toLowerCase().includes("error")
							? "error"
							: value.toLowerCase().includes("running") || value.toLowerCase().includes("thinking")
								? "warning"
								: value.toLowerCase().includes("complete")
									? "success"
									: "muted";
					return `${theme.fg("muted", text.slice(0, divider))} · ${theme.fg(color, value)}`;
				}
				case "status": {
					const value = text.toLowerCase();
					const color =
						value.includes("error") || value.includes("failed")
							? "error"
							: value.includes("complete")
								? "success"
								: value.includes("thinking") || value.includes("running")
									? "warning"
									: value.includes("executing") || value.includes("verifying")
										? "accent"
										: "muted";
					return theme.fg(color, text);
				}
				case "activity":
					return theme.fg(
						activity === "thinking"
							? "warning"
							: activity === "executing"
								? "accent"
								: activity === "complete"
									? "success"
									: "muted",
						text,
					);
				default:
					return theme.fg("text", text);
			}
		};
		const out: string[] = [theme.fg("border", `╭${"─".repeat(inner)}╮`)];
		for (const line of lines.slice(0, Math.max(0, rows - 2))) {
			const clipped = truncateToWidth(singleLine(style(line.text, line.kind)), inner, Ellipsis.Unicode);
			out.push(
				`${theme.fg("border", "│")}${clipped}${" ".repeat(Math.max(0, inner - visibleWidth(clipped)))}${theme.fg("border", "│")}`,
			);
		}
		while (out.length < rows - 1)
			out.push(`${theme.fg("border", "│")}${" ".repeat(inner)}${theme.fg("border", "│")}`);
		if (rows > 1) out.push(theme.fg("border", `╰${"─".repeat(inner)}╯`));
		return out.slice(0, rows);
	}
}

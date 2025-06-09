import path from "node:path";
import { Command } from "@oclif/core";
import fs from "fs-extra";

export default class Init extends Command {
	static description = "Initialize the .aisdlc folder structure";

	async run(): Promise<void> {
		const aisdlcDir = path.join(process.cwd(), ".aisdlc");
		if (await fs.pathExists(aisdlcDir)) {
			this.log(".aisdlc directory already exists. Skipping initialization.");
			return;
		}

		// Create folder structure
		const structure = [
			"01_agents",
			"02_prompts/samples",
			"03_ideas",
			"04_backlog",
			"05_in_progress",
			"06_done",
			"refs",
		];
		for (const dir of structure) {
			await fs.ensureDir(path.join(aisdlcDir, dir));
		}

		// Create READMEs and sample files
		await fs.writeFile(
			path.join(aisdlcDir, "01_agents", "0_README.md"),
			"# Agents\nDefine your agents here.",
		);
		await fs.writeFile(
			path.join(aisdlcDir, "02_prompts", "0_README.md"),
			"# Prompts\nStore your prompt templates here.",
		);
		await fs.writeFile(
			path.join(aisdlcDir, "03_ideas", "0_README.md"),
			"# Ideas\nDrop your idea files here in Markdown format (e.g., `IDEA-001.md`) to start the Agile process.\nThe system will detect new files and process them automatically.",
		);

		// Create refs folder content
		await fs.writeFile(
			path.join(aisdlcDir, "refs", "context-7-mcp.md"),
			"# Context7 MCP\nDocumentation for fetching up-to-date library and SDK docs.\nSee `.aisdlc/refs/available-tools.xml` for full capabilities.",
		);
		await fs.writeFile(
			path.join(aisdlcDir, "refs", "github-mcp.md"),
			"# GitHub MCP\nDocumentation for GitHub CRUD operations.\nSee `.aisdlc/refs/available-tools.xml` for full capabilities.",
		);
		await fs.writeFile(
			path.join(aisdlcDir, "refs", "sequential-thinking-mcp.md"),
			"# Sequential Thinking MCP\nDocumentation for structured problem-solving.\nSee `.aisdlc/refs/available-tools.xml` for full capabilities.",
		);
		await fs.writeFile(
			path.join(aisdlcDir, "refs", "available-tools.xml"),
			`<?xml version="1.0" encoding="UTF-8"?>
<available_tools>
  <description>
    Comprehensive documentation of available MCP tools for AI-powered development workflows.
  </description>
  <tool name="context7_mcp">
    <summary>Up-to-date code documentation and examples for any library or framework</summary>
    <!-- Full content from user-provided XML for context7_mcp -->
  </tool>
  <tool name="github_mcp">
    <summary>Comprehensive GitHub API integration for repository management and automation</summary>
    <!-- Full content from user-provided XML for github_mcp -->
  </tool>
  <tool name="sequential_thinking_mcp">
    <summary>Dynamic and reflective problem-solving through structured thinking processes</summary>
    <!-- Full content from user-provided XML for sequential_thinking_mcp -->
  </tool>
  <!-- Rest of the XML content -->
</available_tools>`,
		);

		this.log("Initialized .aisdlc folder structure with refs.");
	}
}

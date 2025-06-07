import path from "node:path";
import { Command } from "@oclif/core";
import * as fs from "fs-extra";

export default class Init extends Command {
	static description = "Initialize the .aishell folder structure";

	async run(): Promise<void> {
		const aishellDir = path.join(process.cwd(), ".aishell");
		if (fs.existsSync(aishellDir)) {
			this.log(".aishell directory already exists. Skipping initialization.");
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
			fs.ensureDirSync(path.join(aishellDir, dir));
		}

		// Create READMEs and sample files
		fs.writeFileSync(
			path.join(aishellDir, "01_agents", "0_README.md"),
			"# Agents\nDefine your agents here.",
		);
		fs.writeFileSync(
			path.join(aishellDir, "02_prompts", "0_README.md"),
			"# Prompts\nStore your prompt templates here.",
		);
		fs.writeFileSync(
			path.join(aishellDir, "03_ideas", "0_README.md"),
			"# Ideas\nDrop your idea files here in Markdown format (e.g., `IDEA-001.md`) to start the Agile process.\nThe system will detect new files and process them automatically.",
		);

		// Create refs folder content
		fs.writeFileSync(
			path.join(aishellDir, "refs", "context-7-mcp.md"),
			"# Context7 MCP\nDocumentation for fetching up-to-date library and SDK docs.\nSee `.aishell/refs/available-tools.xml` for full capabilities.",
		);
		fs.writeFileSync(
			path.join(aishellDir, "refs", "github-mcp.md"),
			"# GitHub MCP\nDocumentation for GitHub CRUD operations.\nSee `.aishell/refs/available-tools.xml` for full capabilities.",
		);
		fs.writeFileSync(
			path.join(aishellDir, "refs", "sequential-thinking-mcp.md"),
			"# Sequential Thinking MCP\nDocumentation for structured problem-solving.\nSee `.aishell/refs/available-tools.xml` for full capabilities.",
		);
		fs.writeFileSync(
			path.join(aishellDir, "refs", "available-tools.xml"),
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

		this.log("Initialized .aishell folder structure with refs.");
	}
}

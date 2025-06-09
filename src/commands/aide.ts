import path from "node:path";
import { Args, Command, Flags } from "@oclif/core";
import { config } from "dotenv";
import fs from "fs-extra";
import * as YAML from "js-yaml";
import { BuilderAgent } from "../lib/agents/builder-agent.js";
import type { UserStory } from "../types/aider.js";

// Load environment variables
config();

export default class Aide extends Command {
	static description =
		"Initiate Aider-powered development for a user story using Builder Agent.";

	static examples = [
		"<%= config.bin %> <%= command.id %> story-abc123",
		"<%= config.bin %> <%= command.id %> story-abc123 --model claude-3-5-sonnet",
		"<%= config.bin %> <%= command.id %> story-abc123 --dry-run",
	];

	static args = {
		storyId: Args.string({
			description: "The unique identifier of the user story to implement",
			required: true,
		}),
	};

	static flags = {
		model: Flags.string({
			description: "LLM model to use for implementation",
			default: "claude-3-5-sonnet",
			options: [
				"claude-3-5-sonnet",
				"claude-3-5-haiku",
				"gpt-4o",
				"gpt-4o-mini",
			],
		}),
		"dry-run": Flags.boolean({
			description: "Show what would be done without actually executing",
			default: false,
		}),
		timeout: Flags.integer({
			description: "Timeout in seconds for the implementation",
			default: 300,
		}),
	};

	async run(): Promise<void> {
		const { args, flags } = await this.parse(Aide);
		const { storyId } = args;
		const { model, "dry-run": dryRun, timeout } = flags;

		try {
			// 1. Load index.yml to get story info
			const indexPath = path.join(process.cwd(), ".aishell", "index.yml");
			const indexData: any = fs.existsSync(indexPath)
				? YAML.load(fs.readFileSync(indexPath, "utf8")) || {}
				: {};

			if (!indexData[storyId]) {
				this.error(`Story ${storyId} not found in index.yml`);
			}

			const story = indexData[storyId];
			if (story.type !== "story") {
				this.error(`Artifact ${storyId} is not a story (type: ${story.type})`);
			}

			if (story.status !== "ready" && story.status !== "in_progress") {
				this.warn(
					`Story ${storyId} has status: ${story.status}. Proceeding anyway.`,
				);
			}

			// 2. Load story content
			const storyPath = path.join(
				process.cwd(),
				".aishell/05_in_progress",
				`${storyId}.story.md`,
			);
			if (!fs.existsSync(storyPath)) {
				this.error(`Story file not found: ${storyPath}`);
			}

			const storyContent = fs.readFileSync(storyPath, "utf8");
			this.log(`📖 Loading story: ${storyId}`);
			this.log(`📊 Story points: ${story.story_points || "Unknown"}`);

			if (dryRun) {
				this.log("\n🔍 DRY RUN MODE - No actual changes will be made");
				await this.showDryRunPlan(storyContent, model, timeout);
				return;
			}

			// 3. Update story status to in_progress
			indexData[storyId].status = "in_progress";
			indexData[storyId].updated_at = new Date().toISOString();
			indexData[storyId].assigned_agent_type = "BuilderAgent";
			indexData[storyId].implementation_started_at = new Date().toISOString();
			fs.writeFileSync(indexPath, YAML.dump(indexData));

			// 4. Invoke Builder Agent with Aider
			this.log("🤖 Invoking Builder Agent for implementation...");
			const implementationResult = await this.implementStory(
				storyContent,
				storyId,
				model,
				timeout,
			);

			// 5. Update story status based on result
			if (implementationResult.success) {
				indexData[storyId].status = "review_pending";
				indexData[storyId].implementation_completed_at =
					new Date().toISOString();
				indexData[storyId].commit_hash = implementationResult.commitHash;
				indexData[storyId].files_changed = implementationResult.filesChanged;

				this.log("✅ Implementation completed successfully!");
				this.log(`📝 Commit: ${implementationResult.commitHash}`);
				this.log(
					`📁 Files changed: ${implementationResult.filesChanged?.join(", ") || "None"}`,
				);
				this.log("\n🔍 Next steps:");
				this.log(
					`  - Review changes: git show ${implementationResult.commitHash}`,
				);
				this.log(`  - Run tests: npm test`);
				this.log(
					`  - Start review: ai review ${implementationResult.commitHash}`,
				);
			} else {
				indexData[storyId].status = "blocked";
				indexData[storyId].error_message = implementationResult.error;
				indexData[storyId].failed_at = new Date().toISOString();

				this.error(`❌ Implementation failed: ${implementationResult.error}`);
			}

			fs.writeFileSync(indexPath, YAML.dump(indexData));
		} catch (error) {
			this.error(
				`Failed to implement story: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	private async showDryRunPlan(
		storyContent: string,
		model: string,
		timeout: number,
	): Promise<void> {
		this.log("\n📋 Implementation Plan:");
		this.log(`  Model: ${model}`);
		this.log(`  Timeout: ${timeout}s`);
		this.log(`  Aider Integration: Docker-based`);

		this.log("\n🔄 Planned Workflow:");
		this.log("  1. Analyze story requirements");
		this.log("  2. Identify files to modify/create");
		this.log("  3. Configure Aider with context");
		this.log("  4. Generate implementation prompt");
		this.log("  5. Execute Aider commands:");
		this.log("     - /add relevant files");
		this.log("     - /msg with implementation instructions");
		this.log("     - /lint to check code quality");
		this.log("     - /test to run tests");
		this.log("     - /commit to save changes");
		this.log("  6. Update story status");

		this.log("\n📁 Estimated files to modify:");
		this.log("  - src/components/ (new components)");
		this.log("  - src/services/ (business logic)");
		this.log("  - tests/ (unit tests)");
		this.log("  - docs/ (documentation)");

		this.log("\n⚠️  Use --no-dry-run to execute the implementation");
	}

	private async implementStory(
		storyContent: string,
		storyId: string,
		model: string,
		timeout: number,
	): Promise<{
		success: boolean;
		commitHash?: string;
		filesChanged?: string[];
		error?: string;
	}> {
		try {
			// Parse story content to create UserStory object
			const story = this.parseStoryContent(storyContent, storyId);

			// Initialize Builder Agent
			const builderAgent = new BuilderAgent();

			// Check prerequisites
			this.log("🔍 Checking prerequisites...");
			const prereqCheck = await builderAgent.checkPrerequisites();
			if (!prereqCheck.ready) {
				throw new Error(
					`Prerequisites not met:\n${prereqCheck.issues.join("\n")}`,
				);
			}

			// Set environment variables for this execution
			process.env.AIDER_MODEL = model;
			process.env.AIDER_TIMEOUT = (timeout * 1000).toString();

			this.log("🤖 Executing Builder Agent with Aider integration...");
			const result = await builderAgent.execute(story);

			return {
				success: result.success,
				commitHash: result.commitHash,
				filesChanged: result.filesChanged,
				error: result.error,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : String(error),
			};
		}
	}

	private parseStoryContent(content: string, storyId: string): UserStory {
		// Enhanced parsing of story content with intelligent file detection
		const lines = content.split("\n");
		let title = "";
		let description = "";
		const acceptanceCriteria: string[] = [];
		const technicalTasks: string[] = [];
		let readOnlyFiles: string[] = [];
		let writeableFiles: string[] = [];
		const libraries: string[] = [];

		let currentSection = "";

		for (const line of lines) {
			const trimmed = line.trim();
			if (trimmed.startsWith("# ")) {
				title = trimmed.substring(2);
			} else if (trimmed.startsWith("## Description")) {
				currentSection = "description";
			} else if (trimmed.startsWith("## Acceptance Criteria")) {
				currentSection = "acceptance";
			} else if (trimmed.startsWith("## Technical Tasks")) {
				currentSection = "technical";
			} else if (trimmed.startsWith("## File Paths")) {
				currentSection = "files";
			} else if (trimmed.startsWith("## Libraries")) {
				currentSection = "libraries";
			} else if (trimmed.startsWith("- ")) {
				const item = trimmed.substring(2);
				if (currentSection === "acceptance") {
					acceptanceCriteria.push(item);
				} else if (currentSection === "technical") {
					technicalTasks.push(item);
				} else if (currentSection === "libraries") {
					libraries.push(item);
				}
			} else if (currentSection === "description" && trimmed) {
				description += `${trimmed} `;
			}
		}

		// If no specific files are mentioned, provide intelligent defaults based on story type
		if (writeableFiles.length === 0) {
			writeableFiles = this.inferFilesFromStory(
				title,
				description,
				technicalTasks,
			);
		}

		// Add common read-only files for context
		if (readOnlyFiles.length === 0) {
			readOnlyFiles = ["package.json", "tsconfig.json", "README.md"].filter(
				(file) => fs.existsSync(file),
			);
		}

		return {
			id: storyId,
			title: title || `Story ${storyId}`,
			description: description.trim() || "No description provided",
			acceptanceCriteria,
			technicalTasks,
			filePaths: {
				readOnly: readOnlyFiles,
				writeable: writeableFiles,
			},
			libraries,
			storyPoints: 3, // Default value
			status: "in_progress",
		};
	}

	private inferFilesFromStory(
		title: string,
		description: string,
		tasks: string[],
	): string[] {
		const files: string[] = [];
		const content = `${title} ${description} ${tasks.join(" ")}`.toLowerCase();

		// Basic setup and configuration story
		if (
			content.includes("setup") ||
			content.includes("configuration") ||
			content.includes("basic")
		) {
			files.push(
				"src/config/index.ts",
				"src/lib/setup.ts",
				"src/types/config.ts",
			);
		}

		// If it mentions tests
		if (content.includes("test") || content.includes("testing")) {
			files.push("test/setup.test.ts");
		}

		// If it mentions documentation
		if (content.includes("documentation") || content.includes("docs")) {
			files.push("docs/setup.md");
		}

		// Default fallback - create a simple implementation file
		if (files.length === 0) {
			files.push("src/lib/implementation.ts");
		}

		return files;
	}

	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}

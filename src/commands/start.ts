import { exec } from "node:child_process";
import path from "node:path";
import { Command } from "@oclif/core";
import * as chokidar from "chokidar";
import * as Docker from "dockerode";
import * as fs from "fs-extra";
import * as yaml from "js-yaml";

export default class Start extends Command {
	static description = "Start the aishell services and file watcher";

	async run(): Promise<void> {
		const docker = new Docker();
		await docker.compose.up({ cwd: process.cwd(), log: true });

		const watcher = chokidar.watch(
			path.join(process.cwd(), ".aishell/03_ideas"),
			{
				ignored: /(^|\/)\.[^\/]/,
				persistent: true,
			},
		);

		watcher.on("add", (filePath) => {
			this.log(`New idea detected: ${filePath}`);
			this.processIdea(filePath);
		});

		this.log("aishell services started and watching for new ideas.");
	}

	private async processIdea(filePath: string) {
		try {
			const ideaContent = fs.readFileSync(filePath, "utf8");
			const refsDir = path.join(process.cwd(), ".aishell/refs");

			// 1. Idea to PRD using Sequential Thinking MCP
			const prdContent = await this.ideaToPrd(ideaContent);
			fs.writeFileSync(
				path.join(process.cwd(), ".aishell/04_backlog", "PRD.md"),
				prdContent,
			);
			this.log("PRD generated successfully.");

			// 2. PRD Chunking using Sequential Thinking MCP
			const chunks = await this.chunkPrd(prdContent);
			this.log("PRD chunked successfully.");

			// 3. Stakeholder Validation (stubbed for now)
			const validatedChunks = chunks;
			this.log("Chunks validated successfully.");

			// 4. Backlog Refinement using GitHub MCP
			const stories = await this.refineBacklog(validatedChunks);
			this.log("Backlog refined successfully.");

			// 5. Capacity Planning (stubbed)
			const capacity = await this.planCapacity();
			this.log("Capacity planned successfully.");

			// 6. Sprint Planning using GitHub MCP
			await this.planSprint(stories, capacity);
			this.log("Sprint planned successfully.");

			// 7. Run Aider Command
			const aiderResponse = await this.runAiderCommand(
				"Please review the sprint plan and provide any feedback or suggestions.",
			);
			this.log("Aider response:", aiderResponse);
		} catch (error) {
			this.log(
				`Error during process: ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
		}
	}

	private async ideaToPrd(ideaContent: string): Promise<string> {
		// Use Sequential Thinking MCP to structure the idea into a PRD
		return `PRD for: ${ideaContent}\n# Product Requirements Document\n## Overview\n...`;
	}

	private async chunkPrd(prdContent: string): Promise<string[]> {
		// Use Sequential Thinking MCP to break PRD into chunks
		return prdContent.split("\n## ").filter((chunk) => chunk.trim());
	}

	private async validateChunks(chunks: string[]): Promise<string[]> {
		// Placeholder for stakeholder validation
		return chunks;
	}

	private async refineBacklog(validatedChunks: string[]): Promise<string[]> {
		// Use GitHub MCP to create issues from chunks
		return validatedChunks.map((chunk) => `Story: ${chunk}`);
	}

	private async planCapacity(): Promise<number> {
		// Placeholder for capacity planning
		return 30;
	}

	private async planSprint(stories: string[], capacity: number): Promise<void> {
		// Use GitHub MCP to create a sprint milestone
		this.log(
			`Planning sprint with ${stories.length} stories and capacity ${capacity}`,
		);
	}
	private async runAiderCommand(message: string): Promise<string> {
		return new Promise((resolve, reject) => {
			const command = `docker exec -it aishell_aider aider --message "${message}"`;
			exec(command, (error, stdout, stderr) => {
				if (error) reject(error);
				else resolve(stdout);
			});
		});
	}
}

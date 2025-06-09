import * as path from "path";
import * as fs from "fs-extra";
import type {
	AiderConfig,
	BuildResult,
	StoryAnalysis,
	UserStory,
} from "../../types/aider.js";
import { invokeClaude } from "../../utils/llm.js";
import { AiderClient } from "../aider.js";

export class BuilderAgent {
	private aiderClient: AiderClient;

	constructor() {
		this.aiderClient = new AiderClient();
	}

	async execute(story: UserStory): Promise<BuildResult> {
		try {
			// 1. Analyze story requirements
			const analysis = await this.analyzeStory(story);

			// 2. Prepare Aider configuration
			const aiderConfig: AiderConfig = {
				model: process.env.AIDER_MODEL || "claude-3-5-sonnet-20241022",
				editorModel:
					process.env.AIDER_EDITOR_MODEL || "claude-3-haiku-20240307",
				editableFiles: analysis.writeableFiles,
				readOnlyFiles: analysis.readOnlyFiles,
				prompt: this.buildImplementationPrompt(story, analysis),
				autoCommits: false,
				useGit: false,
				timeout: Number.parseInt(process.env.AIDER_TIMEOUT || "300000"),
			};

			// 3. Execute Aider
			const result = await this.aiderClient.executeAider(aiderConfig);

			// 4. Process results
			return {
				success: result.success,
				filesChanged: result.filesChanged,
				error: result.error,
				reviewRequired: true, // Always require review for generated code
			};
		} catch (error) {
			return {
				success: false,
				error: `Builder Agent failed: ${error instanceof Error ? error.message : String(error)}`,
				reviewRequired: false,
			};
		}
	}

	private async analyzeStory(story: UserStory): Promise<StoryAnalysis> {
		const prompt = `
Analyze this user story and identify the files that need to be modified and the dependencies required:

**Story Title:** ${story.title}

**Description:** ${story.description}

**Acceptance Criteria:**
${story.acceptanceCriteria.map((c) => `- ${c}`).join("\n")}

**Technical Tasks:**
${story.technicalTasks.map((t) => `- ${t}`).join("\n")}

**Specified File Paths:**
- Read-only: ${story.filePaths.readOnly.join(", ")}
- Writeable: ${story.filePaths.writeable.join(", ")}

**Libraries:** ${story.libraries.join(", ")}

Please provide a JSON response with:
{
  "writeableFiles": ["list of files to modify"],
  "readOnlyFiles": ["list of files to read for context"],
  "dependencies": ["list of npm packages needed"],
  "complexity": "low|medium|high",
  "estimatedTime": "minutes as number"
}

Focus on the files that actually exist in the project and are relevant to the implementation.
`;

		try {
			const response = await invokeClaude(prompt, "claude-3-haiku-20240307");
			const analysis = JSON.parse(response);

			// Validate that files exist
			const validWriteableFiles = await this.validateFiles(
				analysis.writeableFiles,
			);
			const validReadOnlyFiles = await this.validateFiles(
				analysis.readOnlyFiles,
			);

			return {
				writeableFiles: validWriteableFiles,
				readOnlyFiles: validReadOnlyFiles,
				dependencies: analysis.dependencies || [],
				complexity: analysis.complexity || "medium",
				estimatedTime: analysis.estimatedTime || 30,
			};
		} catch (error) {
			// Fallback to story-specified files if analysis fails
			return {
				writeableFiles: story.filePaths.writeable,
				readOnlyFiles: story.filePaths.readOnly,
				dependencies: story.libraries,
				complexity: "medium",
				estimatedTime: 30,
			};
		}
	}

	private async validateFiles(filePaths: string[]): Promise<string[]> {
		const validFiles: string[] = [];

		for (const filePath of filePaths) {
			try {
				const fullPath = path.resolve(filePath);
				if (await fs.pathExists(fullPath)) {
					validFiles.push(filePath);
				}
			} catch (error) {
				// Skip invalid files
				continue;
			}
		}

		return validFiles;
	}

	private buildImplementationPrompt(
		story: UserStory,
		analysis: StoryAnalysis,
	): string {
		return `
Implement the following user story:

**Title:** ${story.title}

**Description:** ${story.description}

**Acceptance Criteria:**
${story.acceptanceCriteria.map((c) => `- ${c}`).join("\n")}

**Technical Tasks:**
${story.technicalTasks.map((t) => `- ${t}`).join("\n")}

**Implementation Guidelines:**
- Follow TypeScript best practices and existing code patterns
- Add comprehensive error handling
- Include proper type definitions
- Write clean, maintainable code
- Add JSDoc comments for public methods
- Ensure backward compatibility
- Follow the existing project structure and conventions

**Files to modify:** ${analysis.writeableFiles.join(", ")}
**Context files:** ${analysis.readOnlyFiles.join(", ")}
**Required libraries:** ${analysis.dependencies.join(", ")}

Please implement this story completely, ensuring all acceptance criteria are met and all technical tasks are completed.
`;
	}

	async checkPrerequisites(): Promise<{ ready: boolean; issues: string[] }> {
		const issues: string[] = [];

		// Check Docker availability
		const dockerAvailable = await this.aiderClient.checkDockerAvailability();
		if (!dockerAvailable) {
			issues.push("Docker is not available or not running");
		}

		// Check Aider image
		const imageInfo = await this.aiderClient.getImageInfo();
		if (!imageInfo) {
			issues.push(
				"Aider Docker image not found. Run: docker pull paulgauthier/aider",
			);
		}

		// Check API keys
		if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
			issues.push(
				"No LLM API keys found. Set ANTHROPIC_API_KEY or OPENAI_API_KEY",
			);
		}

		return {
			ready: issues.length === 0,
			issues,
		};
	}

	async getStatus(): Promise<{
		dockerAvailable: boolean;
		imageAvailable: boolean;
		apiKeysConfigured: boolean;
	}> {
		return {
			dockerAvailable: await this.aiderClient.checkDockerAvailability(),
			imageAvailable: !!(await this.aiderClient.getImageInfo()),
			apiKeysConfigured: !!(
				process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY
			),
		};
	}
}

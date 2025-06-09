import fs from "node:fs";
import path from "node:path";
import { Args, Command } from "@oclif/core";
import * as YAML from "js-yaml";
import { v4 as uuidv4 } from "uuid";

export default class Story extends Command {
	static description =
		"Generate user stories with technical details from a validated chunk.";

	static examples = [
		"<%= config.bin %> <%= command.id %> chunk-abc123",
		"<%= config.bin %> <%= command.id %> my-feature-chunk",
	];

	static args = {
		chunkId: Args.string({
			description:
				"The unique identifier of the chunk to generate stories from",
			required: true,
		}),
	};

	async run(): Promise<void> {
		const { args } = await this.parse(Story);
		const { chunkId } = args;

		try {
			// 1. Validate chunk exists and load content
			const chunkPath = path.join(
				process.cwd(),
				".aisdlc/04_backlog",
				`${chunkId}.chunk.md`,
			);
			if (!fs.existsSync(chunkPath)) {
				this.error(`Chunk file not found: ${chunkPath}`);
			}

			const chunkContent = fs.readFileSync(chunkPath, "utf8");
			this.log(`📖 Loading chunk: ${chunkId}`);

			// 2. Load index.yml to verify chunk status
			const indexPath = path.join(process.cwd(), ".aisdlc", "index.yml");
			const indexData: any = fs.existsSync(indexPath)
				? YAML.load(fs.readFileSync(indexPath, "utf8")) || {}
				: {};

			if (!indexData[chunkId]) {
				this.error(`Chunk ${chunkId} not found in index.yml`);
			}

			if (indexData[chunkId].type !== "chunk") {
				this.error(
					`Artifact ${chunkId} is not a chunk (type: ${indexData[chunkId].type})`,
				);
			}

			if (
				indexData[chunkId].status !== "validated" &&
				indexData[chunkId].status !== "backlog"
			) {
				this.warn(
					`Chunk ${chunkId} has status: ${indexData[chunkId].status}. Proceeding anyway.`,
				);
			}

			// 3. Generate user stories using Planner Agent
			this.log("🤖 Invoking Planner Agent to generate user stories...");
			const stories = await this.generateStories(chunkContent, chunkId);

			// 4. Save stories to in_progress directory
			const storyIds: string[] = [];
			const inProgressDir = path.join(process.cwd(), ".aisdlc/05_in_progress");
			fs.mkdirSync(inProgressDir, { recursive: true });

			for (let i = 0; i < stories.length; i++) {
				const storyId = `story-${uuidv4().slice(0, 8)}`;
				const storyPath = path.join(inProgressDir, `${storyId}.story.md`);

				// Add YAML frontmatter to story
				const storyWithFrontmatter = this.addFrontmatter(
					stories[i],
					storyId,
					chunkId,
					i + 1,
				);
				fs.writeFileSync(storyPath, storyWithFrontmatter);
				storyIds.push(storyId);

				this.log(`📄 Story ${i + 1} saved: ${storyPath}`);
			}

			// 5. Update index.yml
			for (let i = 0; i < storyIds.length; i++) {
				const storyId = storyIds[i];
				const storyPoints = this.extractStoryPoints(stories[i]);

				indexData[storyId] = {
					id: storyId,
					type: "story",
					status: "ready",
					title: this.extractTitle(stories[i]),
					priority: indexData[chunkId].priority || "medium",
					story_points: storyPoints,
					source_chunk_id: chunkId,
					story_number: i + 1,
					total_stories: stories.length,
					source_file: path.join(
						".aisdlc/05_in_progress",
						`${storyId}.story.md`,
					),
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
					ready_at: new Date().toISOString(),
					owner_agent_type: "PlannerAgent",
				};
			}

			// Update original chunk status
			indexData[chunkId].status = "storified";
			indexData[chunkId].updated_at = new Date().toISOString();
			indexData[chunkId].story_ids = storyIds;

			fs.writeFileSync(indexPath, YAML.dump(indexData));
			this.log("✅ Index updated successfully.");

			this.log(`\n🎉 User stories generated successfully!`);
			this.log(`Generated ${stories.length} stories:`);
			storyIds.forEach((id, index) => {
				const points = this.extractStoryPoints(stories[index]);
				this.log(`  ${index + 1}. ${id} (${points} points)`);
			});

			const totalPoints = stories.reduce(
				(sum, story) => sum + this.extractStoryPoints(story),
				0,
			);
			this.log(`\nTotal story points: ${totalPoints}`);

			this.log(`\nNext steps:`);
			this.log(`  - Review stories in .aisdlc/05_in_progress/`);
			this.log(`  - Implement with: ai aide <storyId>`);
			this.log(`  - Or start automated flow with: ai start`);
		} catch (error) {
			this.error(
				`Failed to generate stories: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	private async generateStories(
		chunkContent: string,
		chunkId: string,
	): Promise<string[]> {
		// TODO: Implement actual LLM integration with Planner Agent
		// For now, return example stories based on chunk content

		const prompt = `
You are a Planner Agent. Analyze the following chunk and break it down into detailed, actionable user stories that follow the INVEST principles.

CHUNK CONTENT:
${chunkContent}

Generate 3-5 user stories that:
1. Are Independent and don't block each other
2. Are Negotiable and can be refined
3. Provide clear Value to users
4. Are Estimable with story points (1,2,3,5,8,13)
5. Are Small enough to complete in one sprint
6. Are Testable with clear acceptance criteria

For each story, provide:
- User story format: "As a [user], I want [goal] so that [benefit]"
- Detailed description
- Acceptance criteria (testable)
- Technical tasks
- Story point estimate
- Dependencies
`;

		// Placeholder implementation - replace with actual LLM call
		const stories = [
			`# User Story 1: Basic Setup and Configuration

## Story
As a developer, I want to set up the basic project structure and configuration so that I can start implementing the core features.

## Description
This story covers the foundational setup required for the feature implementation, including project structure, dependencies, and basic configuration.

## Acceptance Criteria
- [ ] Project structure is created with appropriate directories
- [ ] Required dependencies are installed and configured
- [ ] Basic configuration files are set up
- [ ] Development environment is ready for feature implementation
- [ ] Initial tests pass successfully

## Technical Tasks
- Set up project directory structure
- Install and configure required dependencies
- Create configuration files (database, environment, etc.)
- Set up basic testing framework
- Create initial documentation

## Story Points
3

## Dependencies
None (foundational story)

## Definition of Done
- [ ] Code is committed to version control
- [ ] Basic tests are written and passing
- [ ] Documentation is updated
- [ ] Code review is completed

---
*Generated by Planner Agent*
*Source Chunk: ${chunkId}*
*Story: 1 of 3*`,

			`# User Story 2: Core Feature Implementation

## Story
As a user, I want to access the core functionality so that I can accomplish my primary goals with the system.

## Description
This story implements the main feature functionality as defined in the chunk requirements.

## Acceptance Criteria
- [ ] Core feature is implemented and functional
- [ ] User can interact with the feature through the interface
- [ ] Feature handles expected inputs correctly
- [ ] Error handling is implemented for edge cases
- [ ] Performance meets specified requirements

## Technical Tasks
- Implement core business logic
- Create user interface components
- Add input validation and error handling
- Implement data persistence layer
- Add logging and monitoring

## Story Points
8

## Dependencies
- Story 1 (Basic Setup and Configuration)

## Definition of Done
- [ ] Feature is fully implemented
- [ ] Unit tests achieve >80% coverage
- [ ] Integration tests pass
- [ ] Code review is completed
- [ ] Documentation is updated

---
*Generated by Planner Agent*
*Source Chunk: ${chunkId}*
*Story: 2 of 3*`,

			`# User Story 3: Testing and Quality Assurance

## Story
As a quality assurance engineer, I want comprehensive tests for the feature so that I can ensure it works correctly and reliably.

## Description
This story focuses on implementing comprehensive testing and quality assurance measures for the feature.

## Acceptance Criteria
- [ ] Unit tests cover all critical functionality
- [ ] Integration tests validate end-to-end workflows
- [ ] Performance tests verify system meets requirements
- [ ] Security tests check for vulnerabilities
- [ ] Test coverage meets minimum threshold (80%)

## Technical Tasks
- Write comprehensive unit tests
- Implement integration test suite
- Add performance testing
- Conduct security testing
- Set up automated test execution

## Story Points
5

## Dependencies
- Story 2 (Core Feature Implementation)

## Definition of Done
- [ ] All tests are implemented and passing
- [ ] Test coverage meets requirements
- [ ] Performance benchmarks are established
- [ ] Security scan passes
- [ ] Test automation is configured

---
*Generated by Planner Agent*
*Source Chunk: ${chunkId}*
*Story: 3 of 3*`,
		];

		return stories;
	}

	private addFrontmatter(
		content: string,
		storyId: string,
		chunkId: string,
		storyNumber: number,
	): string {
		const storyPoints = this.extractStoryPoints(content);

		const frontmatter = {
			id: storyId,
			type: "story",
			status: "ready",
			source_chunk_id: chunkId,
			story_number: storyNumber,
			story_points: storyPoints,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			ready_at: new Date().toISOString(),
		};

		return `---
${YAML.dump(frontmatter)}---

${content}`;
	}

	private extractTitle(content: string): string {
		const lines = content.split("\n");
		for (const line of lines) {
			if (line.startsWith("# ")) {
				return line.substring(2).trim();
			}
		}
		return "Untitled Story";
	}

	private extractStoryPoints(content: string): number {
		// Look for story points in the content
		const pointsMatch = content.match(/## Story Points\s*(\d+)/i);
		if (pointsMatch) {
			return Number.parseInt(pointsMatch[1], 10);
		}

		// Default to 3 points if not specified
		return 3;
	}
}

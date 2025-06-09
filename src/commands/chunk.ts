import fs from "node:fs";
import path from "node:path";
import { Args, Command } from "@oclif/core";
import * as YAML from "js-yaml";
import { v4 as uuidv4 } from "uuid";

export default class Chunk extends Command {
	static description =
		"Split a PRD into smaller, manageable chunks for development.";

	static examples = [
		"<%= config.bin %> <%= command.id %> prd-abc123",
		"<%= config.bin %> <%= command.id %> my-feature-prd",
	];

	static args = {
		prdId: Args.string({
			description: "The unique identifier of the PRD artifact to chunk",
			required: true,
		}),
	};

	async run(): Promise<void> {
		const { args } = await this.parse(Chunk);
		const { prdId } = args;

		try {
			// 1. Validate PRD exists and load content
			const prdPath = path.join(
				process.cwd(),
				".aishell/04_backlog",
				`${prdId}.prd.md`,
			);
			if (!fs.existsSync(prdPath)) {
				this.error(`PRD file not found: ${prdPath}`);
			}

			const prdContent = fs.readFileSync(prdPath, "utf8");
			this.log(`📖 Loading PRD: ${prdId}`);

			// 2. Load index.yml to verify PRD status
			const indexPath = path.join(process.cwd(), ".aishell", "index.yml");
			const indexData: any = fs.existsSync(indexPath)
				? YAML.load(fs.readFileSync(indexPath, "utf8")) || {}
				: {};

			if (!indexData[prdId]) {
				this.error(`PRD ${prdId} not found in index.yml`);
			}

			if (indexData[prdId].type !== "prd") {
				this.error(
					`Artifact ${prdId} is not a PRD (type: ${indexData[prdId].type})`,
				);
			}

			// 3. Generate chunks using Planner Agent
			this.log("🤖 Invoking Planner Agent to chunk PRD...");
			const chunks = await this.chunkPrd(prdContent, prdId);

			// 4. Save chunks to backlog
			const chunkIds: string[] = [];
			for (let i = 0; i < chunks.length; i++) {
				const chunkId = `chunk-${uuidv4().slice(0, 8)}`;
				const chunkPath = path.join(
					process.cwd(),
					".aishell/04_backlog",
					`${chunkId}.chunk.md`,
				);

				// Add YAML frontmatter to chunk
				const chunkWithFrontmatter = this.addFrontmatter(
					chunks[i],
					chunkId,
					prdId,
					i + 1,
				);

				// Ensure the directory exists
				fs.mkdirSync(path.dirname(chunkPath), { recursive: true });
				fs.writeFileSync(chunkPath, chunkWithFrontmatter);
				chunkIds.push(chunkId);

				this.log(`📄 Chunk ${i + 1} saved: ${chunkPath}`);
			}

			// 5. Update index.yml
			for (let i = 0; i < chunkIds.length; i++) {
				const chunkId = chunkIds[i];
				indexData[chunkId] = {
					id: chunkId,
					type: "chunk",
					status: "backlog",
					title: this.extractTitle(chunks[i]),
					priority: indexData[prdId].priority || "medium",
					source_prd_id: prdId,
					chunk_number: i + 1,
					total_chunks: chunks.length,
					source_file: path.join(".aishell/04_backlog", `${chunkId}.chunk.md`),
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
					owner_agent_type: "PlannerAgent",
				};
			}

			// Update original PRD status
			indexData[prdId].status = "chunked";
			indexData[prdId].updated_at = new Date().toISOString();
			indexData[prdId].chunk_ids = chunkIds;

			fs.writeFileSync(indexPath, YAML.dump(indexData));
			this.log("✅ Index updated successfully.");

			this.log(`\n🎉 PRD chunked successfully!`);
			this.log(`Generated ${chunks.length} chunks:`);
			chunkIds.forEach((id, index) => {
				this.log(`  ${index + 1}. ${id}`);
			});
			this.log(`\nNext steps:`);
			this.log(`  - Validate chunks: ai validate <chunkId>`);
			this.log(`  - Generate stories: ai story <chunkId>`);
		} catch (error) {
			this.error(
				`Failed to chunk PRD: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	private async chunkPrd(prdContent: string, prdId: string): Promise<string[]> {
		// TODO: Implement actual LLM integration with Planner Agent
		// For now, return example chunks based on PRD sections

		const prompt = `
You are a Planner Agent. Analyze the following PRD and break it down into smaller, manageable chunks that can be developed independently.

PRD CONTENT:
${prdContent}

Break this PRD into 3-5 logical chunks, each representing a cohesive feature area that can be developed as a unit. Each chunk should:
1. Be independent and not block other chunks
2. Represent a complete feature or capability
3. Be small enough to be completed in 1-2 sprints
4. Have clear boundaries and interfaces

For each chunk, provide:
- Clear title and description
- Scope and boundaries
- Key features included
- Dependencies on other chunks
- Acceptance criteria
`;

		// Placeholder implementation - replace with actual LLM call
		const chunks = [
			`# Chunk 1: Core Infrastructure

## Description
Foundation infrastructure and basic setup for the feature.

## Scope
- Database schema design
- API endpoint structure
- Basic authentication
- Core data models

## Key Features
- User management system
- Basic CRUD operations
- Security framework
- Logging and monitoring

## Dependencies
None (foundational chunk)

## Acceptance Criteria
- [ ] Database schema created and migrated
- [ ] API endpoints respond correctly
- [ ] Authentication system functional
- [ ] Basic security measures in place

---
*Generated by Planner Agent*
*Source PRD: ${prdId}*
*Chunk: 1 of 3*`,

			`# Chunk 2: User Interface

## Description
User-facing interface and interaction components.

## Scope
- Frontend components
- User experience flows
- Form handling
- Data visualization

## Key Features
- Responsive UI components
- User interaction flows
- Form validation
- Dashboard views

## Dependencies
- Chunk 1 (Core Infrastructure)

## Acceptance Criteria
- [ ] UI components implemented
- [ ] User flows functional
- [ ] Forms validate correctly
- [ ] Dashboard displays data

---
*Generated by Planner Agent*
*Source PRD: ${prdId}*
*Chunk: 2 of 3*`,

			`# Chunk 3: Advanced Features

## Description
Advanced functionality and optimization features.

## Scope
- Advanced analytics
- Performance optimization
- Integration capabilities
- Advanced user features

## Key Features
- Analytics dashboard
- Performance monitoring
- Third-party integrations
- Advanced user settings

## Dependencies
- Chunk 1 (Core Infrastructure)
- Chunk 2 (User Interface)

## Acceptance Criteria
- [ ] Analytics system functional
- [ ] Performance metrics tracked
- [ ] Integrations working
- [ ] Advanced features accessible

---
*Generated by Planner Agent*
*Source PRD: ${prdId}*
*Chunk: 3 of 3*`,
		];

		return chunks;
	}

	private addFrontmatter(
		content: string,
		chunkId: string,
		prdId: string,
		chunkNumber: number,
	): string {
		const frontmatter = {
			id: chunkId,
			type: "chunk",
			status: "backlog",
			source_prd_id: prdId,
			chunk_number: chunkNumber,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
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
		return "Untitled Chunk";
	}
}

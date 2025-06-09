import fs from "node:fs";
import path from "node:path";
import { Args, Command, Flags } from "@oclif/core";
import * as YAML from "js-yaml";

export default class Vector extends Command {
	static description =
		"Embed all .aisdlc artifacts into the vector database for semantic search.";

	static examples = [
		"<%= config.bin %> <%= command.id %> sync",
		"<%= config.bin %> <%= command.id %> sync --force",
		"<%= config.bin %> <%= command.id %> search 'user authentication'",
	];

	static args = {
		action: Args.string({
			description: "Action to perform: sync or search",
			required: true,
			options: ["sync", "search"],
		}),
		query: Args.string({
			description: "Search query (required for search action)",
			required: false,
		}),
	};

	static flags = {
		force: Flags.boolean({
			description:
				"Force re-embedding of all artifacts, even if already embedded",
			default: false,
		}),
		limit: Flags.integer({
			description: "Maximum number of search results to return",
			default: 10,
		}),
	};

	async run(): Promise<void> {
		const { args, flags } = await this.parse(Vector);
		const { action, query } = args;
		const { force, limit } = flags;

		try {
			if (action === "sync") {
				await this.syncVectorDatabase(force);
			} else if (action === "search") {
				if (!query) {
					this.error("Search query is required for search action");
				}
				await this.searchVectorDatabase(query as string, limit);
			}
		} catch (error) {
			this.error(
				`Vector operation failed: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	private async syncVectorDatabase(force: boolean): Promise<void> {
		this.log("🔄 Starting vector database synchronization...");

		// 1. Initialize vector database
		const vectorDbPath = path.join(process.cwd(), ".aisdlc", "vector.db");
		const metadataPath = path.join(
			process.cwd(),
			".aisdlc",
			"vector-metadata.yml",
		);

		let metadata: any = {};
		if (fs.existsSync(metadataPath) && !force) {
			metadata = YAML.load(fs.readFileSync(metadataPath, "utf8")) || {};
		}

		// 2. Scan for artifacts to embed
		const artifacts = await this.scanArtifacts();
		this.log(`📁 Found ${artifacts.length} artifacts to process`);

		let embedded = 0;
		let skipped = 0;

		// 3. Process each artifact
		for (const artifact of artifacts) {
			const lastModified = fs.statSync(artifact.path).mtime.toISOString();
			const artifactKey = artifact.path;

			// Skip if already embedded and not modified (unless force)
			if (
				!force &&
				metadata[artifactKey] &&
				metadata[artifactKey].last_embedded >= lastModified
			) {
				skipped++;
				continue;
			}

			this.log(`🔍 Embedding: ${artifact.relativePath}`);

			// Read and process content
			const content = fs.readFileSync(artifact.path, "utf8");
			const processedContent = this.preprocessContent(content, artifact.type);

			// TODO: Implement actual embedding with a service like OpenAI embeddings
			// For now, simulate the embedding process
			await this.embedContent(artifact.id, processedContent, artifact);

			// Update metadata
			metadata[artifactKey] = {
				id: artifact.id,
				type: artifact.type,
				last_embedded: new Date().toISOString(),
				content_hash: this.hashContent(processedContent),
				embedding_model: "text-embedding-ada-002", // TODO: Make configurable
			};

			embedded++;
			await this.sleep(100); // Simulate processing time
		}

		// 4. Save metadata
		fs.writeFileSync(metadataPath, YAML.dump(metadata));

		this.log(`\n✅ Vector synchronization completed!`);
		this.log(`📊 Statistics:`);
		this.log(`  - Embedded: ${embedded} artifacts`);
		this.log(`  - Skipped: ${skipped} artifacts (already up-to-date)`);
		this.log(`  - Total: ${artifacts.length} artifacts`);
		this.log(
			`\n💡 Use 'ai vector search "<query>"' to search the knowledge base`,
		);
	}

	private async searchVectorDatabase(
		query: string,
		limit: number,
	): Promise<void> {
		this.log(`🔍 Searching vector database for: "${query}"`);

		// TODO: Implement actual vector search
		// For now, simulate search results
		const mockResults = [
			{
				id: "prd-abc123",
				type: "prd",
				title: "User Authentication System",
				similarity: 0.92,
				path: ".aisdlc/04_backlog/prd-abc123.prd.md",
				snippet:
					"This PRD outlines the requirements for implementing a secure user authentication system...",
			},
			{
				id: "story-def456",
				type: "story",
				title: "Implement Login Form",
				similarity: 0.87,
				path: ".aisdlc/05_in_progress/story-def456.story.md",
				snippet:
					"As a user, I want to log in to the system so that I can access my account...",
			},
			{
				id: "chunk-ghi789",
				type: "chunk",
				title: "Authentication Infrastructure",
				similarity: 0.83,
				path: ".aisdlc/04_backlog/chunk-ghi789.chunk.md",
				snippet:
					"Core authentication infrastructure including JWT tokens, password hashing...",
			},
		];

		if (mockResults.length === 0) {
			this.log("❌ No results found for your query");
			return;
		}

		this.log(`\n📋 Found ${mockResults.length} relevant artifacts:\n`);

		for (let i = 0; i < Math.min(mockResults.length, limit); i++) {
			const result = mockResults[i];
			this.log(`${i + 1}. ${result.title} (${result.type})`);
			this.log(`   📁 ${result.path}`);
			this.log(`   🎯 Similarity: ${(result.similarity * 100).toFixed(1)}%`);
			this.log(`   📝 ${result.snippet}`);
			this.log("");
		}

		this.log(
			`💡 Use 'ai prd <id>' or 'ai story <id>' to work with these artifacts`,
		);
	}

	private async scanArtifacts(): Promise<
		Array<{
			id: string;
			type: string;
			path: string;
			relativePath: string;
		}>
	> {
		const artifacts: Array<{
			id: string;
			type: string;
			path: string;
			relativePath: string;
		}> = [];

		const aisdlcDir = path.join(process.cwd(), ".aisdlc");

		// Scan different directories for artifacts
		const scanDirs = [
			{ dir: "03_ideas", type: "idea", extension: ".md" },
			{ dir: "04_backlog", type: "prd", extension: ".prd.md" },
			{ dir: "04_backlog", type: "chunk", extension: ".chunk.md" },
			{ dir: "05_in_progress", type: "story", extension: ".story.md" },
			{ dir: "06_done", type: "completed", extension: ".md" },
		];

		for (const scanConfig of scanDirs) {
			const dirPath = path.join(aisdlcDir, scanConfig.dir);
			if (!fs.existsSync(dirPath)) continue;

			const files = fs.readdirSync(dirPath);
			for (const file of files) {
				if (file.endsWith(scanConfig.extension)) {
					const filePath = path.join(dirPath, file);
					const relativePath = path.relative(process.cwd(), filePath);
					const id = file.replace(scanConfig.extension, "");

					artifacts.push({
						id,
						type: scanConfig.type,
						path: filePath,
						relativePath,
					});
				}
			}
		}

		return artifacts;
	}

	private preprocessContent(content: string, type: string): string {
		// Remove YAML frontmatter
		const yamlFrontmatterRegex = /^---\s*\n.*?\n---\s*\n/s;
		let processed = content.replace(yamlFrontmatterRegex, "");

		// Remove excessive whitespace
		processed = processed.replace(/\n\s*\n\s*\n/g, "\n\n");

		// Add type-specific processing
		if (type === "story") {
			// Emphasize user story format and acceptance criteria
			processed = processed.replace(/## Story\s*\n/g, "\n[USER STORY] ");
			processed = processed.replace(
				/## Acceptance Criteria\s*\n/g,
				"\n[ACCEPTANCE CRITERIA] ",
			);
		}

		return processed.trim();
	}

	private async embedContent(
		id: string,
		content: string,
		artifact: any,
	): Promise<void> {
		// TODO: Implement actual embedding API call
		// Example with OpenAI:
		// const response = await openai.embeddings.create({
		//   model: "text-embedding-ada-002",
		//   input: content,
		// });
		// const embedding = response.data[0].embedding;
		// Store embedding in vector database

		// For now, just simulate the process
		await this.sleep(50);
	}

	private hashContent(content: string): string {
		// Simple hash function for content change detection
		let hash = 0;
		for (let i = 0; i < content.length; i++) {
			const char = content.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash; // Convert to 32-bit integer
		}
		return hash.toString(36);
	}

	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}

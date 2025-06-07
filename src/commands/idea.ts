import path from "node:path";
import { Command } from "@oclif/core";
import * as fs from "fs-extra";
import * as YAML from "js-yaml";
import { v4 as uuidv4 } from "uuid";

export default class Idea extends Command {
	static description = "Submit a new idea to be processed by the system.";

	static examples = [
		"<%= config.bin %> <%= command.id %> ./path/to/my-idea.md",
	];

	// Defines the command-line argument, which is the path to the idea file
	static args = [
		{
			name: "file",
			required: true,
			description: "Path to the markdown file containing the idea.",
		},
	];

	public async run(): Promise<void> {
		const { args } = await this.parse(Idea);
		const ideaFilePath = path.resolve(args.file);

		if (!fs.existsSync(ideaFilePath)) {
			this.error(`Idea file not found at: ${ideaFilePath}`);
		}

		// 1. Generate a unique ID for the idea artifact
		const ideaId = `idea-${uuidv4().slice(0, 8)}`;
		const ideaText = fs.readFileSync(ideaFilePath, "utf-8");

		// 2. Create the new artifact file in the .ai/ideas directory
		const newFileName = `${ideaId}.md`;
		const newFilePath = path.resolve(".ai", "ideas", newFileName);

		// We add YAML front-matter to the file itself for metadata tracking
		const fileContent = `---\nid: ${ideaId}\nstatus: new\n---\n\n${ideaText}`;
		fs.writeFileSync(newFilePath, fileContent);
		this.log(`✅ Idea artifact created at: ${newFilePath}`);

		// 3. Update the master index.yml to register the new idea
		const indexPath = path.resolve(".ai", "index.yml");
		const indexData: any = fs.existsSync(indexPath)
			? YAML.load(fs.readFileSync(indexPath, "utf8")) || {}
			: {};

		indexData[ideaId] = {
			id: ideaId,
			status: "idea",
			source_file: newFilePath,
			created_at: new Date().toISOString(),
		};

		fs.writeFileSync(indexPath, YAML.dump(indexData));
		this.log("✅ Master index.yml updated.");
		this.log(
			`\nNext, run 'ai prd ${ideaId}' to generate the Product Requirements Document.`,
		);
	}
}

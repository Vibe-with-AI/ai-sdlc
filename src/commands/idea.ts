import fs from "node:fs";
import path from "node:path";
import { Args, Command } from "@oclif/core";
import * as YAML from "js-yaml";
import { v4 as uuidv4 } from "uuid";

export default class Idea extends Command {
	static description = "Submit a new idea to be processed by the system.";

	static examples = [
		"<%= config.bin %> <%= command.id %> ./path/to/my-idea.md",
	];

	// Defines the command-line argument, which is the path to the idea file
	static args = {
		file: Args.string({
			description: "Path to the markdown file containing the idea.",
			required: true,
		}),
	};

	public async run(): Promise<void> {
		const { args } = await this.parse(Idea);
		const ideaFilePath = path.resolve(args.file);

		if (!fs.existsSync(ideaFilePath)) {
			this.error(`Idea file not found at: ${ideaFilePath}`);
		}

		// 1. Generate a unique ID for the idea artifact
		const ideaId = `idea-${uuidv4().slice(0, 8)}`;
		const ideaText = fs.readFileSync(ideaFilePath, "utf-8");

		// 2. Create the new artifact file in the .aisdlc/03_ideas directory
		const newFileName = `${ideaId}.md`;
		const newFilePath = path.resolve(".aisdlc", "03_ideas", newFileName);

		// Ensure the directory exists
		fs.mkdirSync(path.dirname(newFilePath), { recursive: true });

		// We add YAML front-matter to the file itself for metadata tracking
		const fileContent = `---\nid: ${ideaId}\nstatus: idea\ncreated_at: ${new Date().toISOString()}\n---\n\n${ideaText}`;
		fs.writeFileSync(newFilePath, fileContent);
		this.log(`✅ Idea artifact created at: ${newFilePath}`);

		// 3. Update the master index.yml to register the new idea
		const indexPath = path.resolve(".aisdlc", "index.yml");
		const indexData: any = fs.existsSync(indexPath)
			? YAML.load(fs.readFileSync(indexPath, "utf8")) || {}
			: {};

		indexData[ideaId] = {
			id: ideaId,
			type: "idea",
			status: "idea",
			title: this.extractTitle(ideaText),
			source_file: newFilePath,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

		fs.writeFileSync(indexPath, YAML.dump(indexData));
		this.log("✅ Master index.yml updated.");
		this.log(
			`\nNext, run 'aisdlc prd ${ideaId}' to generate the Product Requirements Document.`,
		);
	}

	private extractTitle(content: string): string {
		const lines = content.split("\n");
		for (const line of lines) {
			if (line.startsWith("# ")) {
				return line.substring(2).trim();
			}
		}
		return "Untitled Idea";
	}
}

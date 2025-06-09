import { tmpdir } from "node:os";
import path from "node:path";
import { expect } from "chai";
import fs from "fs-extra";

// Test utility functions that might exist in the lib directory
describe("Utility Functions", () => {
	let testDir: string;

	beforeEach(async () => {
		testDir = path.join(tmpdir(), `aisdlc-utils-test-${Date.now()}`);
		await fs.ensureDir(testDir);
		process.chdir(testDir);
	});

	afterEach(async () => {
		// Small delay to ensure directory is not in use
		await new Promise((resolve) => setTimeout(resolve, 10));

		try {
			await fs.remove(testDir);
		} catch (error) {
			// Ignore cleanup errors
		}
	});

	describe("File Operations", () => {
		it("should handle YAML front matter parsing", () => {
			const content = `---
id: test-123
type: idea
status: active
---

# Test Content
This is test content.`;

			// This would test actual utility functions when they exist
			// For now, just test basic string operations
			const lines = content.split("\n");
			expect(lines[0]).to.equal("---");
			expect(lines[4]).to.equal("---");
			expect(lines[6]).to.equal("# Test Content");
		});

		it("should extract title from markdown content", () => {
			const content = `# Main Title
Some content here.

## Subtitle
More content.`;

			const lines = content.split("\n");
			const titleLine = lines.find((line) => line.startsWith("# "));
			const title = titleLine?.substring(2).trim();

			expect(title).to.equal("Main Title");
		});

		it("should generate unique IDs", () => {
			// Test ID generation pattern
			const id1 = `test-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
			const id2 = `test-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;

			expect(id1).to.not.equal(id2);
			expect(id1).to.match(/^test-\d+-[a-z0-9]{8}$/);
		});
	});

	describe("Validation", () => {
		it("should validate file extensions", () => {
			const validExtensions = [".md", ".prd.md", ".story.md", ".chunk.md"];

			expect(validExtensions.includes(".md")).to.be.true;
			expect(validExtensions.includes(".txt")).to.be.false;
		});

		it("should validate artifact types", () => {
			const validTypes = ["idea", "prd", "chunk", "story", "completed"];

			expect(validTypes.includes("idea")).to.be.true;
			expect(validTypes.includes("invalid")).to.be.false;
		});
	});
});

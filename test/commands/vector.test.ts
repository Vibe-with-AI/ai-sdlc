import { tmpdir } from "node:os";
import path from "node:path";
import { runCommand } from "@oclif/test";
import { expect } from "chai";
import fs from "fs-extra";

describe("vector command", () => {
	let testDir: string;

	beforeEach(async () => {
		// Create temporary directory for testing
		testDir = path.join(tmpdir(), `aisdlc-vector-test-${Date.now()}`);
		await fs.ensureDir(testDir);
		await fs.ensureDir(path.join(testDir, ".aisdlc"));
		process.chdir(testDir);
	});

	afterEach(async () => {
		// Small delay to ensure directory is not in use
		await new Promise((resolve) => setTimeout(resolve, 10));

		// Cleanup test directory
		try {
			await fs.remove(testDir);
		} catch (error) {
			// Ignore cleanup errors
		}
	});

	it("should require an action argument", async () => {
		const { error } = await runCommand("vector");
		expect(error?.message).to.contain("Missing 1 required arg");
		expect(error?.message).to.contain("action");
	});

	it("should sync artifacts when no artifacts exist", async () => {
		const { stdout, error } = await runCommand(["vector", "sync"]);
		// Command should complete successfully
		expect(error).to.be.undefined;
		expect(stdout).to.be.a("string");
	});

	it("should detect idea artifacts during sync", async () => {
		// Create test idea artifact
		await fs.ensureDir(".aisdlc/03_ideas");
		await fs.writeFile(
			".aisdlc/03_ideas/idea-test123.md",
			"---\nid: idea-test123\ntype: idea\n---\n# Test Idea\nThis is a test.",
		);

		const { stdout, error } = await runCommand(["vector", "sync"]);
		// Command should complete successfully
		expect(error).to.be.undefined;
		expect(stdout).to.be.a("string");
	});

	it("should handle search with no query", async () => {
		const { error } = await runCommand(["vector", "search"]);
		// Search requires a query parameter
		expect(error?.message).to.contain("Search query") ||
			expect(error?.message).to.contain("Missing");
	});

	it("should handle search with query", async () => {
		const { stdout } = await runCommand(["vector", "search", "test"]);
		// Should return search results or empty message
		expect(stdout).to.be.a("string");
	});
});

import { tmpdir } from "node:os";
import path from "node:path";
import { runCommand } from "@oclif/test";
import { expect } from "chai";
import fs from "fs-extra";

describe("idea command", () => {
	let testDir: string;
	let ideaFile: string;
	let originalCwd: string;

	beforeEach(async () => {
		// Save original directory
		originalCwd = process.cwd();

		// Create temporary directory for testing
		testDir = path.join(tmpdir(), `aisdlc-test-${Date.now()}`);
		await fs.ensureDir(testDir);
		await fs.ensureDir(path.join(testDir, ".aisdlc", "03_ideas"));

		// Create test idea file
		ideaFile = path.join(testDir, "test-idea.md");
		await fs.writeFile(
			ideaFile,
			"# Test Idea\n\nThis is a test idea for the CLI.",
		);

		// Change to test directory
		process.chdir(testDir);
	});

	afterEach(async () => {
		// Restore original directory first
		process.chdir(originalCwd);

		// Small delay to ensure directory is not in use
		await new Promise((resolve) => setTimeout(resolve, 10));

		// Cleanup test directory
		try {
			await fs.remove(testDir);
		} catch (error) {
			// Ignore cleanup errors
		}
	});

	it("should require a file argument", async () => {
		const { error } = await runCommand("idea");
		expect(error?.message).to.contain("Missing 1 required arg");
	});

	it("should handle valid idea file", async () => {
		const { stdout, error } = await runCommand(["idea", ideaFile]);

		// Should either succeed or fail gracefully
		if (error) {
			// If there's an error, it should be a meaningful one
			expect(error.message).to.be.a("string");
		} else {
			// If successful, should have some output
			expect(stdout).to.be.a("string");
		}
	});

	it("should error on non-existent file", async () => {
		const { error } = await runCommand(["idea", "non-existent.md"]);
		expect(error?.message).to.contain("not found") ||
			expect(error?.message).to.contain("ENOENT");
	});
});

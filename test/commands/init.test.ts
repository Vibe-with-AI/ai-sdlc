import { tmpdir } from "node:os";
import path from "node:path";
import { runCommand } from "@oclif/test";
import { expect } from "chai";
import fs from "fs-extra";

describe("init command", () => {
	let testDir: string;
	let originalCwd: string;

	beforeEach(async () => {
		// Save original directory
		originalCwd = process.cwd();

		// Create temporary directory for testing
		testDir = path.join(tmpdir(), `aisdlc-init-test-${Date.now()}`);
		await fs.ensureDir(testDir);
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

	it("should run init command without errors", async () => {
		const { stdout, error } = await runCommand("init");

		// Command should complete successfully
		expect(error).to.be.undefined;
		expect(stdout).to.be.a("string");
	});

	it("should handle existing .aisdlc directory", async () => {
		// Create .aisdlc directory first
		await fs.ensureDir(".aisdlc");

		const { stdout, error } = await runCommand("init");
		expect(error).to.be.undefined;
		// Should either skip or handle existing directory gracefully
		expect(stdout).to.be.a("string");
	});
});

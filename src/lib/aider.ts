import * as path from "path";
import Docker from "dockerode";
import * as fs from "fs-extra";
import {
	type AiderConfig,
	type AiderLogEntry,
	type AiderResult,
	ContainerStats,
	type DockerConfig,
} from "../types/aider.js";

export class AiderClient {
	private docker: Docker;
	private readonly defaultImage = "paulgauthier/aider";
	private readonly defaultConfig: DockerConfig = {
		image: this.defaultImage,
		memoryLimit: 2 * 1024 * 1024 * 1024, // 2GB
		cpuShares: 1024,
		timeout: 300000, // 5 minutes
		autoRemove: true,
		user:
			process.platform !== "win32"
				? `${process.getuid?.()}:${process.getgid?.()}`
				: undefined,
	};

	constructor() {
		this.docker = new Docker();
	}

	async executeAider(config: AiderConfig): Promise<AiderResult> {
		let container: Docker.Container | null = null;
		const logs: AiderLogEntry[] = [];
		const startTime = Date.now();

		try {
			// 1. Ensure Docker image is available
			await this.ensureImage();

			// 2. Validate configuration
			this.validateConfig(config);

			// 3. Prepare container configuration
			const containerConfig = this.buildContainerConfig(config);

			// 4. Create and start container
			this.log(logs, "info", "Creating Aider Docker container...");
			container = await this.docker.createContainer(containerConfig);

			this.log(logs, "info", "Starting Aider container...");
			await container.start();

			// 5. Stream logs for progress tracking
			const logStream = await this.streamLogs(container, logs);

			// 6. Wait for completion with timeout
			const result = await this.waitForCompletion(
				container,
				config.timeout || 300000,
			);

			// 7. Extract results
			const aiderResult = await this.processResults(result, logs, config);

			this.log(
				logs,
				"info",
				`Aider execution completed in ${Date.now() - startTime}ms`,
			);
			return aiderResult;
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			this.log(logs, "error", `Aider execution failed: ${errorMessage}`);
			return {
				success: false,
				diff: "",
				logs: logs.map((l) => l.message),
				error: errorMessage,
			};
		} finally {
			// 8. Cleanup
			if (container) {
				await this.cleanup(container);
			}
		}
	}

	private async ensureImage(): Promise<void> {
		try {
			await this.docker.getImage(this.defaultImage).inspect();
		} catch (error) {
			throw new Error(
				`Aider Docker image '${this.defaultImage}' not found. Please run: docker pull ${this.defaultImage}`,
			);
		}
	}

	private validateConfig(config: AiderConfig): void {
		if (!config.model) {
			throw new Error("Model is required in Aider configuration");
		}
		if (!config.prompt) {
			throw new Error("Prompt is required in Aider configuration");
		}
		if (!config.editableFiles || config.editableFiles.length === 0) {
			throw new Error("At least one editable file is required");
		}
	}

	private buildContainerConfig(
		config: AiderConfig,
	): Docker.ContainerCreateOptions {
		const workingDir = config.workingDir || process.cwd();
		const cmd = this.buildAiderCommand(config);

		return {
			Image: this.defaultImage,
			Cmd: cmd,
			Env: this.buildEnvironmentVars(config),
			HostConfig: {
				Binds: [`${workingDir}:/app`],
				AutoRemove: this.defaultConfig.autoRemove,
				Memory: this.defaultConfig.memoryLimit,
				CpuShares: this.defaultConfig.cpuShares,
				NetworkMode: "none", // Security: no network access
			},
			WorkingDir: "/app",
			User: this.defaultConfig.user,
			AttachStdout: true,
			AttachStderr: true,
		};
	}

	private buildAiderCommand(config: AiderConfig): string[] {
		const cmd = [
			"aider",
			"--model",
			config.model,
			"--no-auto-commits",
			"--no-git",
			"--yes", // Auto-confirm prompts
			"--message",
			config.prompt,
		];

		if (config.editorModel) {
			cmd.push("--editor-model", config.editorModel);
		}

		// Add editable files
		config.editableFiles.forEach((file) => {
			cmd.push(file);
		});

		// Add read-only files
		if (config.readOnlyFiles && config.readOnlyFiles.length > 0) {
			cmd.push("--read");
			config.readOnlyFiles.forEach((file) => {
				cmd.push(file);
			});
		}

		return cmd;
	}

	private buildEnvironmentVars(config: AiderConfig): string[] {
		const env = ["PYTHONUNBUFFERED=1", "AIDER_NO_AUTO_COMMITS=1"];

		// Add API keys from environment
		if (process.env.ANTHROPIC_API_KEY) {
			env.push(`ANTHROPIC_API_KEY=${process.env.ANTHROPIC_API_KEY}`);
		}
		if (process.env.OPENAI_API_KEY) {
			env.push(`OPENAI_API_KEY=${process.env.OPENAI_API_KEY}`);
		}

		// Add custom environment variables
		if (config.environment) {
			Object.entries(config.environment).forEach(([key, value]) => {
				env.push(`${key}=${value}`);
			});
		}

		return env;
	}

	private async streamLogs(
		container: Docker.Container,
		logs: AiderLogEntry[],
	): Promise<NodeJS.ReadableStream> {
		const logStream = await container.logs({
			stdout: true,
			stderr: true,
			follow: true,
			timestamps: true,
		});

		logStream.on("data", (chunk) => {
			const message = chunk.toString().trim();
			if (message) {
				this.log(logs, "info", message, "aider");
			}
		});

		return logStream;
	}

	private async waitForCompletion(
		container: Docker.Container,
		timeout: number,
	): Promise<{ StatusCode: number }> {
		return new Promise((resolve, reject) => {
			const timer = setTimeout(() => {
				reject(new Error(`Aider execution timed out after ${timeout}ms`));
			}, timeout);

			container.wait((err, data) => {
				clearTimeout(timer);
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			});
		});
	}

	private async processResults(
		result: { StatusCode: number },
		logs: AiderLogEntry[],
		config: AiderConfig,
	): Promise<AiderResult> {
		const success = result.StatusCode === 0;

		return {
			success,
			diff: "", // TODO: Extract diff from logs or git
			logs: logs.map((l) => l.message),
			filesChanged: [], // TODO: Detect changed files
			exitCode: result.StatusCode,
			error: success
				? undefined
				: `Aider exited with code ${result.StatusCode}`,
		};
	}

	private async cleanup(container: Docker.Container): Promise<void> {
		try {
			await container.remove({ force: true });
		} catch (error) {
			// Container might already be removed due to AutoRemove
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			console.warn("Failed to remove container:", errorMessage);
		}
	}

	private log(
		logs: AiderLogEntry[],
		level: "info" | "warn" | "error" | "debug",
		message: string,
		source: "aider" | "docker" | "client" = "client",
	): void {
		logs.push({
			timestamp: new Date(),
			level,
			message,
			source,
		});
	}

	async checkDockerAvailability(): Promise<boolean> {
		try {
			await this.docker.ping();
			return true;
		} catch (error) {
			return false;
		}
	}

	async getImageInfo(): Promise<any> {
		try {
			return await this.docker.getImage(this.defaultImage).inspect();
		} catch (error) {
			return null;
		}
	}
}

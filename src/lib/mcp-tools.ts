import fs from "node:fs";
import path from "node:path";
import axios, { type AxiosError } from "axios";
import xml2js from "xml2js";

// Define parameter interfaces based on available-tools.xml
interface Context7GetLibraryDocsParams {
	context7CompatibleLibraryID: string;
	topic?: string;
	tokens?: number;
}

interface SequentialThinkingParams {
	thought: string;
	nextThoughtNeeded: boolean;
	thoughtNumber: number;
	totalThoughts: number;
	isRevision?: boolean;
	revisesThought?: number;
	branchFromThought?: number;
	branchId?: string;
	needsMoreThoughts?: boolean;
}

export class MCPTools {
	private context7Url = "http://context7_mcp:8001";
	private githubUrl = "http://github_mcp:8002";
	private sequentialThinkingUrl = "http://sequential_thinking_mcp:8003";

	constructor() {
		// Optional: Load and parse available-tools.xml for future dynamic functionality
		const refsDir = path.join(process.cwd(), ".aishell/refs");
		const xmlPath = path.join(refsDir, "available-tools.xml");
		if (fs.existsSync(xmlPath)) {
			const xmlContent = fs.readFileSync(xmlPath, "utf8");
			xml2js.parseString(xmlContent, (err, result) => {
				if (err) {
					console.error(`Failed to parse available-tools.xml: ${err.message}`);
				}
				// Parsed tools available in result.available_tools.tool if needed
			});
		}
	}

	/**
	 * Resolves a general library name into a Context7-compatible library ID.
	 * @param libraryName The name of the library to search for
	 * @returns The resolved Context7-compatible library ID
	 */
	async resolveLibraryId(libraryName: string): Promise<string> {
		try {
			const response = await axios.post(
				`${this.context7Url}/resolve-library-id`,
				{ libraryName },
			);
			return response.data;
		} catch (error) {
			this.handleError("resolveLibraryId", error);
		}
	}

	/**
	 * Fetches documentation for a library using a Context7-compatible library ID.
	 * @param params Parameters including the library ID, optional topic, and token limit
	 * @returns The fetched documentation as a string
	 */
	async getLibraryDocs(params: Context7GetLibraryDocsParams): Promise<string> {
		try {
			const response = await axios.post(
				`${this.context7Url}/get-library-docs`,
				params,
			);
			return response.data;
		} catch (error) {
			this.handleError("getLibraryDocs", error);
		}
	}

	/**
	 * Calls a specific function in the GitHub MCP service.
	 * @param functionName The name of the GitHub MCP function to call (e.g., "create_issue")
	 * @param params Parameters specific to the function being called
	 * @returns The response from the GitHub MCP service
	 */
	async callGitHubMCP(functionName: string, params: any): Promise<any> {
		try {
			const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
			if (!token) {
				throw new Error(
					"GITHUB_PERSONAL_ACCESS_TOKEN environment variable is not set",
				);
			}
			const response = await axios.post(
				`${this.githubUrl}/${functionName}`,
				params,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);
			return response.data;
		} catch (error) {
			this.handleError(`callGitHubMCP for ${functionName}`, error);
		}
	}

	/**
	 * Facilitates a step-by-step thinking process for problem-solving.
	 * @param params Parameters defining the current thought and its context
	 * @returns The result of the thinking step as a string
	 */
	async sequentialThinking(
		task: string,
		params: SequentialThinkingParams,
	): Promise<string> {
		try {
			const response = await axios.post(
				`${this.sequentialThinkingUrl}/sequential_thinking`,
				{ task, ...params },
				params,
			);
			return response.data;
		} catch (error) {
			this.handleError("sequentialThinking", error);
		}
	}

	/**
	 * Centralized error handling for HTTP requests.
	 * @param method The method where the error occurred
	 * @param error The error object
	 * @throws The original error after logging
	 */
	private handleError(method: string, error: unknown): never {
		if (axios.isAxiosError(error)) {
			const err = error as AxiosError;
			console.error(
				`HTTP error in ${method}: ${err.response?.status} - ${JSON.stringify(err.response?.data)}`,
			);
		} else {
			console.error(`Error in ${method}: ${error.message}`);
		}
		throw error;
	}
}

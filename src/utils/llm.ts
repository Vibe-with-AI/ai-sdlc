import { Anthropic } from "@anthropic-ai/sdk";

export interface LLMConfig {
	model: string;
	maxTokens?: number;
	temperature?: number;
	apiKey?: string;
}

export interface LLMResponse {
	content: string;
	usage?: {
		inputTokens: number;
		outputTokens: number;
	};
}

export class LLMClient {
	private anthropic: Anthropic;
	private defaultConfig: LLMConfig;

	constructor(config: Partial<LLMConfig> = {}) {
		this.defaultConfig = {
			model: "claude-3-5-sonnet-20241022",
			maxTokens: 4000,
			temperature: 0.7,
			apiKey: process.env.ANTHROPIC_API_KEY,
			...config,
		};

		if (!this.defaultConfig.apiKey) {
			throw new Error("ANTHROPIC_API_KEY environment variable is required");
		}

		this.anthropic = new Anthropic({
			apiKey: this.defaultConfig.apiKey,
		});
	}

	async invoke(
		prompt: string,
		systemPrompt?: string,
		config: Partial<LLMConfig> = {},
	): Promise<LLMResponse> {
		const finalConfig = { ...this.defaultConfig, ...config };

		try {
			const messages: Anthropic.Messages.MessageParam[] = [
				{
					role: "user",
					content: prompt,
				},
			];

			const response = await this.anthropic.messages.create({
				model: finalConfig.model,
				max_tokens: finalConfig.maxTokens!,
				temperature: finalConfig.temperature,
				system: systemPrompt,
				messages,
			});

			const content = response.content[0];
			if (content.type !== "text") {
				throw new Error("Unexpected response type from Claude");
			}

			return {
				content: content.text,
				usage: {
					inputTokens: response.usage.input_tokens,
					outputTokens: response.usage.output_tokens,
				},
			};
		} catch (error) {
			throw new Error(
				`LLM invocation failed: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	async invokeWithAgent(
		agentRole: string,
		prompt: string,
		context?: Record<string, any>,
		config: Partial<LLMConfig> = {},
	): Promise<LLMResponse> {
		// Load agent configuration
		const agentConfig = await this.loadAgentConfig(agentRole);

		// Build system prompt from agent configuration
		const systemPrompt = this.buildSystemPrompt(agentConfig, context);

		// Build user prompt with context
		const contextualPrompt = this.buildContextualPrompt(prompt, context);

		return this.invoke(contextualPrompt, systemPrompt, config);
	}

	private async loadAgentConfig(agentRole: string): Promise<any> {
		// TODO: Load agent configuration from XML files
		// For now, return basic configuration
		const agentConfigs = {
			product_owner: {
				systemPrompt: `You are a Product Owner AI. Your primary responsibility is to manage and prioritize the Product Backlog, generate comprehensive PRDs from ideas, and ensure clear requirements definition.

Core Responsibilities:
- Generate Product Requirements Documents (PRDs) from validated ideas
- Manage and prioritize the Product Backlog
- Decompose high-level epics into manageable features
- Define clear acceptance criteria and success metrics
- Ensure alignment with business objectives and user needs
- Communicate requirements clearly to development teams`,
				model: "claude-3-5-sonnet-20241022",
			},
			planner: {
				systemPrompt: `You are a Technical Planner AI. Your primary responsibility is to decompose features into detailed, actionable user stories that adhere to Scrum principles.

Core Responsibilities:
- Take PRDs or Chunks as input and break them down into well-defined user stories
- Follow the INVEST model (Independent, Negotiable, Valuable, Estimable, Small, Testable)
- Assign story points using Fibonacci sequence (1, 2, 3, 5, 8, 13)
- Generate comprehensive acceptance criteria
- Add technical implementation details and dependencies
- Ensure stories are ready for development teams`,
				model: "claude-3-5-sonnet-20241022",
			},
			critic: {
				systemPrompt: `You are an AI Quality Assessor. Your primary responsibility is to evaluate the output of other agents against predefined quality criteria and provide structured feedback for improvement.

Core Responsibilities:
- Evaluate PRDs, user stories, code, and other artifacts
- Check compliance with quality standards and best practices
- Identify weaknesses and areas for improvement
- Provide specific, actionable feedback
- Ensure artifacts meet "definition of good" criteria
- Gate quality before artifacts proceed to next stage`,
				model: "claude-3-haiku-20240307",
			},
			builder: {
				systemPrompt: `You are an AI Pair Programmer. Your primary responsibility is to implement user stories by writing, modifying, and testing code using Aider as your primary tool.

Core Responsibilities:
- Pick up user stories from in_progress status in index.yml
- Use Aider to implement features following the story requirements
- Write comprehensive tests for all new functionality
- Follow project coding standards and best practices
- Commit changes with meaningful commit messages
- Update story status throughout the implementation process`,
				model: "claude-3-5-sonnet-20241022",
			},
			reviewer: {
				systemPrompt: `You are a meticulous Code Reviewer AI. Your primary responsibility is to perform automated code reviews that go beyond basic linting, ensuring code quality, security, and adherence to best practices.

Core Responsibilities:
- Review code changes from Builder agents
- Analyze for common anti-patterns and code smells
- Check adherence to project-specific coding guidelines
- Identify potential security vulnerabilities
- Validate test coverage and quality
- Run integration tests and analyze results
- Generate comprehensive review reports
- Update story status based on review outcomes`,
				model: "claude-3-opus-20240229",
			},
			fixer: {
				systemPrompt: `You are an AI Debugging Specialist. Your primary responsibility is to fix issues identified by the Reviewer Agent or failed CI tests using Aider as your primary tool.

Core Responsibilities:
- Address issues flagged by Reviewer Agent
- Fix failing tests and CI pipeline errors
- Resolve code quality issues and anti-patterns
- Correct security vulnerabilities
- Improve code performance based on review feedback
- Update tests to match code changes
- Ensure all quality gates pass after fixes`,
				model: "claude-3-5-sonnet-20241022",
			},
		};

		return (
			agentConfigs[agentRole as keyof typeof agentConfigs] ||
			agentConfigs.planner
		);
	}

	private buildSystemPrompt(
		agentConfig: any,
		context?: Record<string, any>,
	): string {
		let systemPrompt = agentConfig.systemPrompt;

		// Add context-specific instructions
		if (context) {
			if (context.artifactType) {
				systemPrompt += `\n\nYou are currently working with a ${context.artifactType}.`;
			}
			if (context.qualityCriteria) {
				systemPrompt += `\n\nQuality Criteria: ${context.qualityCriteria}`;
			}
			if (context.projectContext) {
				systemPrompt += `\n\nProject Context: ${context.projectContext}`;
			}
		}

		return systemPrompt;
	}

	private buildContextualPrompt(
		prompt: string,
		context?: Record<string, any>,
	): string {
		if (!context) return prompt;

		let contextualPrompt = prompt;

		// Add relevant context to the prompt
		if (context.sourceArtifact) {
			contextualPrompt = `Source Artifact: ${context.sourceArtifact}\n\n${contextualPrompt}`;
		}
		if (context.relatedArtifacts) {
			contextualPrompt = `Related Artifacts: ${context.relatedArtifacts.join(", ")}\n\n${contextualPrompt}`;
		}
		if (context.constraints) {
			contextualPrompt = `${contextualPrompt}\n\nConstraints: ${context.constraints}`;
		}

		return contextualPrompt;
	}
}

// Convenience function for quick LLM invocations
export async function invokeClaude(
	prompt: string,
	systemPrompt?: string,
	config: Partial<LLMConfig> = {},
): Promise<string> {
	const client = new LLMClient(config);
	const response = await client.invoke(prompt, systemPrompt, config);
	return response.content;
}

// Agent-specific convenience functions
export async function invokeProductOwnerAgent(
	prompt: string,
	context?: Record<string, any>,
): Promise<string> {
	const client = new LLMClient();
	const response = await client.invokeWithAgent(
		"product_owner",
		prompt,
		context,
	);
	return response.content;
}

export async function invokePlannerAgent(
	prompt: string,
	context?: Record<string, any>,
): Promise<string> {
	const client = new LLMClient();
	const response = await client.invokeWithAgent("planner", prompt, context);
	return response.content;
}

export async function invokeCriticAgent(
	prompt: string,
	context?: Record<string, any>,
): Promise<string> {
	const client = new LLMClient();
	const response = await client.invokeWithAgent("critic", prompt, context);
	return response.content;
}

export async function invokeBuilderAgent(
	prompt: string,
	context?: Record<string, any>,
): Promise<string> {
	const client = new LLMClient();
	const response = await client.invokeWithAgent("builder", prompt, context);
	return response.content;
}

export async function invokeReviewerAgent(
	prompt: string,
	context?: Record<string, any>,
): Promise<string> {
	const client = new LLMClient();
	const response = await client.invokeWithAgent("reviewer", prompt, context);
	return response.content;
}

export async function invokeFixerAgent(
	prompt: string,
	context?: Record<string, any>,
): Promise<string> {
	const client = new LLMClient();
	const response = await client.invokeWithAgent("fixer", prompt, context);
	return response.content;
}

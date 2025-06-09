import fs from "node:fs";
import path from "node:path";
import { Args, Command, Flags } from "@oclif/core";
import * as YAML from "js-yaml";
import { v4 as uuidv4 } from "uuid";

export default class Validate extends Command {
	static description =
		"Validate a PRD or chunk using LLM-driven critique or simulated feedback.";

	static examples = [
		"<%= config.bin %> <%= command.id %> prd-abc123",
		"<%= config.bin %> <%= command.id %> chunk-def456",
		"<%= config.bin %> <%= command.id %> prd-abc123 --persona stakeholder",
	];

	static args = {
		id: Args.string({
			description: "The unique identifier of the PRD or chunk to validate",
			required: true,
		}),
	};

	static flags = {
		persona: Flags.string({
			description:
				"Stakeholder persona to use for validation (e.g., 'end-user', 'technical-lead', 'security-officer')",
			default: "general",
		}),
	};

	async run(): Promise<void> {
		const { args, flags } = await this.parse(Validate);
		const { id } = args;
		const { persona } = flags;

		try {
			// 1. Load index.yml to get artifact info
			const indexPath = path.join(process.cwd(), ".aishell", "index.yml");
			const indexData: any = fs.existsSync(indexPath)
				? YAML.load(fs.readFileSync(indexPath, "utf8")) || {}
				: {};

			if (!indexData[id]) {
				this.error(`Artifact ${id} not found in index.yml`);
			}

			const artifact = indexData[id];
			const artifactType = artifact.type;

			// 2. Load artifact content
			let artifactPath: string;
			if (artifactType === "prd") {
				artifactPath = path.join(
					process.cwd(),
					".aishell/04_backlog",
					`${id}.prd.md`,
				);
			} else if (artifactType === "chunk") {
				artifactPath = path.join(
					process.cwd(),
					".aishell/04_backlog",
					`${id}.chunk.md`,
				);
			} else {
				this.error(`Unsupported artifact type for validation: ${artifactType}`);
			}

			if (!fs.existsSync(artifactPath)) {
				this.error(`Artifact file not found: ${artifactPath}`);
			}

			const artifactContent = fs.readFileSync(artifactPath, "utf8");
			this.log(`📖 Loading ${artifactType}: ${id}`);

			// 3. Perform validation using Critic Agent
			this.log(
				`🤖 Invoking Critic Agent for validation (persona: ${persona})...`,
			);
			const validationResult = await this.validateArtifact(
				artifactContent,
				artifactType,
				persona,
				id,
			);

			// 4. Save validation report
			const validationId = `validation-${uuidv4().slice(0, 8)}`;
			const validationDir = path.join(process.cwd(), ".aishell", "validation");
			fs.mkdirSync(validationDir, { recursive: true });

			const validationPath = path.join(
				validationDir,
				`${validationId}.validation.md`,
			);
			const validationWithFrontmatter = this.addFrontmatter(
				validationResult.report,
				validationId,
				id,
				persona,
				validationResult.passed,
			);
			fs.writeFileSync(validationPath, validationWithFrontmatter);
			this.log(`📄 Validation report saved: ${validationPath}`);

			// 5. Update index.yml
			indexData[validationId] = {
				id: validationId,
				type: "validation",
				status: "completed",
				target_artifact_id: id,
				target_artifact_type: artifactType,
				persona: persona,
				passed: validationResult.passed,
				source_file: validationPath,
				created_at: new Date().toISOString(),
				owner_agent_type: "CriticAgent",
			};

			// Update original artifact status
			const newStatus = validationResult.passed
				? "validated"
				: "needs_revision";
			indexData[id].status = newStatus;
			indexData[id].updated_at = new Date().toISOString();
			indexData[id].validation_id = validationId;

			fs.writeFileSync(indexPath, YAML.dump(indexData));
			this.log("✅ Index updated successfully.");

			// 6. Display results
			this.log(
				`\n${validationResult.passed ? "✅" : "❌"} Validation ${validationResult.passed ? "PASSED" : "FAILED"}`,
			);
			this.log(`Validation ID: ${validationId}`);

			if (validationResult.passed) {
				this.log(`\n🎉 ${artifactType.toUpperCase()} validated successfully!`);
				if (artifactType === "prd") {
					this.log(`Next step: ai chunk ${id}`);
				} else if (artifactType === "chunk") {
					this.log(`Next step: ai story ${id}`);
				}
			} else {
				this.log(`\n⚠️  ${artifactType.toUpperCase()} needs revision.`);
				this.log(`Review the validation report: ${validationPath}`);
				this.log(`Address the issues and run validation again.`);
			}
		} catch (error) {
			this.error(
				`Failed to validate artifact: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	private async validateArtifact(
		content: string,
		type: string,
		persona: string,
		artifactId: string,
	): Promise<{ passed: boolean; report: string }> {
		// TODO: Implement actual LLM integration with Critic Agent
		// For now, return a structured validation report

		const prompt = `
You are a Critic Agent performing quality validation. Evaluate the following ${type} against quality standards from the perspective of a ${persona}.

ARTIFACT CONTENT:
${content}

Evaluate against these criteria:
1. Completeness - All required elements present
2. Clarity - Clear, unambiguous communication  
3. Consistency - Consistent with standards and patterns
4. Correctness - Technically and logically sound
5. Testability - Can be validated and measured
6. Feasibility - Realistic and achievable

Provide a structured report with:
- Overall assessment (PASS/FAIL)
- Strengths identified
- Issues found (categorized as Critical/Major/Minor)
- Specific recommendations for improvement
- Next steps
`;

		// Placeholder implementation - replace with actual LLM call
		const mockPassed = Math.random() > 0.3; // 70% pass rate for demo

		const report = `# Validation Report

## Summary
**Artifact:** ${artifactId} (${type})
**Persona:** ${persona}
**Status:** ${mockPassed ? "PASSED" : "FAILED"}
**Evaluated:** ${new Date().toISOString()}

## Overall Assessment
${
	mockPassed
		? "The artifact meets the quality standards and is ready to proceed to the next stage."
		: "The artifact has issues that need to be addressed before proceeding."
}

## Strengths
- Clear structure and organization
- Comprehensive coverage of requirements
- Well-defined scope and boundaries
${mockPassed ? "- All quality criteria met" : ""}

## Issues Found

### Critical Issues
${mockPassed ? "None identified." : "- Missing acceptance criteria for key features\n- Unclear dependencies between components"}

### Major Issues  
${mockPassed ? "None identified." : "- Some requirements lack measurable success metrics\n- Technical feasibility concerns not addressed"}

### Minor Issues
- Some sections could benefit from more detail
- Consider adding more specific examples

## Recommendations
${
	mockPassed
		? "- Proceed to next stage\n- Consider minor enhancements for clarity"
		: "- Address critical issues before proceeding\n- Clarify acceptance criteria\n- Add measurable success metrics\n- Review technical feasibility"
}

## Quality Criteria Assessment
- **Completeness:** ${mockPassed ? "✅ PASS" : "❌ FAIL"}
- **Clarity:** ${mockPassed ? "✅ PASS" : "⚠️ PARTIAL"}
- **Consistency:** ✅ PASS
- **Correctness:** ${mockPassed ? "✅ PASS" : "❌ FAIL"}
- **Testability:** ${mockPassed ? "✅ PASS" : "❌ FAIL"}
- **Feasibility:** ✅ PASS

## Next Steps
${
	mockPassed
		? `Ready to proceed to next stage. Consider running: ai ${type === "prd" ? "chunk" : "story"} ${artifactId}`
		: "Address the identified issues and re-run validation."
}

---
*Generated by Critic Agent*
*Persona: ${persona}*
*Validation ID: ${artifactId}*
*Generated: ${new Date().toISOString()}*
`;

		return {
			passed: mockPassed,
			report: report,
		};
	}

	private addFrontmatter(
		content: string,
		validationId: string,
		targetId: string,
		persona: string,
		passed: boolean,
	): string {
		const frontmatter = {
			id: validationId,
			type: "validation",
			status: "completed",
			target_artifact_id: targetId,
			persona: persona,
			passed: passed,
			created_at: new Date().toISOString(),
		};

		return `---
${YAML.dump(frontmatter)}---

${content}`;
	}
}

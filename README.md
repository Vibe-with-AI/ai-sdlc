# AISDLC

Turn your ideas into working code automatically using AI agents and professional development workflows.

## What is AISDLC?

**AISDLC is like having an entire development team powered by AI.** You give it an idea, and it automatically:

1. **📝 Creates a detailed plan** (Product Requirements Document)
2. **🧩 Breaks it into manageable pieces** (chunks and user stories)
3. **✅ Reviews and validates** the plan for quality
4. **💻 Writes the actual code** using AI-powered development tools
5. **🔍 Tests and reviews** the implementation

### Real-World Example

**You write:** "Build a task manager app with real-time sync"

**AISDLC automatically:**
- Creates a 5-page Product Requirements Document
- Breaks it into 3-4 development chunks
- Generates 8-12 user stories with technical details
- Writes the actual code using AI (database, API, frontend)
- Tests and validates everything works

**Result:** A working application with proper architecture, following best practices, ready for production.

## Why Use AISDLC?

### 🚀 **For Solo Developers**
- **Skip the planning overhead** - AI handles requirements, user stories, and project structure
- **Get unstuck faster** - AI writes code when you're not sure how to implement something
- **Follow best practices** - Built-in Scrum methodology and code review processes

### 👥 **For Teams**
- **Consistent planning** - Standardized PRDs and user stories across all projects
- **Faster onboarding** - New team members can understand any project through AI-generated documentation
- **Quality assurance** - Automated validation and review processes

### 🏢 **For Product Managers**
- **Rapid prototyping** - Turn ideas into working prototypes in hours, not weeks
- **Better estimates** - AI breaks down work into measurable chunks with story points
- **Clear documentation** - Every feature has detailed requirements and acceptance criteria

## How It Works

AISDLC uses **6 specialized AI agents** that work together like a real development team:

- **🎯 Product Owner**: Writes detailed requirements and acceptance criteria
- **📋 Planner**: Breaks large projects into manageable tasks
- **👨‍💻 Builder**: Writes actual code using AI-powered tools
- **🔍 Reviewer**: Checks code quality and requirements compliance
- **🛠️ Fixer**: Debugs and resolves issues automatically
- **🎭 Critic**: Validates everything meets quality standards

### The Magic: File-Based Workflow

1. **Drop an idea file** into `.aisdlc/03_ideas/IDEA-001.md`
2. **AI automatically processes it** through the entire development pipeline
3. **Get working code** in `.aisdlc/06_done/` with full documentation

No complex commands to remember - just write your idea and let AI do the rest!

## Getting Started (5 Minutes)

### Step 1: Install AISDLC

```bash
npm install -g aisdlc
```

### Step 2: Set Up Your Project

```bash
# Create a new project directory
mkdir my-ai-project
cd my-ai-project

# Initialize AISDLC
aisdlc init
```

This creates a `.aisdlc` folder with everything you need.

### Step 3: Write Your First Idea

Create a file called `.aisdlc/03_ideas/IDEA-001.md`:

```markdown
# Task Manager App

I want to build a simple task manager where users can:
- Add, edit, and delete tasks
- Mark tasks as complete
- Filter tasks by status
- Save tasks to a database

The app should have a clean web interface and work on mobile devices.
```

### Step 4: Let AI Build It

```bash
# Process your idea into a detailed plan
aisdlc idea .aisdlc/03_ideas/IDEA-001.md

# Generate a Product Requirements Document
aisdlc prd idea-001

# Break it into chunks
aisdlc chunk prd-001

# Validate the plan
aisdlc validate chunk-001

# Create user stories
aisdlc story chunk-001

# Have AI write the code
aisdlc aide story-001
```

**That's it!** AISDLC will create a working task manager app with database, API, and web interface.

### What You Get

After running the commands above, you'll have:

- **📁 Complete project structure** with proper organization
- **🗄️ Database schema** and migration files
- **🔌 REST API** with all CRUD operations
- **🎨 Web interface** with responsive design
- **✅ Tests** for all major functionality
- **📚 Documentation** explaining how everything works
- **🐳 Docker setup** for easy deployment
- **📋 Detailed requirements** and user stories for future development

**Time saved:** What normally takes weeks now takes hours.

### Key Features

- **🤖 Fully Automated**: From idea to working code without manual intervention
- **📚 Best Practices**: Follows Scrum methodology and software engineering standards
- **🔧 Production Ready**: Generates proper architecture, tests, and documentation
- **🎯 Customizable**: Modify AI agents and prompts for your specific needs
- **🐳 Containerized**: Uses Docker for consistent, isolated development environments

## Advanced Usage

### Prerequisites

- Node.js 18+ or Bun
- Docker and Docker Compose
- Git
- OpenAI or Anthropic API key (for AI agents)

### Manual Workflow Control

If you prefer step-by-step control instead of full automation:

```bash
# Initialize project structure
aisdlc init

# Start AI services (optional - for advanced features)
aisdlc start

# Process ideas manually through each stage
aisdlc idea my-idea.md        # Create idea artifact
aisdlc prd idea-001           # Generate PRD
aisdlc chunk prd-001          # Break into chunks
aisdlc validate chunk-001     # Quality validation
aisdlc story chunk-001        # Create user stories
aisdlc aide story-001         # AI implementation
```

### Project Structure

After `aisdlc init`, you'll have:

```
.aisdlc/
├── 01_agents/           # AI agent definitions (customizable)
├── 02_prompts/          # Prompt templates (customizable)
├── 03_ideas/            # 📝 Drop your ideas here
├── 04_backlog/          # 📋 Generated PRDs and chunks
├── 05_in_progress/      # 🔄 Active user stories
├── 06_done/             # ✅ Completed work
└── refs/                # 📚 Reference documentation
```

### Workflow Stages

The AI automatically processes your ideas through these stages:

1. **💡 Idea → PRD**: Transforms rough ideas into detailed Product Requirements
2. **📋 PRD → Chunks**: Breaks large requirements into manageable pieces
3. **✅ Validation**: AI reviews for completeness and feasibility
4. **📝 User Stories**: Creates actionable development tasks
5. **💻 Implementation**: AI writes the actual code
6. **🔍 Review**: Quality assurance and testing

## CLI Commands

| Command | Description |
|---------|-------------|
| `aisdlc init` | Initialize `.aisdlc` folder structure |
| `aisdlc start` | Start Docker container group |
| `aisdlc stop` | Stop Docker container group |
| `aisdlc status` | Show container status |
| `aisdlc logs` | Display service logs |
| `aisdlc vector` | Manage vector artifacts |
| `aisdlc aide <story-id>` | Work on specific user story |

## Architecture

### Workflow Process

```
Idea File → PRD Generation → Chunking → Validation → User Stories → Sprint Planning → Implementation
```

### Agent Roles

- **Planner Agent**: Transforms ideas into PRDs and user stories
- **Builder Agent**: Implements code based on user stories
- **Reviewer Agent**: Reviews code quality and requirements
- **Tester Agent**: Creates and runs tests
- **Documentation Agent**: Maintains project documentation

### MCP Servers

- **Context7**: Provides up-to-date library documentation
- **GitHub**: Handles repository operations and code management
- **Sequential Thinking**: Enables structured reasoning and planning

## Development

### Project Structure

```
aisdlc/
├── src/
│   ├── commands/          # CLI command implementations
│   ├── lib/              # Core library functions
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── test/                 # Test files
├── .aisdlc/            # Default template structure
└── docs/                # Additional documentation
```

### Building from Source

```bash
git clone https://github.com/ParkerRex/aisdlc.git
cd aisdlc
npm install
npm run build
npm link
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- --grep "idea command"

# Run tests with coverage (if configured)
npm test -- --reporter json
```

#### Test Structure

- **Unit Tests**: Test individual functions and utilities
- **Command Tests**: Test CLI commands with isolated environments
- **Integration Tests**: Test complete workflows and file operations

#### Test Files

- `test/commands/` - CLI command tests
  - `idea.test.ts` - Tests for idea submission command
  - `init.test.ts` - Tests for project initialization
  - `vector.test.ts` - Tests for artifact management
- `test/lib/` - Library and utility tests
  - `utils.test.ts` - Tests for utility functions

#### Test Configuration

- **Framework**: Mocha with Chai assertions
- **TypeScript**: Full TypeScript support with ts-node
- **Isolation**: Each test runs in isolated temporary directories
- **Cleanup**: Automatic cleanup of test artifacts
- **CI/CD**: GitHub Actions integration for automated testing

#### Writing Tests

When adding new functionality:

1. **Add unit tests** for new utility functions
2. **Add command tests** for new CLI commands
3. **Use temporary directories** for file system tests
4. **Mock external dependencies** (Docker, APIs)
5. **Test error conditions** and edge cases

Example test structure:
```typescript
describe('new command', () => {
  let testDir: string

  beforeEach(async () => {
    testDir = path.join(tmpdir(), `test-${Date.now()}`)
    await fs.ensureDir(testDir)
    process.chdir(testDir)
  })

  afterEach(async () => {
    await fs.remove(testDir)
  })

  it('should handle valid input', async () => {
    const { stdout } = await runCommand(['command', 'arg'])
    expect(stdout).to.contain('expected output')
  })
})

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## Configuration

### Customizing Agents

Edit files in `.aisdlc/01_agents/` to customize agent behavior:
- Agent personas and goals
- LLM model selection
- Tool and capability definitions

### Customizing Prompts

Modify templates in `.aisdlc/02_prompts/` to adjust:
- PRD generation logic
- User story creation
- Sprint planning algorithms

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AISDLC_DOCKER_COMPOSE` | Docker compose file path | `docker-compose.yml` |
| `AISDLC_LOG_LEVEL` | Logging level | `info` |
| `AISDLC_WATCH_INTERVAL` | File watch interval (ms) | `1000` |

## Troubleshooting

### Common Issues

**Docker containers not starting**
- Ensure Docker is running
- Check port availability (default: 3000, 8080)
- Verify Docker Compose is installed

**File watcher not detecting changes**
- Check file permissions in `.aisdlc/03_ideas/`
- Verify the directory exists after `aisdlc init`
- Check logs with `aisdlc logs`

**MCP servers not responding**
- Restart services with `aisdlc stop && aisdlc start`
- Check network connectivity
- Verify API keys and credentials

## Frequently Asked Questions

### ❓ **What kind of projects can AISDLC build?**
AISDLC works best for web applications, APIs, CLI tools, and small to medium-sized software projects. It's particularly good at CRUD applications, dashboards, and automation tools.

### ❓ **Do I need to know how to code?**
No! AISDLC is designed for anyone with software ideas. However, basic understanding of software concepts (databases, APIs, etc.) helps you write better ideas.

### ❓ **How much does it cost?**
AISDLC itself is free and open-source. You'll need an API key for AI services (OpenAI or Anthropic), which typically costs $10-50/month depending on usage.

### ❓ **How long does it take to build something?**
- **Simple apps**: 30 minutes to 2 hours
- **Medium complexity**: 2-8 hours
- **Complex projects**: 1-3 days

The AI works much faster than human developers but still needs time for quality code generation.

### ❓ **Can I customize the AI agents?**
Yes! Edit files in `.aisdlc/01_agents/` to change how AI agents behave, what they focus on, and their coding style preferences.

### ❓ **What if the AI makes mistakes?**
AISDLC includes built-in review and validation. If issues occur, the Fixer Agent automatically debugs problems. You can also manually review and edit any generated code.

### ❓ **Can I use this for commercial projects?**
Yes! AISDLC is MIT licensed. The code it generates belongs to you and can be used commercially.

### Getting Help

- 📖 Check the [documentation](./docs/)
- 🐛 Open an issue on GitHub
- 💬 Join our Discord community
- 📧 Email support for enterprise needs

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [oclif](https://oclif.io/) CLI framework
- Powered by [Aider](https://aider.chat/) for AI-assisted development
- Uses [Context7](https://context7.com/) for up-to-date documentation

# Development Guide

This guide covers setting up a development environment for AISDLC and contributing to the project.

## Development Setup

### Prerequisites

- Node.js 18+ or Bun
- Docker and Docker Compose
- Git
- TypeScript knowledge

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/ParkerRex/aisdlc.git
   cd aisdlc
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Build the project**
   ```bash
   npm run build
   # or
   bun run build
   ```

4. **Link for local testing**
   ```bash
   npm link
   # Now you can use `aishell` command globally
   ```

### Project Structure

```
aisdlc/
├── src/
│   ├── commands/          # CLI command implementations
│   │   ├── init.ts       # Initialize .aisdlc structure
│   │   ├── start.ts      # Start Docker services
│   │   ├── vector.ts     # Vector artifact management
│   │   └── aide.ts       # Story-based development
│   ├── lib/              # Core library functions
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── test/                 # Test files
├── .aisdlc/            # Default template structure
├── docs/                # Documentation
├── bin/                 # Executable scripts
└── dist/                # Compiled output
```

### Key Technologies

- **CLI Framework**: [oclif](https://oclif.io/)
- **Language**: TypeScript
- **Container Orchestration**: Docker Compose
- **AI Integration**: Aider, MCP servers
- **Package Manager**: npm/pnpm/bun

## Development Workflow

### Adding New Commands

1. Create a new file in `src/commands/`
2. Extend the `Command` base class from oclif
3. Implement the `run()` method
4. Add tests in `test/commands/`
5. Update documentation

Example command structure:
```typescript
import { Command } from '@oclif/core'

export default class MyCommand extends Command {
  static description = 'Description of the command'
  
  static examples = [
    '<%= config.bin %> <%= command.id %> --help',
  ]

  static flags = {
    // Define command flags
  }

  static args = {
    // Define command arguments
  }

  async run(): Promise<void> {
    // Command implementation
  }
}
```

### Testing

Run tests with:
```bash
npm test
# or
bun test
```

Test structure:
- Unit tests for individual functions
- Integration tests for CLI commands
- End-to-end tests for complete workflows

### Code Style

- Use TypeScript strict mode
- Follow ESLint configuration
- Use Prettier for formatting
- Write JSDoc comments for public APIs

### Debugging

1. **CLI Commands**
   ```bash
   # Debug a specific command
   node --inspect-brk ./bin/dev.js command-name
   ```

2. **Docker Services**
   ```bash
   # View container logs
   aishell logs
   
   # Debug specific container
   docker logs aishell_container_name
   ```

## Contributing

### Pull Request Process

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write code following project conventions
   - Add tests for new functionality
   - Update documentation as needed

4. **Test your changes**
   ```bash
   npm test
   npm run build
   ```

5. **Submit a pull request**
   - Provide clear description of changes
   - Reference any related issues
   - Ensure CI passes

### Commit Message Format

Use conventional commits:
```
type(scope): description

feat(cli): add new vector command
fix(docker): resolve container startup issue
docs(readme): update installation instructions
```

### Code Review Guidelines

- Code must pass all tests
- Documentation must be updated
- Breaking changes require major version bump
- Security considerations must be addressed

## Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create release tag
4. Publish to npm registry
5. Update documentation

## Getting Help

- Check existing issues on GitHub
- Join our Discord community
- Review documentation in `/docs`
- Ask questions in pull requests

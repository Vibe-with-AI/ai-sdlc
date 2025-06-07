### User Journey for `aishell`

1. **Install the CLI**  
   Users install `aishell` globally with:
   ```bash
   pnpm i aishell -g
   ```

2. **Initialize the Project**  
   Run:
   ```bash
   aishell init
   ```
   This creates the `.aishell` folder structure you specified, with agents, prompts, and directories ready to go. It’s tweakable since this is open-source—users can modify files or contribute PRs to customize it.

3. **Start the Services**  
   Run:
   ```bash
   aishell start
   ```
   This spins up a Docker container group called `aishell1`, including:
   - Aider with access to all agents.
   - Separate containers for GitHub MCP, Sequential Thinking MCP, and Context7 MCP, all communicating with each other.

4. **Drop an Idea File**  
   Users drop their idea files (e.g., `IDEA-001.md`) into `.aishell/03_ideas/`. This is the designated folder mapped for ideas—it’s intuitive and matches your structure. The system detects the new file and kicks off the Agile process automatically.

5. **Process Execution**  
   Once an idea file is dropped, the process runs sequentially:
   - **Idea to PRD**: Generates a Product Requirements Document.
   - **PRD Chunking**: Splits the PRD into chunks.
   - **Stakeholder Validation**: Validates each chunk.
   - **Backlog Refinement**: Turns validated chunks into user stories.
   - **Capacity Planning**: Estimates team capacity.
   - **Sprint Planning**: Plans the sprint.
   Users get notified after each step completes or if an error occurs (via console logs for now).

---

### Key Details

- **Where to Drop Ideas**: `.aishell/03_ideas/`  
  This folder is perfect since it’s already in your structure. A file watcher in the `aishell1` container monitors it for new files. The `0_README.md` in `03_ideas/` will instruct users to drop Markdown files here (e.g., `IDEA-001.md`) to start the process.

- **Notifications**:  
  For simplicity, notifications are logged to the console. Users can check progress with `aishell logs` or `aishell status`. We can add Slack or email notifications later if needed.

- **Customization**:  
  Since `aishell` is OSS, users can tweak `.aishell/01_agents/`, `.aishell/02_prompts/`, or even the process logic. The folder structure is fully exposed in their project directory after `aishell init`, so they can adapt it to their needs or submit PRs.

---

### Missing Prompt: `1-idea-to-prd.xml`

Here’s the prompt you’re missing for transforming an idea into a PRD. It’s structured like your other prompts and uses placeholders for dynamic content.


```xml
<prompt>
  <task>
    Transform the following idea into a concise Product Requirements Document (PRD).
  </task>
  <input>
    <idea>
      {IDEA_CONTENT}
    </idea>
  </input>
  <instructions>
    - Analyze the idea to identify core objectives, target users, and desired features.
    - Define the scope, listing in-scope features and explicitly out-of-scope items.
    - Specify technical requirements, including key libraries, APIs, and file paths (read-only: {CODEBASE_FILES}, writeable: {WRITEABLE_FILES}).
    - Structure the PRD with sections for executive summary, objectives, features, technical requirements, and success metrics.
  </instructions>
  <output_format>
    <prd>
      <title>{TITLE}</title>
      <executive_summary>{SUMMARY}</executive_summary>
      <objectives>
        <objective>{OBJECTIVE_1}</objective>
        <!-- More objectives -->
      </objectives>
      <features>
        <feature name="{FEATURE_NAME}">
          <description>{DESCRIPTION}</description>
          <!-- Other details -->
        </feature>
        <!-- More features -->
      </features>
      <technical_requirements>
        <libraries>{LIBRARIES}</libraries>
        <file_paths>
          <read_only>
            <file>{FILE_PATH}</file>
            <!-- More read-only files -->
          </read_only>
          <writeable>
            <file>{FILE_PATH}</file>
            <!-- More writeable files -->
          </writeable>
        </file_paths>
        <!-- Other technical requirements -->
      </technical_requirements>
      <success_metrics>
        <metric>{METRIC}</metric>
        <!-- More metrics -->
      </success_metrics>
    </prd>
  </output_format>
</prompt>
```


This prompt takes an idea (e.g., "Build a task manager app with real-time sync") and outputs a structured PRD, ready for the next step.

---

### CLI Commands Overview

- `aishell init`: Sets up the `.aishell` folder structure with your exact layout.
- `aishell start`: Launches the `aishell1` Docker group with all services.
- `aishell stop`: Stops the Docker group.
- `aishell status`: Shows the status of the running containers.
- `aishell logs`: Displays logs for debugging or monitoring.

---

### How It Works

1. **After `aishell init`**:  
   The `.aishell` folder is created with your structure. Users can tweak files like `1-planner.xml` or `2-prd-chunking.xml` if they want.

2. **After `aishell start`**:  
   The Docker containers boot up, and the file watcher in `aishell1` starts monitoring `.aishell/03_ideas/`.

3. **Dropping an Idea**:  
   When a user adds `IDEA-001.md` to `.aishell/03_ideas/`, the watcher triggers the process:
   - Reads the idea file.
   - Uses `1-idea-to-prd.xml` to generate a PRD (saved in `04_backlog/`).
   - Proceeds through the other steps, storing outputs in `04_backlog/`, `05_in_progress/`, and `06_done/`.
   - Logs each step’s completion or errors.

---

### Next Steps

- **Implementation**:  
  We’ll use `oclif` for the CLI, `chokidar` for the file watcher, and `docker-compose` for the container group. I can provide code snippets if you need them!

- **Documentation**:  
  Add this to `.aishell/03_ideas/0_README.md`:
  ```markdown
  # Ideas
  Drop your idea files here in Markdown format (e.g., `IDEA-001.md`) to start the Agile process.
  The system will detect new files and process them automatically.
  ```

Let me know if you want to dive into coding the CLI, the watcher, or the Docker setup next, bro! This is gonna be dope!
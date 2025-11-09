# CLI Connector Plugin

The CLI Connector plugin enables raclette developers to securely integrate existing Unix command-line tools into the raclette GUI. It is also possible to fully execute remote commands on other machines.

This expands the raclette functionality by allowing developers to not only interact with APIs but also with existing CLI tooling and use them or by developing user interfaces for them.

> ⚠️ **IMPORTANT SECURITY NOTE**
>
> Exposing command-line tools through a web interface requires careful consideration. This plugin provides the tools to do so securely. For more information see [Security Considerations](#security-considerations).

## Installation and Setup

### 1. Install the Plugin

Add the CLI Connector plugin to your raclette project:

```bash
yarn add @raclettejs/plugin-cli-connector
```

### 2. Configure the Plugin

Add the plugin to your `raclette.config.js` file in the `plugins` section:

```javascript
// raclette.config.js
export default {
  // ... other configuration options
  plugins: [
    "@raclettejs/plugin-cli-connector",
    // ... other plugins
  ],
  // ... rest of configuration
}
```

### 3. Initialize and Register Scripts

Create an initialization function to register your CLI commands, typically in your application's startup code or inside your self-written plugins index.ts file.

Adding this to the **backend** part is crucial!

Below the example within a self-written plugin context:

```typescript
import type { PluginFastifyInstance } from "@raclettejs/core"
import {
  registerScriptByConfig,
  setupFastify,
} from "@raclettejs/plugin-cli-connector"

export const initializeCliCommands = (fastify: PluginFastifyInstance) => {
  // Initialize the plugin with the Fastify instance
  setupFastify(fastify)

  // Register your CLI commands here
  try {
    registerScriptByConfig("system-info", {
      exe: "/usr/bin/uname",
      args: ["-a"],
    })

    fastify.log.info("CLI commands registered successfully")
  } catch (error) {
    fastify.log.error("Failed to register CLI commands:", error)
    throw error
  }
}
```

### 4. Call Initialization in Your App

Ensure your initialization function is called when your raclette application starts:

```typescript
// In your main application file or plugin hook
export default async function (fastify: PluginFastifyInstance) {
  // ... other initialization code

  // Initialize CLI commands
  await initializeCliCommands(fastify)

  // ... rest of your application setup
}
```

Once installed and configured, the plugin will be available at the `/plugin/raclette/plugin-cli-connector/` endpoint prefix. See [API Endpoints](#api-endpoints) for more details.

## Script Registration

Scripts are registered programmatically using import functions. This approach provides flexibility and allows for dynamic configuration with proper type safety.

### Registration Functions

#### `registerScriptByConfig(cmd: string, config: ScriptConfigInput)`

Register a script using a configuration object directly in your code.

```typescript
import { registerScriptByConfig } from "@raclettejs/plugin-cli-connector"

registerScriptByConfig("list-files", {
  exe: "/bin/ls",
  args: ["-la", { path: "/app/data" }],
  opts: {
    cwd: "/app/data",
  },
})
```

#### `registerScriptByPath(cmd: string, path: string, hooksPath?: string)`

Register a script using an external YAML or JSON configuration file. Make sure to provide an absolute path to the file(s).

```typescript
import { registerScriptByPath } from "@raclettejs/plugin-cli-connector"
import path from "path"

await registerScriptByPath(
  "git-status",
  path.join(import.meta.dirname, "./configs/git.yaml"),
  path.join(import.meta.dirname, "./hooks/git.js")
)
```

Note that the command-alias (cmd) does not get prefixed. So if you use this across several plugins, make sure they are unique. This might get updated in the future.

### Configuration Structure

```typescript
type ScriptConfigInput = {
  exe: string // Path to executable, preferrably an absolute path
  args?: ArgvInputTemplate[] // Command line arguments as template
  opts?: ScriptOptions // Process spawn options
  hooks?: IOHooks // I/O processing hooks (recommended for jobs)
}
```

### Argument Templates

Arguments can be static strings, runtime placeholders, or combinations with validation:

```typescript
args: [
  "-v", // Static argument
  {}, // Runtime placeholder (= variable)
  ["--user=", {}], // Concatenated argument (your variable will be added after the '=')
  { allow: "^[a-zA-Z0-9]+$" }, // Validated placeholder
  { path: "/app/uploads" }, // Path-restricted placeholder
]
```

### Validation Options

- **`allow`**: RegExp pattern that values must match
- **`deny`**: RegExp pattern that values must not match
- **`path`**: Base directory to restrict file operations

### Hooks for I/O Processing

Hooks transform input and output data. For long-running processes (jobs), it is recommended to include output hooks to convert Buffer objects to strings (unless explicitly wanted otherwise):

```typescript
{
  exe: "/usr/bin/command",
  hooks: {
    stdout: (chunk: Buffer | string): string => {
      return Buffer.isBuffer(chunk) ? chunk.toString('utf8') : chunk
    },
    stderr: (chunk: Buffer | string): string => {
      return Buffer.isBuffer(chunk) ? chunk.toString('utf8') : chunk
    }
  }
}
```

## API Endpoints

### Single-Run Processes: `/script/:cmd`

**Endpoint**: `POST /script/:cmd`  
**Request Body**: `{ args?: string[], input?: string }`  
**Response**: `{ stdout: string, stderr: string, status: number|string }`

For short-running programs (default timeout: 2 seconds). Executes synchronously and returns complete results.

```json
POST /plugin/raclette/plugin-cli-connector/script/list-files
{
  "args": ["/home/user"]
}
```

### Long-Running Processes: `/run/:cmd`

**Endpoint**: `POST /run/:cmd`  
**Request Body**: `{ args?: string[] }`  
**Response**: `123456` (job ID)

Starts a process and returns a job ID for interaction. Use this for commands that take longer than a few seconds.

```json
POST /plugin/raclette/plugin-cli-connector/run/backup-database
{
  "args": ["full", "production"]
}
```

**Status Codes**:

- `201`: Job created successfully
- `404`: Script not found
- `409`: Too many jobs running
- `500`: Server error

### Job Management: `/job/:id`

**Endpoint**: `POST /job/:id`  
**Request Body**: `{ input?: string, signal?: string }`  
**Response**: `{ done?: number|string, stdin: string[], stdout: string[], stderr: string[] }`

Interact with running processes and retrieve output incrementally. `stdout` and `stderr` can be transformed via hooks.

**Status Codes**:

- `200`: Process completed
- `202`: Process still running
- `400`: Invalid signal
- `404`: Job not found
- `500`: Server error

### Job Listing: `/jobs`

**Endpoint**: `GET /jobs`  
**Response**: `[{ id: string, cmd: string, argv: string[], done?: number|string }, ...]`

List all known processes. Restricted to admin users.

### Script Listing: `/scripts`

**Endpoint**: `GET /scripts`  
**Response**: `["script1", "script2", ...]`

List all registered script names.

## Configuration Examples

### Example 1: File Listing

**Configuration:**

```typescript
registerScriptByConfig("safe-ls", {
  exe: "/bin/ls",
  args: ["-la", { path: "/app/public" }],
  opts: {
    cwd: "/app/public",
  },
})
```

**Generated Command:**

```bash
# When called with args: ["documents"]
/bin/ls -la /app/public/documents
```

**API Call:**

```json
POST /script/safe-ls
{
  "args": ["documents"]
}
```

### Example 2: Git Status Check

**Configuration:**

```typescript
registerScriptByConfig("git-status", {
  exe: "/usr/bin/git",
  args: ["status", "--porcelain"],
  opts: {
    cwd: "/app/repository",
    env: {
      GIT_PAGER: "",
    },
  },
})
```

**Generated Command:**

```bash
# Always runs the same command
/usr/bin/git status --porcelain
```

**API Call:**

```json
POST /script/git-status
{}
```

### Example 3: Service Control

**Configuration:**

```typescript
registerScriptByConfig("service-control", {
  exe: "/usr/bin/systemctl",
  args: [
    { allow: "^(start|stop|restart|status)$" }, // Only allow these actions
    { allow: "^[a-zA-Z0-9_-]+$" }, // Service name validation
  ],
})
```

**Generated Commands:**

```bash
# When called with args: ["restart", "nginx"]
/usr/bin/systemctl restart nginx

# When called with args: ["status", "mysql"]
/usr/bin/systemctl status mysql
```

**API Call:**

```json
POST /script/service-control
{
  "args": ["restart", "nginx"]
}
```

### Example 4: Database Backup (Long-Running)

**Configuration:**

```typescript
registerScriptByConfig("db-backup", {
  exe: "/usr/bin/mysqldump",
  args: [
    "--single-transaction",
    "myapp",
    { allow: "^[a-zA-Z0-9_]+$" }, // Table name
  ],
  hooks: {
    stdout: (chunk: Buffer): string => chunk.toString("utf8"),
    stderr: (chunk: Buffer): string => chunk.toString("utf8"),
  },
})
```

**Generated Command:**

```bash
# When called with args: ["users"]
/usr/bin/mysqldump --single-transaction myapp users
```

**API Call:**

```json
POST /run/db-backup
{
  "args": ["users"]
}
```

### Example 5: File Operations with Concatenation

**Configuration:**

```typescript
registerScriptByConfig("chmod-files", {
  exe: "/bin/chmod",
  args: [
    ["u+", { allow: "^[rwx]+$" }], // Concatenated permission
    { path: "/app/uploads" }, // Path-restricted file
  ],
  opts: {
    cwd: "/app/uploads",
  },
})
```

**Generated Command:**

```bash
# When called with args: ["rw", "document.txt"]
/bin/chmod u+rw /app/uploads/document.txt
```

**API Call:**

```json
POST /script/chmod-files
{
  "args": ["rw", "document.txt"]
}
```

## Security Considerations

> ⚠️ **IMPORTANT SECURITY NOTE**
>
> Exposing command-line tools through a web interface requires careful consideration. This plugin provides the tools to do so securely, but administrators must:
>
> - Thoroughly understand both the system and the programs being exposed
> - Strictly limit use cases and parameters
> - Properly sanitize input and output

The CLI Connector addresses three primary security challenges:

1. **Command Shell Vulnerabilities**: Uses `argv`-based process execution instead of command shells to prevent injection attacks

2. **Command Tool Power**: Provides configuration templates to restrict command lines to safe, use-case specific subsets

3. **I/O Sanitization**: Offers a hooks API for custom input/output processing and validation

### Best Security Practices

1. **Use Principle of Least Privilege**: Only expose minimum required functionality
2. **Validate All Inputs**: Use `allow`/`deny` patterns to restrict user inputs
3. **Restrict File Access**: Use `path` validation to limit file system access
4. **Sanitize Outputs**: Remove sensitive information from command outputs
5. **Create Specific Commands**: Avoid general-purpose commands that could be misused

## User Roles

| Role | Description |
| ------------------------- | -------------------------------------------------------------------------------------- |
| **User** | Uses the raclette GUI without necessarily knowing they're accessing command-line tools |
| **User Admin** | Uses the web interface with elevated privileges to monitor and manage processes |
| **Server Admin** | Responsible for configuring which tools are exposed and how they're restricted |
| **JavaScript Programmer** | Customizes input forms and implements I/O sanitization hooks when needed |

---

## Technical Implementation Details

This section provides technical details about how the CLI Connector plugin works internally. Most users can skip this section.

### Process Execution Architecture

The plugin uses Node.js child process APIs to execute commands safely:

- **Single-run processes** (`/script/:cmd`): Uses `child_process.spawnSync` with configurable timeouts
- **Long-running processes** (`/run/:cmd`): Uses `child_process.spawn` with streaming I/O

### Script Template Processing

Script configurations undergo several processing steps during registration:

1. **Argument Template Parsing**: Static strings, placeholders, and validation rules are identified and processed
2. **RegExp Compilation**: String patterns in `allow` and `deny` validators are compiled to RegExp objects
3. **Argument Counting**: The system tracks how many runtime arguments each template expects
4. **Hook Loading**: External or inline hooks are attached to the processed configuration

### Configuration Object Structure

```typescript
interface ScriptConfig {
  exe: string
  args: ProcessedArgument[]
  argCount: number // Calculated during processing
  opts?: SpawnOptions
  hooks?: {
    stdin?: (input: string) => string
    stdout?: (output: string | Buffer) => string
    stderr?: (error: string | Buffer) => string
  }
}

type ProcessedArgument =
  | string // Static argument
  | Validator // Single placeholder with validation
  | (string | Validator)[] // Concatenated argument parts

interface Validator {
  allow?: RegExp // Compiled from string pattern
  deny?: RegExp // Compiled from string pattern
  path?: string // Base directory restriction
}
```

### Argument Resolution Process

When a request is made to execute a script:

1. **Template Retrieval**: The script configuration is looked up by command name
2. **Argument Validation**: Each user-provided argument is validated against its template rules
3. **Path Resolution**: File paths are resolved and restricted to allowed directories
4. **Command Assembly**: Static strings and validated placeholders are combined into the final command
5. **Process Execution**: The command is executed with the specified spawn options

### Hook Execution Context

For long-running processes, hooks have access to a context object:

```typescript
interface HookContext {
  stdout: string[] // Array of all previous stdout chunks
  stderr: string[] // Array of all previous stderr chunks
  stdin: string[] // Array of all previous stdin chunks
}
```

Hooks can modify this context, and changes are permanent for the duration of the process.

### Job Management System

Long-running processes are tracked in an internal job registry:

- **Job IDs**: Generated using timestamp + random suffix
- **Process Tracking**: Jobs store process handles, I/O streams, and metadata
- **Cleanup**: Completed jobs are cleaned up after a configurable timeout
- **Admin Access**: Job listing endpoint provides visibility into running processes

### Error Handling and Status Codes

The plugin uses specific HTTP status codes to communicate process states:

- `200`: Successful completion (single-run) or successful job interaction
- `202`: Process still running (job management)
- `400`: Invalid request or argument validation failure
- `404`: Script or job not found
- `500`: Process execution error or system failure

### Buffer vs String Handling

By default, process output is handled as Buffer objects. For web interfaces, string conversion is usually required:

- **Automatic Conversion**: Only occurs when hooks are present and return strings
- **Manual Conversion**: Hooks must explicitly convert Buffer to string using `toString()`
- **Encoding**: Default encoding is 'utf8', but can be configured in spawn options

This technical implementation ensures secure, efficient, and flexible command execution while maintaining clear separation between user-facing functionality and internal mechanics.

---
outline: deep
---

# CLI Connector Plugin

The CLI Connector plugin enables Raclette administrators to securely integrate existing Unix command-line tools into the Raclette GUI.

## Security Considerations

Exposing command-line tools through a web interface presents three primary security challenges:

1. **Command Shell Vulnerabilities**: Command shells are vulnerable to code injection attacks
   - Solution: We use `argv`-based process execution instead of command shells
   
2. **Command Tool Power**: Many command-line tools provide excessive capabilities that shouldn't be fully exposed
   - Solution: We provide YAML/JSON templates to restrict command lines to safe, use-case specific subsets
   
3. **I/O Sanitization**: Input and output handling can introduce vulnerabilities
   - Solution: We provide a hooks API for custom I/O processing

::: warning ⚠️ IMPORTANT
**Security Note**: Exposing command-line tools through a web interface requires careful consideration. This plugin provides the tools to do so securely, but administrators must:
- Thoroughly understand both the system and the programs being exposed
- Strictly limit use cases and parameters
- Properly sanitize input and output
:::

## User Roles

The CLI Connector plugin involves four distinct roles:

| Role | Description |
|------|-------------|
| **User** | Uses the Raclette GUI without necessarily knowing they're accessing command-line tools |
| **User Admin** | Uses the web interface with elevated privileges to monitor and manage processes |
| **Server Admin** | Responsible for configuring which tools are exposed and how they're restricted |
| **JavaScript Programmer** | Customizes input forms and implements I/O sanitization hooks when needed |

## API Endpoints

### Single-Run Processes: `/script/:cmd`

**Endpoint**: `POST /script/:cmd`  
**Request Body**: `{ args?: string[], input?: string }`  
**Response**: `{ stdout: string, stderr: string, status: number|string }`

This endpoint is designed for short-running programs (default timeout: 2 seconds). It uses the `child_process.spawnSync` Node.js API.

#### Example Request

```json
POST /plugin/raclette/scriptConnector/script/chmod_recursive
{
  "args": ["a+r", "shared"]
}
```

### Long-Running Processes: `/run/:cmd`

**Endpoint**: `POST /run/:cmd`  
**Request Body**: `{ args?: string[] }`  
**Response**: `123456`

This endpoint starts a process and returns a job ID for further interaction. It uses the `child_process.spawn` Node.js API.

### Job Management: `/job/:id`

**Endpoint**: `POST /job/:id`  
**Request Body**: `{ input?: string, signal?: string }`  
**Response**: `{ done?: number|string, stdin: string[], stdout: string[], stderr: string[] }`

This endpoint allows interaction with running processes and retrieves output incrementally.

**Status Codes**:
- `202`: Process still running
- `200`: Process completed
- `404`, `400`, `500`: Various error conditions

### Job Listing: `/jobs`

**Endpoint**: `GET /jobs`  
**Response**: `[{ id: string, cmd: string, argv: string[], done?: number|string }, ...]`

Returns a list of all known processes. Restricted to admin users.

## Script Templates

To execute a command line tool through the CLI Connector, you must define a script template in `scripts/<cmd>.yaml` or `scripts/<cmd>.json`.

### Template Components

1. **Executable (`exe`)** - *Required*
   - Path to the program or executable name to be run
   
2. **Spawn Options (`opts`)** - *Optional*
   - Control process execution environment
   - Set working directory (`cwd`), environment variables, etc.
   
3. **Command Line Arguments (`args`)** - *Usually Required*
   - Define the arguments passed to the program
   - Use placeholders `{}` for runtime values

### Argument Templates

Arguments can be defined as:

- Simple strings: `- "-R"`
- Placeholders for runtime values: `- {}`
- Concatenations with placeholders: `- ["u+", {}]`

### Restricting Arguments

To limit what values can be provided at runtime:

```yaml
args:
  - "-R"
  - ["u+", {allow: "^[rw]$"}]  # Only allows "r" or "w"
  - {path: "/app/public"}      # Restricts paths to this directory
```

Restriction options:
- `allow`: RegExp pattern to match allowed values
- `deny`: RegExp pattern to match forbidden values
- `path`: Base directory to restrict file operations

::: tip
It's better to create multiple restricted script templates rather than a single powerful one that might introduce security vulnerabilities.
:::

### Example Template

```yaml
# chmod_recursive.yaml
exe: /bin/chmod
args:
  - "-R"
  - ["u+", {allow: "^[rw]$"}]
  - {path: "/app/public"}
opts:
  cwd: /app/public
```

## Script Hooks

For custom input/output processing, you can create hook functions:

### Single-Run Hooks

For `/script/:cmd` endpoints, hooks process strings once:

```javascript
// hooks/<cmd>.js
exports.stdin = function(input) {
  // Process input before sending to program
  return transformedInput;
};

exports.stdout = function(output) {
  // Process output before returning to client
  return transformedOutput;
};

exports.stderr = function(error) {
  // Process error output before returning to client
  return transformedError;
};
```

### Long-Running Process Hooks

For `/run/:cmd` endpoints, hooks can access the full I/O history:

```javascript
// hooks/<cmd>.js
exports.stdout = function(chunk) {
  // 'this' references the I/O object with complete history
  // this.stdout, this.stderr, this.stdin
  
  // Process the new chunk
  return transformedChunk;
};
```

::: warning
Changes made to the I/O history through hooks are permanent. Deleted or modified data cannot be recovered.
:::

## Best Practices

1. **Restrict Access**: Limit what files, directories, and operations are available
2. **Sanitize I/O**: Always validate inputs and sanitize outputs
3. **Use Granular Templates**: Create specific templates for each use case
4. **Monitor Usage**: Regularly audit command execution logs
5. **Use Timeouts**: Set appropriate timeouts for different operations
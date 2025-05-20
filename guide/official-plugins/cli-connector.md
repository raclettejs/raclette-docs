# Raclette Script Connector – Securely Integrate Unix Tools into the Raclette Web Interface

The **Raclette Script Connector** is a plugin for the Raclette framework that allows site administrators to safely and efficiently integrate existing Unix command-line tools into graphical user interface (GUI) widgets.

Command-line programs often offer powerful functionality, but exposing them via the web introduces significant security challenges. This plugin provides a structured API and a template system to help mitigate these risks. It is designed for experienced Unix administrators and must always be used in narrow, clearly defined use cases.

## Security Principles

There are three main security concerns when exposing CLI tools on the web:

1. **Shell injection risks**  
   When command shells are used to launch processes, code injection can never be fully prevented.  
   **Solution**: We do not use command shells. Instead, we spawn processes directly with `argv`-based APIs.

2. **Unsafe argument exposure**  
   Even when not using a shell, many command-line tools are too powerful to be exposed freely.  
   **Solution**: We use a simple YAML or JSON-based template system to restrict arguments to safe, use-case-specific subsets.

3. **Unsafe input/output (I/O)**  
   Input or output from programs may pose further risks.  
   **Solution**: We provide an optional hooks API to sanitize I/O before or after execution.

:::warning
⚠️ Always involve an experienced Unix administrator. Every exposed function must be reviewed carefully. The broader the use case, the more likely you are to introduce security vulnerabilities.
:::

## User Roles

There are four distinct roles involved when using the Script Connector. While they can be fulfilled by the same person, they typically are not—and should not be.

1. **The End User**  
   Uses the Raclette GUI and does not need to know that command-line tools are involved.

2. **The GUI Admin**  
   Also interacts only through the web interface, but with elevated privileges. Responsible for cleaning up stalled processes when necessary.

3. **The Server Admin**  
   Decides which CLI tools can be exposed and how. This role requires in-depth knowledge of the underlying OS and the tools being used.  
   Ideally, this person is also the JavaScript programmer—or works closely with them.

4. **The JavaScript Developer**  
   Adjusts and secures the input forms and I/O handling where needed. This role is optional unless custom formatting or sanitization is required.

## Endpoint: POST /script/:cmd  
**Input**:   
```http
{ args?: string[], input?: string }
```  
**Output**:  
```http
{ stdout: string, stderr: string, status: number|string }
```

This endpoint executes a short-running command-line tool and returns its output.

- Internally uses `child_process.spawnSync` (Node.js).
- The process must complete within the browser timeout (default: 2 seconds).
- Returns `stdout`, `stderr`, and exit code or termination signal.
- Accepts optional `args` (command-line arguments) and `input` (stdin content).

## Script Templates

To define which command-line tools can be used and how, create a template in `scripts/<:cmd>.yaml` or `scripts/<:cmd>.json`:

Templates may define up to three keys:

1. **`exe` (Required)**  
   The executable to run. Can be a full path or a command resolved via the `PATH` variable.

2. **`opts` (Optional)**  
   Options passed to `spawnSync`, e.g., working directory (`cwd`), environment variables, user identity, etc.

3. **`args` (Optional but usually needed)**  
   An `argv`-style array of strings and placeholders. Use `{}` as a placeholder for values to be passed from the request payload.

### Example Template

```yaml
exe: /bin/chmod  
args:  
  - -R  
  - {}  
  - {}  
opts:  
  cwd: /app/public
```

Request:

```http
POST /plugin/pacifico/scriptConnector/script/chmod_recursive  
Content-Type: application/json  

{ "args": ["a+r", "shared"] }
```

This executes `/bin/chmod -R a+r shared` inside `/app/public`.

:::warning
⚠️ Exposing commands like `chmod` without restrictions is dangerous. Always validate input!
:::

## Argument Restrictions

There are three mechanisms to restrict placeholder input:

1. **String Concatenation**  
   Use arrays to enforce fixed prefixes:

   ```yaml
   args:  
     - -R  
     - ["u+", {}]  
     - {}
   ```

2. **Regular Expressions**  
   Use `allow` or `deny` keys to restrict placeholder values:

   ```yaml
   args:  
     - -R  
     - ["u+", { allow: "^[rw]$" }]  
     - {}
   ```

3. **Path Restriction**  
   Use `path` to restrict file access to a specific directory tree:

   ```yaml
   args:  
     - -R  
     - ["u+", { allow: "^[rw]$" }]  
     - { path: "/app/public" }
   ```

## Script Hooks

You may define a corresponding hook file that exports up to three functions: `stdin`, `stdout`, and `stderr`.  
Each function:

- Accepts a string
- Returns a string
- Is called before input is passed or after output is received

This allows for filtering, transformation, or sanitization.

## Endpoint: POST /run/:cmd  
**Input**:   
```http
{ args?: string[] }
```  
**Output**:  
```http
{ id: string }
```

Use this for **long-running** or **interactive** processes.

- Internally uses `child_process.spawn` (Node.js)
- Returns a `jobID`, which can be used to interact with the process
- Script templates are defined similarly to `/script/:cmd`, but use options for `spawn`, not `spawnSync`

## Endpoint: POST /job/:id  
**Input**:   
```http
{ input?: string; signal?: string }
```  
**Output**:  
```http
{ done?: number|string; stdin: string[]; stdout: string[]; stderr: string[] }
```

Use this endpoint to:

- Send more input
- Poll the current output
- Send Unix signals (e.g. `SIGTERM`, `SIGKILL`)

Returns incremental I/O history until the process ends. After completion (`200` or `500`), the `jobID` is no longer valid.

## Job Hooks

Job hook functions (`stdin`, `stdout`, `stderr`) work similarly to script hooks but with added context:

- `this` is bound to the full `IO` object (includes accumulated `stdin`, `stdout`, `stderr`)
- Hooks may modify or truncate history to reduce bandwidth
- Input is received as a `Buffer`, so use `.toString('utf-8')` if needed

## Endpoint: GET /jobs  
**Output**:  
```http
[{ id: string; cmd: string; argv: string[]; done?: number|string }]
```

Returns a list of all current and recently completed jobs.  
**Access restricted to admin users.**

:::tip
🛡️ Keep templates small and focused. It's safer to define multiple restricted scripts than a single powerful one.
:::

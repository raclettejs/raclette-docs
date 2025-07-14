---
outline: deep
---

# Raclette CLI

The Raclette CLI provides various commands to support local development, container management, and project scaffolding for microservice-based applications.

---

## 📦 Installation

Once Raclette is installed and configured in your project, you can run CLI commands using:

```bash
raclette <command>
```

---

## 🔧 Available Commands

### `raclette dev`

Starts the local development environment using Docker Compose or optionally runs services directly.

**Options:**

- `-d, --direct`  
  Run services directly (not in containers).
- `-q, --quiet`  
  Run Docker Compose in detached mode without following logs.
- `--filter <services>`  
  Filter logs to specific services (comma-separated). Default: `client,server`.
- `--force-rebuild`  
  Force rebuild of Docker images, even if no files changed.

**Example:**

```bash
raclette dev --filter client
```

---

### `raclette down`

Stops running Docker Compose services.

**Options:**

- `--keep-shared`  
  Stops only project-specific services, keeping shared services (like MongoDB or Redis) running.

**Example:**

```bash
raclette down --keep-shared
```

---

### `raclette restart [services...]`

Restarts one or more specific Docker services by name.

**Example:**

```bash
raclette restart client server
```

---

### `raclette update [target]`

Updates project dependencies by running internal package update scripts inside containers.

**Arguments:**

- `target`: One of `client`, `server`, or `both`.  
  Default: `both`.

**Example:**

```bash
raclette update server
```

---

### `raclette build`

Builds the Raclette project for production.

This generates a production-specific `docker-compose` file and a production `tsconfig.json`.

**Example:**

```bash
raclette build
```

---

### `raclette add-package <target> <package...>`

Adds one or more npm packages to a specific project target.

**Arguments:**

- `target`: One of `client`, `server`, or `both`.
- `package`: One or more package names to install.

**Options:**

- `--dev`  
  Install as a development dependency.
- `--no-update`  
  Skip automatic dependency update after adding the package(s).

**Examples:**

```bash
raclette add-package client lodash
raclette add-package both eslint --dev
```

---

### `raclette rebuild [services...]`

Rebuilds Docker images for specified services. If no services are passed, Raclette detects file changes and rebuilds affected services automatically.

**Example:**

```bash
raclette rebuild client
```

---

### `raclette init`

Initializes a new Raclette project (stubbed command for future scaffolding features).

**Example:**

```bash
raclette init
```

---

## 🧠 Tips

- If you add new packages, consider running `raclette update` or restarting services with `raclette restart client server` to apply changes.
- For complete rebuilds, use:
  ```bash
  raclette dev --force-rebuild
  ```

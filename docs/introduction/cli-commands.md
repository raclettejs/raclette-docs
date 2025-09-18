---
outline: deep
---

# raclette CLI

The raclette CLI provides various commands to support local development, container management, and project scaffolding for microservice-based applications.

---

## 📦 Installation

Once raclette is installed and configured in your project, you can run CLI commands using:

```bash
yarn <command>
```

---

## 🔧 Available Commands

### `yarn dev`

Starts the local development environment using Docker Compose or optionally runs services directly.

**Options:**

- `-d, --direct`  
  Run services directly (not in containers).
- `-q, --quiet`  
  Run Docker Compose in detached mode without following logs.
- `--filter <services>`  
  Filter logs to specific services (comma-separated). Default: `frontend,backend`.
- `--force-rebuild`  
  Force rebuild of Docker images, even if no files changed.

**Example:**

```bash
yarn dev --filter frontend
```

---

### `yarn down`

Stops running Docker Compose services.

**Options:**

- `--keep-shared`  
  Stops only project-specific services, keeping shared services (like MongoDB or Redis) running.

**Example:**

```bash
yarn down --keep-shared
```

---

### `yarn restart [services...]`

Restarts one or more specific Docker services by name.

**Example:**

```bash
yarn restart frontend backend
```

---

### `yarn update [target]`

Updates project dependencies by running internal package update scripts inside containers.

**Arguments:**

- `target`: One of `frontend`, `backend`, or `both`.  
  Default: `both`.

**Example:**

```bash
yarn update backend
```

---

### `yarn build`

Builds the raclette project for production.

This generates a production-specific `docker-compose` file and a production `tsconfig.json`.

**Example:**

```bash
yarn build
```

---

### `yarn add-package <target> <package...>`

Adds one or more npm packages to a specific project target.

**Arguments:**

- `target`: One of `frontend`, `backend`, or `both`.
- `package`: One or more package names to install.

**Options:**

- `--dev`  
  Install as a development dependency.
- `--no-update`  
  Skip automatic dependency update after adding the package(s).

**Examples:**

```bash
yarn add-package frontend lodash
yarn add-package both eslint --dev
```

---

### `yarn rebuild [services...]`

Rebuilds Docker images for specified services. If no services are passed, raclette detects file changes and rebuilds affected services automatically.

**Example:**

```bash
yarn rebuild frontend
```

---

### `yarn init`

Initializes a new raclette project (stubbed command for future scaffolding features).

**Example:**

```bash
yarn init
```

---

## 🧠 Tips

- If you add new packages, consider running `yarn update` or restarting services with `yarn restart frontend backend` to apply changes.
- For complete rebuilds, use:
  ```bash
  yarn dev --force-rebuild
  ```

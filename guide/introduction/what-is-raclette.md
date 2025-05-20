---
outline: deep
---

# What is Raclette?

**Raclette** is a modern, web-based fullstack development framework built to help developers create modular applications faster — with less boilerplate and more structure. It is **open source** and completely **free to use — forever**.

At its core, Raclette is all about letting you focus on the parts of software development that matter: delivering features and solving problems. It removes repetitive setup, scaffolding, and glue code, so you can jump straight into building value.

## Key Benefits

- 🔧 **UI-ready without lock-in**  
  Choose your favorite frontend framework (Vue, React, etc.) and enhance it with Raclette’s powerful orchestration layer and optional UI themes.

- 🧱 **Declarative & Modular**  
  Applications are built from reusable building blocks like **Widgets**, **Compositions**, and **InteractionLinks** — enabling rapid prototyping and production-grade apps alike.

- 🔗 **Backend included**  
  Raclette comes with a backend layer out of the box, including authentication, database integration (MongoDB), and WebSocket support — no setup required.

- 🚀 **Speed without compromise**  
  Whether you're building an internal tool, a SaaS product, or a standalone POC — Raclette gets you from zero to working UI in record time.

## Built for Real-World Use Cases

Raclette is ideal for developers who need to:

- Build **admin dashboards** and **internal tools**
- Add a UI to **existing CLI tools**
- Create **multi-app orchestration interfaces**
- Develop feature-rich **SaaS platforms**
- Quickly spin up a **proof of concept** without getting bogged down in plumbing

> If it has users, inputs, and logic — it’s Raclette time.  
> Raclette is for all the small ideas that don’t stay small.

## How It Works

Raclette consists of three main layers:

### The Core

The **Core** handles everything behind the scenes:

- Global Redux store (application state)
- Auth & session handling
- MongoDB integration
- Typed configuration and backend APIs

The Core provides all data and logic — but **renders no UI itself**.

### The Orchestrator

The **Orchestrator** connects the Core to a specific frontend framework (e.g. Vue or React). It decides **how** the UI is rendered based on the structure defined in the Core store.

The Orchestrator:

- Controls layout and widget rendering
- Connects UI logic with state
- Integrates plugin APIs and view logic

### The Admin Dashboard

A separate, pre-built web interface for non-developers to:

- Set up projects
- Create and manage views
- Configure widgets and data bindings
- Manage users, permissions, tags, and more

All changes in the Admin Dashboard are saved to the global store — so the Orchestrator can render the latest app state automatically.

## Summary

Raclette is a modern fullstack framework for teams who want to:

- Move fast with a structured dev environment
- Avoid redundant code and setup
- Stay in control of both code and configuration
- Build scalable UIs — declaratively

From CLI-based tools to multi-user web apps:  
**Raclette is your fullstack shortcut — without cutting corners.**

:::tip
🔗 Ready to dive deeper?  
Learn about the [Architecture Overview](/guide/introduction/architecture.md) and how Raclette’s core concepts work together to power your app.
:::

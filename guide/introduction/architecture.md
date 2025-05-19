# Architecture Overview

Raclette is built on a modular and declarative architecture that simplifies how modern business applications are structured, configured, and rendered. At the core of Raclette lies a powerful engine — the **Core** — which handles state management, data access, user authentication, and more, while providing full flexibility to integrate with various frontend frameworks.

This document outlines the key architectural components of a Raclette-based application and how they interact with one another.

## Admin Dashboard

Every Raclette installation includes a built-in, standalone **Admin Dashboard** — a web-based control center used to configure and manage your Raclette application without writing code.

The Admin Dashboard allows you to:

- Initialize and manage projects
- Configure UI views and layouts
- Create and assign users and permissions
- Manage tags and metadata
- Set up `InteractionLinks`, `Widgets`, and `Compositions`

Essentially, anything that doesn't require code changes can be configured here.

## Core

The **Raclette Core** is the foundation of every Raclette application. It provides:

- **Authentication** and session management
- A built-in **MongoDB-based database layer**
- A global **Redux store** — the heart of the application
- All relevant **TypeScript types** and configuration interfaces

The Core **does not render any UI itself**. Instead, it exposes all necessary data via the Redux store, such as:

- Which widgets should be displayed
- How the current UI is structured (via Compositions)
- Application-wide configuration and metadata

It’s this separation of data and rendering that makes Raclette so flexible and extensible.

## Orchestrator

The **Orchestrator** is a customizable project that sits on top of the Raclette Core. Its main job is to:

- Connect the Core to a specific UI framework (e.g., React, Vue, Svelte, Angular)
- Decide how the application UI is rendered based on the data provided by the Core
- Control the rendering logic of the frontend layer
- Handle custom behavior and project-specific logic

By separating rendering concerns into the Orchestrator, Raclette offers full flexibility and UI framework independence.

## Widgets

**Widgets** are the smallest composable units in Raclette. Each widget combines:

- A visual **UI component**
- Its **business logic** and state configuration

Widgets can range from simple buttons to complex data tables or input forms. They are fully reusable and self-contained, making it easy to manage even large, complex views.

## Compositions

A **Composition** defines the structure and content of a view. It describes:

- Which widgets are displayed
- How they are laid out on the screen
- Any logical relationships between them

Compositions are fully declarative. They act as blueprints for screens, making views easy to define, configure, and modify — without hardcoding layout logic.

## InteractionLinks

**InteractionLinks** define **how and when Compositions are triggered**. They capture user interactions and describe:

- The context of the interaction (e.g., current user, current view)
- What Composition should be shown
- Which parameters should be passed
- How the transition is handled (modal, navigation, etc.)

InteractionLinks abstract away manual wiring of events. Instead, you declare **what should happen**, and Raclette takes care of the rest.

## Global Store

At the center of everything is Raclette’s **global Redux store**. It is the single source of truth for the application state and provides:

- Visibility into active Widgets and Compositions
- Access to global configuration, metadata, and context
- Consistent and predictable state management

All parts of the system — including the Admin Dashboard, Orchestrator, and UI components — read from and write to this store.

This allows for powerful features like:

- State-driven navigation
- Dynamic rendering
- Reactive data flows

## Backend Integration

The Core includes an integrated backend layer that provides:

- **Authentication & authorization**
- **MongoDB** for structured and unstructured data storage
- **API endpoints** for data access
- A plug-and-play model for backend extension

This backend layer is fully extensible but ready to use out-of-the-box, so you can focus on building business logic rather than implementing infrastructure from scratch.

## Summary

Raclette provides a clear separation of concerns between configuration, logic, and rendering. The architecture can be visualized as:

![Architecture graphic](/graphics/architecture.jpeg)

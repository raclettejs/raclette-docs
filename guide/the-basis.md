# The Basis

Raclette is designed around a modular and declarative architecture that simplifies the way dynamic user interfaces are built, composed, and interacted with. At the heart of Raclette are a few core concepts that together enable the development of full-featured applications with minimal boilerplate and maximum flexibility.

## Widgets

**Widgets** are the fundamental building blocks in Raclette. A widget encapsulates both **UI** and its **associated business logic**, allowing for reusable, self-contained units. Widgets can represent anything from a simple button to a complex data table with editing capabilities.

## Compositions

A **Composition** defines the layout and content of a view. It acts as a declarative structure that organizes multiple widgets and specifies how they are arranged on a page. Think of it as the blueprint for a screen, combining both layout and logic into a single definition.

## InteractionLinks

**InteractionLinks** describe how users interact with Compositions. They define **how and when a Composition is triggered**, under which context, and with which parameters. An InteractionLink can be activated by clicking a menu item, pressing a keyboard shortcut, or performing any other defined action.

InteractionLinks allow your application to stay declarative — instead of manually wiring events and handlers, you describe **what should happen**, and Raclette takes care of the rest.

## Global Store

All widgets and Compositions communicate through a **global store** — the core state and configuration layer of the entire application. The store determines:

- Which widgets are displayed
- Where and how they are configured
- Which Compositions and InteractionLinks are available
- Application-wide data such as users, tags, and metadata

Raclette uses **Redux** as the underlying state management framework, providing a robust, scalable, and predictable store implementation that developers are already familiar with.

This centralized structure ensures consistency across your UI and enables powerful features like state-driven navigation and dynamic rendering.

## Backend Integration

Raclette includes a built-in **backend layer** that handles essential infrastructure out of the box — including **authentication**, data access, and more. This allows developers to focus on building application features, not on reimplementing common backend concerns.
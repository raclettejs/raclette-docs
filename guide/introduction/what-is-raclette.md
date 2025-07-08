---
outline: deep
---

# What is Raclette?

**Raclette** is a fullstack framework designed specifically for building platforms and portals. It provides the essential building blocks that every business application needs—authentication, multi-tenancy, APIs, and UI components—so you can focus on your unique business logic.

## Core Concept

Every platform application follows the same pattern:

1. Users need to log in and have different permissions
2. Data needs to be organized and accessible via APIs
3. UIs need dashboards, forms, and workflows
4. Everything needs to scale across multiple tenants/organizations

Raclette handles steps 1-4 out of the box. You handle your specific business requirements.

## Architecture

```
┌────────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ raclette Workbench │    │   Your Frontend  │    │   Mobile App    │
│   (Built-in)       │    │ (Vue/React/etc.) │    │   (Upcomgin)    │
└─────────┬──────────┘    └─────────┬────────┘    └─────────┬───────┘
          │                         │                       │
          └─────────────────────────┼───────────────────────┘
                                    │
                        ┌───────────▼──────────────┐
                        │     Raclette Core        │
                        │                          │
                        │  • Auth & Permissions    │
                        │  • Multi-tenant Data     │
                        │  • Auto-generated APIs   │
                        │  • Workflow Engine       │
                        │  • Plugin System         │
                        └────────────┬─────────────┘
                                     │
                        ┌────────────▼─────────────┐
                        │        Database          │
                        │                          │
                        └──────────────────────────┘
```

## Built For

**SaaS Applications**: Customer portals, project management, CRM systems

**Internal Tools**: Admin dashboards, workflow management, business intelligence

**Multi-tenant Platforms**: White-label solutions, marketplace platforms

**Enterprise Portals**: Supplier management, customer self-service, partner platforms

## Technical Stack

- **Backend**: Node.js with Fastify, MongoDB (currently)
- **Frontend**: Supports Vite -> Vue.JS + React.JS (coming soon)
- **Auth**: JWT with RBAC, OAuth providers & LDAP coming soon
- **Deployment**: Docker containers, cloud-ready

## Next Steps

Ready to build your platform? Start with the [Getting Started Guide](/guide/introduction/getting-started) or explore the [API Reference](/reference/raclette-config).

:::tip Development Philosophy
Raclette follows the principle: **Common patterns should be effortless, custom logic should be powerful**. We handle the infrastructure so you can focus on what makes your platform unique.
:::

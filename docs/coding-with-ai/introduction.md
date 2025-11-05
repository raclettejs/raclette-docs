# Developing Plugins with AI (Vibe Coding)

Welcome to the fun part! racletteJS is designed to be modular at scale and to make **vibe coding** with AI assistants not just possible, but actually enjoyable and maintainable. For simple use cases there is no need to be a "real developer" – if you can describe what you want and work with an AI, you can build plugins.

## Why racletteJS Supports Vibe Coding

Here's the secret sauce: racletteJS plugins use straightforward TypeScript and Vue. No weird abstractions, no complex build chains to explain to your AI. The boilerplate handles all the gnarly stuff (frontend/backend communication, core integration), so your AI can focus on what you're actually trying to build.

<details>
  <summary>Read more and get the Boilerplate here</summary>

<div class="included-article">

        <!--@include: ../official-plugins/boilerplate.md -->


</div>
</details>

## Your AI's Best Friend: Context7

We've made our entire documentation available through Context7, which means your AI assistant can learn everything about racletteJS in seconds.

**Here's how to supercharge your AI:**

1. Visit [https://context7.com/gitlab_raclettejs/docs](https://context7.com/gitlab_raclettejs/docs)
2. Copy this URL and paste it into your AI chat
3. Tell your AI: "Reference this Context7 documentation to help me build a racletteJS plugin"

Now your AI knows the framework inside-out. Pretty neat, right?

## Starting with the Plugin Blueprint

We provide a plugin blueprint that gives you a running start. Think of it as a pre-built skeleton that already handles all the boring core integration stuff.

**Get the blueprint here:**  
[https://gitlab.com/raclettejs/pluginexamples/-/tree/main/plugins/raclette\_\_boilerplate](https://gitlab.com/raclettejs/pluginexamples/-/tree/main/plugins/raclette__boilerplate?ref_type=heads)

When working with your AI, share this blueprint and explain what you want to build. The AI will understand the structure and help you fill in your custom logic.

## The Golden Rule: Keep It in the Widget

Here's the one architectural thing you need to know:

**Your `*Widget.vue` file is the bridge between your plugin and racletteJS core.**

This file is special – it's where all the core-tied behavior lives. Everything else? Totally up to you!

### What This Means in Practice

```
my-plugin/
├── raclette.plugin.ts # Main plugin configuration
├── frontend/ # Frontend-side code (if frontendDir specified)
│ ├── [...] # See plugin metadata for more
│ ├── composables  ← Organize these however you want
│ ├── components  ← Organize these however you want
│ └── widgets/ # Plugin widgets
│     └── FOLDERNAME/ # Your custom Widget folder name (optional)
│         ├── NameWidget.vue # The widget File. Needs to follow this structure "[CustomName]Widget.vue"
│         └── setup.ts # Contains details and config for the widget
└── backend/ # Server-side code (if backendDir specified)
    └── [...] # See plugin metadata for more
```

**Your `*Widget.vue` should:**

- Handle all communication with the racletteJS core using the provided `pluginAPI`
- Pass data down to your child components via props or models
- Keep your business logic separate from your UI components (makes life easier later!)

**Your child components can:**

- Be organized any way you like
- Use any naming conventions you prefer
- Have whatever structure makes sense for your use case

The blueprint gives you a working `*Widget.vue` – your AI can help you customize it for your needs while keeping that core connection intact.

## Pro Tips for Vibe Coding Plugins

### 1. Be Specific About Data Flow

Tell your AI: "I need the Widget to fetch data from the backend and pass it to MyComponent as a prop called `items`"

### 2. Separate Concerns

Good vibes: Keep core logic in `*Widget.vue`, UI logic in child components  
Bad vibes: Mixing everything together (you'll thank yourself later)

### 3. Use Props and Models Wisely

- **Props**: For passing data down to child components
- **Models**: For two-way data binding when needed
- **Recommendation**: Pass everything your component needs from the Widget, don't make child components talk to the core directly

### 4. Let the Boilerplate Do Its Thing

The boilerplate handles:

- Frontend ↔ Backend communication
- Core integration and lifecycle
- All the plumbing you don't want to think about

You focus on: Your actual feature!

## Example AI Prompt

Here's a sample prompt to get you started:

```
I want to build a racletteJS plugin that [describes your feature].

I'm using the plugin boilerplate from
https://gitlab.com/raclettejs/pluginexamples/-/tree/main/plugins/raclette__boilerplate

Please reference the racletteJS documentation at
https://context7.com/gitlab_raclettejs/docs

Help me modify the Widget file to handle the core logic, and create
child components for the UI. Make sure data flows from the Widget down
to children via props.
```

## Need Help?

Remember: the beauty of vibe coding is iteration. Don't expect perfection on the first try. Work with your AI, test things out, and refine. racletteJS's straightforward structure means fixes are usually simple.

Happy vibing! 🧀✨

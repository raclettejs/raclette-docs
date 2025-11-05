# Developing Plugins with AI (Vibe Coding)

Welcome to the fun part! racletteJS is designed to be modular at scale and to make **vibe coding** with AI assistants not just possible, but actually enjoyable and maintainable. For simple use cases there is no need to be a "real developer" – if you can describe what you want and work with an AI, you can build plugins.

## Why racletteJS Supports Vibe Coding

Here's the secret sauce: racletteJS plugins use straightforward TypeScript and Vue. No weird abstractions, no complex build chains to explain to your AI. The boilerplate handles all the gnarly stuff (frontend/backend communication, core integration), so your AI can focus on what you're actually trying to build.

<details>
  <summary>Read more and get the Boilerplate here</summary>

<div class="included-article">

        <!-- keep me -->

## Understanding the Plugin Boilerplate

### Getting the Plugin Boilerplate

Visit [Our example repository](https://gitlab.com/raclettejs/pluginexamples/-/tree/main/plugins/raclette__boilerplate?ref_type=heads)
Either clone the whole repository or only copy the `raclette__boilerplate`. Copy the boilerplate into the plugins directory of your own app you have created via `create raclette-app` or use the repository with it's todo Plugin as is!

The racletteJS plugin boilerplate is your best friend when starting a new plugin. It's a temporary solution (full code generation is coming!) that gives you a working plugin structure right out of the box.

### What the Boilerplate Provides

The boilerplate handles all the heavy lifting:

- **Frontend ↔ Backend Communication**: Already wired up and ready to go
- **Core Integration**: Your plugin already knows how to talk to racletteJS
- **Lifecycle Management**: Loading, mounting, unmounting – all handled
- **Plugin API Access**: Everything you need to interact with the framework

### The Key File: `*Widget.vue`

This is where the magic happens. The boilerplate includes a `*Widget.vue` file (where `*` is your widget name) that serves as the **single point of contact** between your widget's businesslogic and the racletteJS core.

**Think of it like this:**

```
racletteJS Core
      ↕️ (talks via pluginAPI)
YourPluginWidget.vue ← The bridge
      ↕️ (your choice: props, models, events)
Your Components ← Total freedom here!
```

### What You Can Customize

**Everything below the Widget level!**

Once the Widget receives or sends data to the core, you're in your own territory:

- **File structure**: Organize components however you like
- **Naming conventions**: Use whatever makes sense to you
- **Component architecture**: Build it your way
- **Styling approach**: Your choice entirely

The only requirement: Keep the `*Widget.vue` as your core communication hub.

### Why This Separation Matters

By keeping core logic in the Widget and UI logic in child components, you get:

- **Easier testing**: Test UI without worrying about core integration
- **Simpler migrations**: When we release full code generation, your UI components stay the same
- **Better organization**: Clear boundary between "framework stuff" and "my stuff"
- **AI-friendly**: Your AI can work on components without worrying about breaking core integration

### Working with the Boilerplate

1. **Clone/copy the boilerplate** from the repository
2. **Rename the Widget file** to match your plugin name
3. **Customize the Widget** to handle your core logic (AI can help!)
4. **Build your components** below the Widget (total creative freedom!)
5. **Pass data down** from Widget to components via props/models

The boilerplate's `*Widget.vue` already has all the imports and structure you need – you just fill in your specific logic.

### Remember

- The Widget is your **last point** of core-tied behavior
- Everything inside the Widget (imports, pluginAPI usage) follows framework conventions
- Everything outside the Widget is your playground
- Data should flow: Core → Widget → Your Components

This design makes vibe coding with AI super smooth – you and your AI can focus on building features, not fighting with framework integration! 🎨

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
│ ├── composables ← Organize these however you want
│ ├── components ← Organize these however you want
│ └── widgets/ # Plugin widgets
│ └── FOLDERNAME/ # Your custom Widget folder name (optional)
│ ├── NameWidget.vue # The widget File. Needs to follow this structure "[CustomName]Widget.vue"
│ └── setup.ts # Contains details and config for the widget
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

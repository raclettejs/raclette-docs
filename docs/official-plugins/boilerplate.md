
# Understanding the Plugin Boilerplate

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
      ↕️  (talks via pluginAPI)
YourPluginWidget.vue  ← The bridge
      ↕️  (your choice: props, models, events)
Your Components  ← Total freedom here!
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

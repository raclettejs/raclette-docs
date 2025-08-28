# Plugin Widgets

Plugins in raclette can define **widgets** — modular, reusable components that can be placed freely within the application UI. These widgets are typically used within compositions and can be dynamically configured through the admin interface.

## Widget Declaration

Widgets are registered based on their location and Foldername. Additional configuration can be provided inside each plugin’s frontend optional entry point: `plugins/[companyName__pluginName]/frontend/index.ts`

A widget should be organized in the following folderstructure:

```
my-plugin/
├── raclette.plugin.ts            # Main plugin configuration
├── frontend/                       # Frontend-side code (if frontendDir specified)
│   ├── [...]                     # See plugin metadata for more
│   └── widgets/                  # Plugin widgets
│       └── FOLDERNAME/           # Your custom Widget folder name (optional)
│           └── NameWidget.vue    # The widget File. Needs to follow this structure "[CustomName]Widget.vue"
│           └── setup.ts          # Contains details and config for the widget
└── backend/                       # Server-side code (if backendDir specified)
    └── [...]                     # See plugin metadata for more

```

An example `setup.ts` would look like this:

### Example

Here is a generic example of how a widget can be described and configured in a plugin:

```TypeScript
// plugins/examplePlugin/frontend/widgets/example/setup.ts
import type { WidgetDeclaration } from "@raclettejs/core"
import type { PropType } from "vue"

export const details = {
  title: "Chart Widget",
  color: "#51E064",
  icon: new URL("./icon.svg", import.meta.url).href,
  images: [new URL("./screenshot.png", import.meta.url).href],
  description: "Widget with charts",
} satisfies WidgetDeclaration

export const config = {
  currentChart: {
    type: String as PropType<(typeof ["default", "other"])[number]>,
    default: "default",
    editor: {
      inputType: "select",
      selectionValues: ["default", "other"],
    },
  },
  chartSelect: {
    type: Boolean,
    default: false,
    editor: {
      inputType: "checkbox",
    },
  },
}

export default {
  config,
  details,
}

```

## Type Declarations

::: details Show Type Declarations

```TypeScript
type WidgetConf = {
  [key: string]: {
    type: VuePropType
    default: string | number | boolean | Function
    editor: EditorSettings
  }
}

type WidgetDeclaration = {
  title: string
  color: string
  icon: string
  images: string[]
  description: string
}

type EditorInputTypes =
  | "text"
  | "number"
  | "checkbox"
  | "switch"
  | "multiselect"

type EditorSettings = {
  inputType: EditorInputTypes
  min?: number
  max?: number
  step?: number
  selectionValues?: string[]
}

type VuePropType =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | ArrayConstructor
  | ObjectConstructor
  | Function
```

:::

# Plugin Widgets

Plugins in Raclette can define **widgets** — modular, reusable components that can be placed freely within the application UI. These widgets are typically used within compositions and can be dynamically configured through the admin interface.

## Widget Declaration

Widgets are registered inside each plugin’s client entry point: `plugins/[plugin-name]/client/index.ts`

A widget consists of three key parts:

- `details`: Metadata that describes the widget and enables integration with the drag & drop editor UI. Follows the `WidgetDeclaration` type.
- `config`: A definition of configurable properties that are exposed to the user as editable inputs. Follows the `WidgetConf` type.
- `component`: The actual Vue component that will be rendered in the application.

### Example

Here is a generic example of how a widget can be declared in a plugin:

```TypeScript
// plugins/examplePlugin/client/index.ts
import ExampleWidgetInfo from "./widgets/example/setup"
import ExampleWidgetComponent from "./widgets/example/ExampleWidget.vue"

const widgets = {
  exampleWidget: {
    details: ExampleWidgetInfo.details,
    config: ExampleWidgetInfo.config,
    component: ExampleWidgetComponent,
  },
}
```

```TypeScript
// plugins/examplePlugin/client/widgets/example/setup.ts

import {
  WidgetConf,
  WidgetDeclaration,
} from "@raclettejs/raclette-core/orchestrator/composables/useWidgets"

export const details = {
  pluginName: "examplePlugin",
  company: "exampleCorp",
  title: "Example Widget",
  color: "#42A5F5",
  icon: new URL("./icon.svg", import.meta.url).href,
  images: [new URL("./screenshot.png", import.meta.url).href],
  description:
    "This widget provides a simple example of how to configure and register a visual component within a Raclette plugin. You can customize its appearance and behavior via the widget editor.",
  widgetName: "exampleWidget",
} satisfies WidgetDeclaration

export const config = {
  text: {
    type: String,
    default: "Hello world",
    editor: {
      inputType: "text",
    },
  },
} satisfies WidgetConf

export default {
  config,
  details,
}
```

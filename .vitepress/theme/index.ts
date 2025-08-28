import DefaultTheme from "vitepress/theme"
import ThemeImage from "./components/ThemeImage.vue"
import "./styles.css"

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("ThemeImage", ThemeImage)
  },
}

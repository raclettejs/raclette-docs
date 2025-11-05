import { Plugin } from "vite"
import { RecipeDocsPluginOptions, ProcessingContext } from "./types"
import { RecipeDocsError } from "./utils"
import { extractFrontmatter } from "./frontmatter"
import { processIncludes } from "./includes"
import { interpolateVariables } from "./interpolation"
import { CompiledDocsExporter } from "./export"

/**
 * Recipe Docs Plugin for VitePress
 *
 * Processes markdown files with:
 * - Frontmatter variable inheritance
 * - Recursive includes with variable overrides
 * - YAML-style inline variable definitions
 * - Build-time validation
 * - Optional export of compiled markdown files
 *
 * @example
 * ```typescript
 * // vitepress config
 * export default defineConfig({
 *   vite: {
 *     plugins: [
 *       recipeDocsPlugin({
 *         exportCompiled: true,
 *         exportPath: './compiled-docs',
 *         exportExclude: ['index.md', 'README.md', 'LICENSE.md', '*.draft.md']
 *       })
 *     ],
 *   },
 * })
 * ```
 *
 * @example
 * ```typescript
 * // Using a custom filter function
 * recipeDocsPlugin({
 *   exportCompiled: true,
 *   exportExclude: (filePath) => {
 *     return filePath.includes('drafts') || filePath.endsWith('index.md')
 *   }
 * })
 * ```
 *
 * @example
 * ```markdown
 * ---
 * VARIABLE: value
 * MULTILINE: |
 *   Line 1
 *   Line 2
 * ---
 *
 * <!--@include: ./snippet.md
 * OVERRIDE: new value
 * -->
 *
 * Content with {{$frontmatter.VARIABLE}}
 * ```
 * CUstom Filter for files
 * recipeDocsPlugin({
  exportCompiled: true,
  exportExclude: (filePath) => {
    // Exclude by path
    if (filePath.includes('drafts') || filePath.includes('.vitepress')) {
      return true
    }
    
    // Exclude by filename
    const fileName = filePath.split(/[/\\]/).pop() || ''
    if (fileName === 'index.md' || fileName.startsWith('_')) {
      return true
    }
    
    return false
  }
})
 */
export function recipeDocsPlugin(
  options: RecipeDocsPluginOptions = {}
): Plugin {
  const {
    exportCompiled = false,
    exportPath = "./compiled-docs",
    exportExclude,
  } = options

  let exporter: CompiledDocsExporter | null = null

  return {
    name: "recipe-docs",
    enforce: "pre",

    buildStart() {
      if (exportCompiled) {
        exporter = new CompiledDocsExporter(exportPath, exportExclude)
        this.info(
          `📝 Recipe Docs: Exporting compiled markdown to ${exportPath}`
        )
      }
    },

    transform(code: string, id: string) {
      if (!id.endsWith(".md")) {
        return null
      }

      try {
        const processedContent = processMarkdownFile(id, code)

        // Export compiled version if enabled
        if (exportCompiled && exporter) {
          exporter.exportFile(id, processedContent)
        }

        return {
          code: processedContent,
          map: null,
        }
      } catch (error) {
        if (error instanceof RecipeDocsError) {
          this.error(error)
        }
        throw error
      }
    },

    buildEnd() {
      if (exportCompiled && exporter) {
        const stats = exporter.getStats()
        this.info(
          `✅ Recipe Docs: Exported ${stats.totalFiles} compiled markdown files to ${stats.exportPath}`
        )
      }
    },
  }

  function processMarkdownFile(filePath: string, content: string): string {
    const { frontmatter, body } = extractFrontmatter(content)

    const context: ProcessingContext = {
      filePath,
      includeChain: [filePath],
      variables: frontmatter,
    }

    const processedBody = processIncludes(body, context)
    const finalContent = interpolateVariables(processedBody, context)

    return finalContent
  }
}

export default recipeDocsPlugin
export * from "./types"

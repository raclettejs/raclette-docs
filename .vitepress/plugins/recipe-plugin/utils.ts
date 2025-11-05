export class RecipeDocsError extends Error {
  constructor(message: string, public filePath?: string) {
    super(message)
    this.name = "RecipeDocsError"
  }
}

export function stripVitePressComponents(content: string): string {
  // Remove VitePress-specific components and directives
  let result = content

  // Remove <script setup> blocks
  result = result.replace(/<script\s+setup[\s\S]*?<\/script>/gi, "")

  // Remove <style> blocks
  result = result.replace(/<style[\s\S]*?<\/style>/gi, "")

  // Extract alt text from Vue components before removing them
  // Match both alt="..." and :alt="..."
  result = result.replace(
    /<([A-Z]\w+)[^>]*(?::?alt=["']([^"']+)["'])[^>]*(?:\/>|>[\s\S]*?<\/\1>)/g,
    (match, componentName, altText) => {
      return altText ? `![${altText}](${componentName})` : ""
    }
  )

  // Remove remaining Vue components (without alt text)
  result = result.replace(/<[A-Z]\w+[^>]*>[\s\S]*?<\/[A-Z]\w+>/g, "")
  result = result.replace(/<[A-Z]\w+[^>]*\/>/g, "")

  return result
}

export function cleanupExtraWhitespace(content: string): string {
  // Remove excessive blank lines (more than 2 consecutive)
  return content.replace(/\n{3,}/g, "\n\n").trim() + "\n"
}

export function shouldExcludeFile(
  filePath: string,
  exclude?: string[] | ((filePath: string) => boolean)
): boolean {
  if (!exclude) return false

  // If it's a function, use it directly
  if (typeof exclude === "function") {
    return exclude(filePath)
  }

  // If it's an array, check patterns
  const fileName = filePath.split(/[/\\]/).pop() || ""
  const normalizedPath = filePath.replace(/\\/g, "/")

  return exclude.some((pattern) => {
    // Exact filename match
    if (pattern === fileName) return true

    // Simple glob-like patterns
    if (pattern.includes("*")) {
      const regex = new RegExp(
        "^" + pattern.replace(/\*/g, ".*").replace(/\?/g, ".")
      )
      return regex.test(fileName) || regex.test(normalizedPath)
    }

    // Path contains pattern
    return normalizedPath.includes(pattern)
  })
}

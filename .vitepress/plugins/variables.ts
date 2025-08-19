// plugins/variables.ts
import type { MarkdownRenderer } from "vitepress"
import fs from "fs"
import path from "path"

interface Variables {
  [key: string]: any
}

interface ProcessContext {
  variables: Variables
  filePath: string
  rootDir: string
}

// Parse variables from a variables code block
function parseVariablesBlock(content: string): Variables {
  const variables: Variables = {}
  const lines = content.trim().split("\n")

  let i = 0
  while (i < lines.length) {
    const line = lines[i].trim()

    // Skip empty lines and comments
    if (!line || line.startsWith("//") || line.startsWith("#")) {
      i++
      continue
    }

    // Match: VARIABLE_NAME = value (start of assignment)
    const match = line.match(/^(\w+)\s*=\s*(.*)$/)
    if (match) {
      const key = match[1]
      let value = match[2]

      // Check if this might be a multiline value
      // Indicators: starts with ( or { or [ or has unmatched brackets/parens
      if (isStartOfMultilineValue(value)) {
        // Collect lines until we have a complete value
        const multilineResult = collectMultilineValue(lines, i)
        value = multilineResult.value
        i = multilineResult.nextIndex
      } else {
        i++
      }

      // Try to parse the complete value
      try {
        variables[key] = JSON.parse(value)
      } catch {
        // For non-JSON values, check if it's a function or keep as string
        if (value.trim().startsWith("(") && value.includes("=>")) {
          // Likely a function, keep as string but clean up
          variables[key] = value.trim()
        } else {
          // Remove quotes if it's a simple string
          const cleanValue = value.replace(/^["']|["']$/g, "")
          variables[key] = cleanValue
        }
      }
    } else {
      i++
    }
  }

  return variables
}

// Check if a value might be multiline
function isStartOfMultilineValue(value: string): boolean {
  const trimmed = value.trim()

  // Empty value followed by content on next lines
  if (!trimmed) return true

  // Starts with opening bracket/paren but doesn't close on same line
  if (trimmed.startsWith("(") && !hasMatchingClosing(trimmed, "(", ")"))
    return true
  if (trimmed.startsWith("{") && !hasMatchingClosing(trimmed, "{", "}"))
    return true
  if (trimmed.startsWith("[") && !hasMatchingClosing(trimmed, "[", "]"))
    return true

  return false
}

// Check if brackets/parens are properly closed
function hasMatchingClosing(str: string, open: string, close: string): boolean {
  let count = 0
  for (const char of str) {
    if (char === open) count++
    if (char === close) count--
  }
  return count === 0
}

// Collect lines until we have a complete multiline value
function collectMultilineValue(
  lines: string[],
  startIndex: number
): { value: string; nextIndex: number } {
  const firstLine = lines[startIndex]
  const match = firstLine.match(/^(\w+)\s*=\s*(.*)$/)
  let value = match ? match[2] : ""

  let i = startIndex + 1
  let openCount = 0
  let hasOpenBracket = false

  // Count initial open brackets/parens
  for (const char of value) {
    if (char === "(" || char === "{" || char === "[") {
      openCount++
      hasOpenBracket = true
    }
    if (char === ")" || char === "}" || char === "]") {
      openCount--
    }
  }

  // If no brackets and value is empty, collect until next variable or end
  if (!hasOpenBracket && !value.trim()) {
    while (i < lines.length) {
      const line = lines[i].trim()

      // Stop if we hit another variable definition
      if (line.match(/^\w+\s*=/)) {
        break
      }

      // Stop if we hit a comment or empty line followed by a variable
      if (line.startsWith("//") || line.startsWith("#")) {
        // Check if next non-comment line is a variable
        let j = i + 1
        while (
          j < lines.length &&
          (lines[j].trim() === "" ||
            lines[j].trim().startsWith("//") ||
            lines[j].trim().startsWith("#"))
        ) {
          j++
        }
        if (j < lines.length && lines[j].trim().match(/^\w+\s*=/)) {
          break
        }
      }

      value += "\n" + lines[i]
      i++
    }
  } else {
    // Collect lines until brackets are balanced
    while (i < lines.length && openCount > 0) {
      const line = lines[i]
      value += "\n" + line

      // Count brackets in this line
      for (const char of line) {
        if (char === "(" || char === "{" || char === "[") {
          openCount++
        }
        if (char === ")" || char === "}" || char === "]") {
          openCount--
        }
      }

      i++
    }
  }

  return { value: value.trim(), nextIndex: i }
}

// Render variables as a nice display
function renderVariablesDisplay(variables: Variables): string {
  const rows = Object.entries(variables)
    .map(([key, value]) => {
      const displayValue =
        typeof value === "string"
          ? `"${value}"`
          : JSON.stringify(value, null, 2)
      return `| ${key} | \`${displayValue}\` |`
    })
    .join("\n")

  return `
<!-- VARIABLES_TABLE_START -->
| Variable | Value |
|----------|-------|
${rows}
<!-- VARIABLES_TABLE_END -->
`
}

// Substitute variables in code blocks AND regular text (but protect variable display table)
function substituteVariables(content: string, variables: Variables): string {
  let processedContent = content

  // First, handle fallback syntax: ${VARIABLE_NAME:fallback_value}
  processedContent = processedContent.replace(
    /\$\{(\w+):([^}]+)\}/g,
    (match, varName, fallback) => {
      if (variables.hasOwnProperty(varName)) {
        const value = variables[varName]
        return typeof value === "string" ? value : JSON.stringify(value)
      }

      // For fallback values, preserve quotes if they exist
      // Don't try to parse as JSON - keep the fallback exactly as written
      return fallback
    }
  )

  // Then handle regular variable substitution for defined variables
  // Split content to avoid replacing in variable tables
  const parts = processedContent.split(
    /(<!-- VARIABLES_TABLE_START -->[\s\S]*?<!-- VARIABLES_TABLE_END -->)/g
  )

  for (const [key, value] of Object.entries(variables)) {
    const displayValue =
      typeof value === "string" ? value : JSON.stringify(value)

    for (let i = 0; i < parts.length; i += 2) {
      // Only process non-table parts (even indices)
      // Use word boundary but avoid replacing variables that are part of fallback syntax
      parts[i] = parts[i].replace(
        new RegExp(`(?<!\\$\\{[^}]*?)\\b${key}\\b(?![^}]*?\\})`, "g"),
        displayValue
      )
    }
  }

  processedContent = parts.join("")
  return processedContent
}

// Parse inline variable overrides from include statement
function parseInlineVariables(overrideStr: string): Variables {
  const variables: Variables = {}

  try {
    // Remove outer braces and parse as JSON-like object
    const cleaned = overrideStr.trim().replace(/^\{|\}$/g, "")

    // Split by commas but respect nested objects/arrays
    const pairs = cleaned.split(",").map((pair) => pair.trim())

    for (const pair of pairs) {
      const colonIndex = pair.indexOf(":")
      if (colonIndex === -1) continue

      const key = pair.substring(0, colonIndex).trim().replace(/['"]/g, "")
      const value = pair.substring(colonIndex + 1).trim()

      try {
        // Try to parse as JSON
        variables[key] = JSON.parse(value)
      } catch {
        // Fallback to string, removing quotes
        variables[key] = value.replace(/^["']|["']$/g, "")
      }
    }
  } catch (error) {
    console.warn("Failed to parse inline variables:", overrideStr, error)
  }

  return variables
}

// Process @include statements
function processIncludes(content: string, context: ProcessContext): string {
  return content.replace(
    /@include:\s*([^{]+)(\{[^}]+\})?/g,
    (match, includePath, overrides) => {
      try {
        const fullPath = path.resolve(
          path.dirname(context.filePath),
          includePath.trim()
        )

        if (!fs.existsSync(fullPath)) {
          console.warn(`Include file not found: ${fullPath}`)
          return `<!-- Include file not found: ${includePath} -->`
        }

        const includeContent = fs.readFileSync(fullPath, "utf-8")

        // Parse inline variable overrides if provided
        let includeVariables = { ...context.variables }
        if (overrides) {
          const inlineVars = parseInlineVariables(overrides)
          includeVariables = { ...includeVariables, ...inlineVars }
        }

        // Process the included content with merged variables
        return processMarkdownContent(includeContent, {
          variables: includeVariables,
          filePath: fullPath,
          rootDir: context.rootDir,
        })
      } catch (error) {
        console.error(`Error processing include ${includePath}:`, error)
        return `<!-- Error processing include: ${includePath} -->`
      }
    }
  )
}

// Main content processing function
function processMarkdownContent(
  content: string,
  context: ProcessContext
): string {
  let processedContent = content
  let currentVariables = { ...context.variables }

  // Process content in order: variables blocks, includes, then substitution
  // This ensures proper scoping where variables only affect content after their definition

  const parts: Array<{
    type: "text" | "variables" | "include"
    content: string
    variables?: Variables
  }> = []
  let lastIndex = 0

  // First, find all variables blocks and includes in order
  const variablesRegex = /```variables\n([\s\S]*?)\n```/g
  const includeRegex = /<!--\s*@include:\s*([^{]+?)(\{[^}]+\})?\s*-->/g

  let match
  const allMatches: Array<{
    type: "variables" | "include"
    match: RegExpExecArray
    index: number
  }> = []

  // Collect all variables blocks
  while ((match = variablesRegex.exec(content)) !== null) {
    allMatches.push({ type: "variables", match, index: match.index })
  }

  // Reset regex
  includeRegex.lastIndex = 0

  // Collect all includes
  while ((match = includeRegex.exec(content)) !== null) {
    allMatches.push({ type: "include", match, index: match.index })
  }

  // Sort by position in file
  allMatches.sort((a, b) => a.index - b.index)

  // Process content sequentially
  let workingContent = content
  let offset = 0

  for (const item of allMatches) {
    if (item.type === "variables") {
      const variablesContent = item.match[1]
      const newVariables = parseVariablesBlock(variablesContent)
      currentVariables = { ...currentVariables, ...newVariables }

      // Replace variables block with display
      const replacement = renderVariablesDisplay(newVariables)
      const start = item.match.index - offset
      const end = start + item.match[0].length

      workingContent =
        workingContent.substring(0, start) +
        replacement +
        workingContent.substring(end)
      offset += item.match[0].length - replacement.length
    } else if (item.type === "include") {
      const includePath = item.match[1].trim()
      const overrides = item.match[2]

      try {
        const fullPath = path.resolve(
          path.dirname(context.filePath),
          includePath
        )

        if (!fs.existsSync(fullPath)) {
          console.warn(`Include file not found: ${fullPath}`)
          continue
        }

        const includeContent = fs.readFileSync(fullPath, "utf-8")

        // Parse inline variable overrides if provided
        let includeVariables = { ...currentVariables }
        if (overrides) {
          const inlineVars = parseInlineVariables(overrides)
          includeVariables = { ...includeVariables, ...inlineVars }
        }

        // Process the included content with current variables
        const processedInclude = processMarkdownContent(includeContent, {
          variables: includeVariables,
          filePath: fullPath,
          rootDir: context.rootDir,
        })

        // Replace include with processed content
        const start = item.match.index - offset
        const end = start + item.match[0].length

        workingContent =
          workingContent.substring(0, start) +
          processedInclude +
          workingContent.substring(end)
        offset += item.match[0].length - processedInclude.length
      } catch (error) {
        console.error(`Error processing include ${includePath}:`, error)
      }
    }
  }

  // Finally, substitute variables in the remaining content
  workingContent = substituteVariables(workingContent, currentVariables)

  return workingContent
}

// Markdown plugin for VitePress
export function setupVariablesPlugin(
  md: MarkdownRenderer,
  rootDir: string = process.cwd()
) {
  // Store original render method
  const originalRender = md.render.bind(md)

  // Override render method
  md.render = function (src: string, env: any = {}) {
    // Process variables before markdown rendering
    const processedSrc = processMarkdownContent(src, {
      variables: {},
      filePath: env.path || env.relativePath || "",
      rootDir,
    })

    // Call original render with processed content
    return originalRender(processedSrc, env)
  }
}

// For direct use in VitePress config
export function createVariablesConfig(rootDir: string = process.cwd()) {
  return {
    config: (md: MarkdownRenderer) => {
      setupVariablesPlugin(md, rootDir)
    },
  }
}

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
          // It's a function, keep the entire function as string
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

  // Special case for functions that might span multiple lines
  if (trimmed.includes("=>") && !hasMatchingClosing(trimmed, "{", "}"))
    return true

  return false
}

// Check if brackets/parens are properly closed
function hasMatchingClosing(str: string, open: string, close: string): boolean {
  let count = 0
  let inString = false
  let stringChar = ""

  for (let i = 0; i < str.length; i++) {
    const char = str[i]
    const prevChar = i > 0 ? str[i - 1] : ""

    // Handle string literals
    if ((char === '"' || char === "'" || char === "`") && prevChar !== "\\") {
      if (!inString) {
        inString = true
        stringChar = char
      } else if (char === stringChar) {
        inString = false
        stringChar = ""
      }
    }

    // Only count brackets outside of strings
    if (!inString) {
      if (char === open) count++
      if (char === close) count--
    }
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
  let inString = false
  let stringChar = ""

  // Count initial open brackets/parens, accounting for strings
  for (let j = 0; j < value.length; j++) {
    const char = value[j]
    const prevChar = j > 0 ? value[j - 1] : ""

    if ((char === '"' || char === "'" || char === "`") && prevChar !== "\\") {
      if (!inString) {
        inString = true
        stringChar = char
      } else if (char === stringChar) {
        inString = false
        stringChar = ""
      }
    }

    if (!inString) {
      if (char === "(" || char === "{" || char === "[") {
        openCount++
        hasOpenBracket = true
      }
      if (char === ")" || char === "}" || char === "]") {
        openCount--
      }
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

      // Stop if we hit a comment followed by a variable
      if (line.startsWith("//") || line.startsWith("#")) {
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

      // Count brackets in this line, accounting for strings
      inString = false
      stringChar = ""

      for (let j = 0; j < line.length; j++) {
        const char = line[j]
        const prevChar = j > 0 ? line[j - 1] : ""

        if (
          (char === '"' || char === "'" || char === "`") &&
          prevChar !== "\\"
        ) {
          if (!inString) {
            inString = true
            stringChar = char
          } else if (char === stringChar) {
            inString = false
            stringChar = ""
          }
        }

        if (!inString) {
          if (char === "(" || char === "{" || char === "[") {
            openCount++
          }
          if (char === ")" || char === "}" || char === "]") {
            openCount--
          }
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
      let displayValue: string
      if (typeof value === "string") {
        // Escape HTML entities for proper display
        const escapedValue = value
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")

        // Check if it's multiline
        if (value.includes("\n")) {
          // For multiline content, use <pre> tag to preserve formatting (no quotes for multiline)
          displayValue = `<pre style="margin: 0; white-space: pre-wrap; font-family: monospace; background: #f6f8fa; padding: 8px; border-radius: 4px; font-size: 0.9em;"><code>${escapedValue}</code></pre>`
        } else {
          displayValue = `<code style="background: #f6f8fa; padding: 2px 4px; border-radius: 3px; font-family: monospace;">"${escapedValue}"</code>`
        }
      } else {
        const jsonValue = JSON.stringify(value, null, 2)
        const escapedJson = jsonValue
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")

        if (jsonValue.includes("\n")) {
          displayValue = `<pre style="margin: 0; white-space: pre-wrap; font-family: monospace; background: #f6f8fa; padding: 8px; border-radius: 4px; font-size: 0.9em;"><code>${escapedJson}</code></pre>`
        } else {
          displayValue = `<code style="background: #f6f8fa; padding: 2px 4px; border-radius: 3px; font-family: monospace;">${escapedJson}</code>`
        }
      }

      return `  <tr>
    <td style="padding: 12px; border: 1px solid #d0d7de; vertical-align: top;"><strong>${key}</strong></td>
    <td style="padding: 12px; border: 1px solid #d0d7de; vertical-align: top;">${displayValue}</td>
  </tr>`
    })
    .join("\n")

  return `
<!-- VARIABLES_TABLE_START -->
<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
  <thead>
    <tr style="background-color: #f6f8fa;">
      <th style="padding: 12px; border: 1px solid #d0d7de; text-align: left; font-weight: 600;">Variable</th>
      <th style="padding: 12px; border: 1px solid #d0d7de; text-align: left; font-weight: 600;">Value</th>
    </tr>
  </thead>
  <tbody>
${rows}
  </tbody>
</table>
<!-- VARIABLES_TABLE_END -->
`
}

// Substitute variables in code blocks AND regular text (but protect variable display table)
function substituteVariables(content: string, variables: Variables): string {
  let processedContent = content

  // First, handle fallback syntax: ${VARIABLE_NAME:fallback_value}
  // This needs to handle nested braces properly for complex fallback values
  processedContent = processedContent.replace(
    /\$\{(\w+):((?:[^{}]|{[^}]*})*)\}/g,
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
      // Use word boundary but avoid replacing variables that are part of fallback syntax that wasn't already processed
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

// Main content processing function
function processMarkdownContent(
  content: string,
  context: ProcessContext
): string {
  let processedContent = content
  let currentVariables = { ...context.variables }

  // Process content in order: variables blocks, includes, then substitution
  // This ensures proper scoping where variables only affect content after their definition

  const allMatches: Array<{
    type: "variables" | "include"
    match: RegExpExecArray
    index: number
  }> = []

  // Collect all variables blocks
  const variablesRegex = /```variables\n([\s\S]*?)\n```/g
  let match
  while ((match = variablesRegex.exec(content)) !== null) {
    allMatches.push({ type: "variables", match, index: match.index })
  }

  // Collect all includes
  const includeRegex = /<!--\s*@include:\s*([^{]+?)(\{[^}]+\})?\s*-->/g
  includeRegex.lastIndex = 0
  while ((match = includeRegex.exec(content)) !== null) {
    allMatches.push({ type: "include", match, index: match.index })
  }

  // Sort by position in file
  allMatches.sort((a, b) => a.index - b.index)

  // Process content sequentially
  let workingContent = content
  let offset = 0
  let lastProcessedIndex = 0

  for (const item of allMatches) {
    if (item.type === "variables") {
      const variablesContent = item.match[1]
      const newVariables = parseVariablesBlock(variablesContent)
      currentVariables = { ...currentVariables, ...newVariables }

      // Apply variables to the content between last processed position and current variables block
      const beforeVariables = workingContent.substring(
        lastProcessedIndex,
        item.match.index - offset
      )
      const processedBefore = substituteVariables(
        beforeVariables,
        currentVariables
      )

      // Replace variables block with display
      const replacement = renderVariablesDisplay(newVariables)
      const start = item.match.index - offset
      const end = start + item.match[0].length

      workingContent =
        workingContent.substring(0, lastProcessedIndex) +
        processedBefore +
        replacement +
        workingContent.substring(end)

      const lengthDiff =
        processedBefore.length +
        replacement.length -
        (beforeVariables.length + item.match[0].length)
      offset -= lengthDiff
      lastProcessedIndex = start + replacement.length
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

        // Apply variables to content before this include
        const beforeInclude = workingContent.substring(
          lastProcessedIndex,
          item.match.index - offset
        )
        const processedBefore = substituteVariables(
          beforeInclude,
          currentVariables
        )

        // Replace include with processed content
        const start = item.match.index - offset
        const end = start + item.match[0].length

        workingContent =
          workingContent.substring(0, lastProcessedIndex) +
          processedBefore +
          processedInclude +
          workingContent.substring(end)

        const lengthDiff =
          processedBefore.length +
          processedInclude.length -
          (beforeInclude.length + item.match[0].length)
        offset -= lengthDiff
        lastProcessedIndex = start + processedInclude.length
      } catch (error) {
        console.error(`Error processing include ${includePath}:`, error)
      }
    }
  }

  // Process any remaining content after the last match
  if (lastProcessedIndex < workingContent.length) {
    const remainingContent = workingContent.substring(lastProcessedIndex)
    const processedRemaining = substituteVariables(
      remainingContent,
      currentVariables
    )
    workingContent =
      workingContent.substring(0, lastProcessedIndex) + processedRemaining
  }

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

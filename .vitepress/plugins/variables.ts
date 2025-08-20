// plugins/variables.ts
import type { MarkdownRenderer } from "vitepress"
import fs from "fs"
import path from "path"
import yaml from "js-yaml"

interface Variables {
  [key: string]: any
}

interface ProcessContext {
  variables: Variables
  filePath: string
  rootDir: string
}

interface ParsedBlock {
  type: "variables" | "include"
  start: number
  end: number
  content: string
  data?: any
}

// Modern YAML-based variables parser
class VariablesParser {
  parseVariablesBlock(content: string): Variables {
    try {
      // Try YAML first (more robust)
      const parsed = (yaml.load(content) as Variables) || {}

      // Post-process to handle function strings
      return this.processFunctions(parsed)
    } catch (yamlError) {
      console.warn("Failed to parse as YAML, trying legacy format:", yamlError)
      return this.parseLegacyFormat(content)
    }
  }

  private processFunctions(variables: Variables): Variables {
    const processed: Variables = {}

    for (const [key, value] of Object.entries(variables)) {
      if (typeof value === "string" && this.looksLikeFunction(value)) {
        // Keep function as string but mark it as a function
        processed[key] = value.trim()
      } else {
        processed[key] = value
      }
    }

    return processed
  }

  private looksLikeFunction(value: string): boolean {
    const trimmed = value.trim()
    return (
      // Arrow functions
      trimmed.includes("=>") ||
      // Traditional functions
      trimmed.startsWith("function") ||
      // Async functions
      trimmed.startsWith("async") ||
      // Parentheses start (likely parameters)
      /^\([^)]*\)\s*=>/.test(trimmed)
    )
  }

  // Fallback for your current format
  private parseLegacyFormat(content: string): Variables {
    const variables: Variables = {}

    // Use a more robust approach - split into logical units
    const assignments = this.extractAssignments(content)

    for (const assignment of assignments) {
      const { key, value } = assignment
      try {
        // Try JSON parsing first
        variables[key] = JSON.parse(value)
      } catch {
        // Handle function syntax and plain strings
        if (this.looksLikeFunction(value)) {
          variables[key] = value.trim()
        } else {
          variables[key] = value.replace(/^["']|["']$/g, "")
        }
      }
    }

    return variables
  }

  private extractAssignments(
    content: string
  ): Array<{ key: string; value: string }> {
    const assignments: Array<{ key: string; value: string }> = []
    const lines = content.split("\n")

    let i = 0
    while (i < lines.length) {
      const line = lines[i].trim()

      if (!line || line.startsWith("//") || line.startsWith("#")) {
        i++
        continue
      }

      const match = line.match(/^(\w+)\s*=\s*(.*)$/)
      if (match) {
        const key = match[1]
        let value = match[2]

        // Simple multiline detection
        if (this.needsMoreLines(value)) {
          const multilineResult = this.collectMultilineValue(lines, i, key)
          value = multilineResult.value
          i = multilineResult.nextIndex
        } else {
          i++
        }

        assignments.push({ key, value })
      } else {
        i++
      }
    }

    return assignments
  }

  private needsMoreLines(value: string): boolean {
    const trimmed = value.trim()
    if (!trimmed) return true

    // Count brackets
    const brackets = { "(": 0, "{": 0, "[": 0 }
    let inString = false
    let stringChar = ""

    for (const char of trimmed) {
      if ((char === '"' || char === "'" || char === "`") && !inString) {
        inString = true
        stringChar = char
      } else if (char === stringChar && inString) {
        inString = false
      } else if (!inString) {
        if (char === "(" || char === "{" || char === "[") {
          brackets[char as keyof typeof brackets]++
        } else if (char === ")") brackets["("]--
        else if (char === "}") brackets["{"]--
        else if (char === "]") brackets["["]--
      }
    }

    return Object.values(brackets).some((count) => count > 0)
  }

  private collectMultilineValue(
    lines: string[],
    startIndex: number,
    key: string
  ): { value: string; nextIndex: number } {
    const firstLine = lines[startIndex]
    const match = firstLine.match(/^(\w+)\s*=\s*(.*)$/)
    let value = match ? match[2] : ""

    let i = startIndex + 1
    while (i < lines.length && this.needsMoreLines(value)) {
      const line = lines[i]

      // Stop at next variable definition
      if (line.trim().match(/^\w+\s*=/)) break

      value += "\n" + line
      i++
    }

    return { value: value.trim(), nextIndex: i }
  }
}

// Content processor with better separation of concerns
class ContentProcessor {
  private parser = new VariablesParser()

  processContent(content: string, context: ProcessContext): string {
    // Parse all blocks first
    const blocks = this.parseBlocks(content)

    // Process blocks in reverse order to maintain indices
    let processedContent = content
    let currentVariables = { ...context.variables }

    // Forward pass to build variable context
    for (const block of blocks) {
      if (block.type === "variables") {
        const blockVars = this.parser.parseVariablesBlock(block.content)
        currentVariables = { ...currentVariables, ...blockVars }
        block.data = { variables: blockVars, context: currentVariables }
      } else if (block.type === "include") {
        block.data = { context: currentVariables }
      }
    }

    // Backward pass to replace content
    for (let i = blocks.length - 1; i >= 0; i--) {
      const block = blocks[i]
      let replacement = ""

      if (block.type === "variables") {
        replacement = this.renderVariablesDisplay(block.data.variables)
      } else if (block.type === "include") {
        replacement = this.processInclude(block, context)
      }

      processedContent =
        processedContent.substring(0, block.start) +
        replacement +
        processedContent.substring(block.end)
    }

    // Apply variable substitution to the final content
    return this.substituteVariables(processedContent, currentVariables)
  }

  private parseBlocks(content: string): ParsedBlock[] {
    const blocks: ParsedBlock[] = []

    // Variables blocks
    const variablesRegex = /```(?:variables|vars)\n([\s\S]*?)\n```/g
    let match
    while ((match = variablesRegex.exec(content)) !== null) {
      blocks.push({
        type: "variables",
        start: match.index,
        end: match.index + match[0].length,
        content: match[1],
      })
    }

    // Include blocks
    const includeRegex = /<!--\s*@include:\s*([^{]+?)(\{[^}]+\})?\s*-->/g
    while ((match = includeRegex.exec(content)) !== null) {
      blocks.push({
        type: "include",
        start: match.index,
        end: match.index + match[0].length,
        content: match[1].trim(),
        data: { overrides: match[2] },
      })
    }

    return blocks.sort((a, b) => a.start - b.start)
  }

  private processInclude(block: ParsedBlock, context: ProcessContext): string {
    try {
      const includePath = block.content
      const fullPath = path.resolve(path.dirname(context.filePath), includePath)

      if (!fs.existsSync(fullPath)) {
        console.warn(`Include file not found: ${fullPath}`)
        return `<!-- Include not found: ${includePath} -->`
      }

      const includeContent = fs.readFileSync(fullPath, "utf-8")
      let includeVariables = { ...block.data.context }

      // Parse inline overrides with support for YAML-like syntax
      if (block.data.overrides) {
        try {
          const inlineVars = this.parseInlineVariables(block.data.overrides)
          includeVariables = { ...includeVariables, ...inlineVars }
        } catch (error) {
          console.warn("Failed to parse include overrides:", error)
        }
      }

      return this.processContent(includeContent, {
        variables: includeVariables,
        filePath: fullPath,
        rootDir: context.rootDir,
      })
    } catch (error) {
      console.error(`Error processing include ${block.content}:`, error)
      return `<!-- Error processing include: ${block.content} -->`
    }
  }

  private parseInlineVariables(overrideStr: string): Variables {
    const variables: Variables = {}

    try {
      // Remove outer braces
      const content = overrideStr
        .trim()
        .replace(/^\{|\}$/g, "")
        .trim()

      if (!content) return variables

      // Try YAML parsing first for complex structures
      try {
        return (yaml.load(`{${content}}`) as Variables) || {}
      } catch (yamlError) {
        // Fall back to manual parsing for mixed syntax
        return this.parseInlineManual(content)
      }
    } catch (error) {
      console.warn("Failed to parse inline variables:", overrideStr, error)
      return variables
    }
  }

  private parseInlineManual(content: string): Variables {
    const variables: Variables = {}
    const lines = content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line)

    let i = 0
    while (i < lines.length) {
      const line = lines[i]

      // Look for key: value pattern
      const colonMatch = line.match(/^(\w+):\s*(.*)$/)
      if (colonMatch) {
        const key = colonMatch[1]
        let value = colonMatch[2]

        // Handle multiline values (YAML-style with |)
        if (value === "|") {
          i++
          const multilineValue = []
          while (i < lines.length) {
            const nextLine = lines[i]
            // Stop if we hit the next key
            if (nextLine.match(/^\w+:\s*/)) {
              break
            }
            multilineValue.push(nextLine)
            i++
          }
          value = multilineValue.join("\n").trim()
          i-- // Back up one since the loop will increment
        } else if (this.needsMoreLines(value)) {
          // Handle bracket-based multiline
          const multilineResult = this.collectInlineMultiline(lines, i, key)
          value = multilineResult.value
          i = multilineResult.nextIndex - 1 // -1 because loop will increment
        }

        // Parse the value
        try {
          variables[key] = JSON.parse(value)
        } catch {
          if (this.looksLikeFunction(value)) {
            variables[key] = value.trim()
          } else {
            // Remove quotes if present
            variables[key] = value.replace(/^["']|["']$/g, "")
          }
        }
      }

      i++
    }

    return variables
  }

  private collectInlineMultiline(
    lines: string[],
    startIndex: number,
    key: string
  ): { value: string; nextIndex: number } {
    const firstLine = lines[startIndex]
    const match = firstLine.match(/^(\w+):\s*(.*)$/)
    let value = match ? match[2] : ""

    let i = startIndex + 1
    while (i < lines.length && this.needsMoreLines(value)) {
      const line = lines[i]

      // Stop at next key definition
      if (line.match(/^\w+:\s*/)) break

      value += "\n" + line
      i++
    }

    return { value: value.trim(), nextIndex: i }
  }

  private substituteVariables(content: string, variables: Variables): string {
    let result = content

    // Handle fallback syntax: ${VAR:fallback}
    result = result.replace(
      /\$\{(\w+):([^}]+)\}/g,
      (match, varName, fallback) => {
        if (variables.hasOwnProperty(varName)) {
          const value = variables[varName]
          return typeof value === "string" ? value : JSON.stringify(value)
        }
        return fallback
      }
    )

    // Handle simple variables: ${VAR} or VAR_NAME
    for (const [key, value] of Object.entries(variables)) {
      const displayValue =
        typeof value === "string" ? value : JSON.stringify(value)

      // Replace ${VARIABLE} format
      result = result.replace(new RegExp(`\\$\\{${key}\\}`, "g"), displayValue)

      // Replace standalone variables (with word boundaries, but not in variable tables)
      if (!result.includes("<!-- VARIABLES_TABLE_START -->")) {
        result = result.replace(new RegExp(`\\b${key}\\b`, "g"), displayValue)
      } else {
        // More careful replacement when tables are present
        const tableParts = result.split(
          /(<!-- VARIABLES_TABLE_START -->[\s\S]*?<!-- VARIABLES_TABLE_END -->)/g
        )
        for (let i = 0; i < tableParts.length; i += 2) {
          tableParts[i] = tableParts[i].replace(
            new RegExp(`\\b${key}\\b`, "g"),
            displayValue
          )
        }
        result = tableParts.join("")
      }
    }

    return result
  }

  private renderVariablesDisplay(variables: Variables): string {
    const rows = Object.entries(variables)
      .map(([key, value]) => {
        const displayValue = this.formatValueForDisplay(value)
        return `  <tr>
    <td style="padding: 12px; border: 1px solid var(--vp-c-border, #d0d7de); vertical-align: top;"><strong>${key}</strong></td>
    <td style="padding: 12px; border: 1px solid var(--vp-c-border, #d0d7de); vertical-align: top;">${displayValue}</td>
  </tr>`
      })
      .join("\n")

    return `
<!-- VARIABLES_TABLE_START -->
<div class="variables-table">
<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
  <thead>
    <tr>
      <th style="padding: 12px; border: 1px solid var(--vp-c-border, #d0d7de); text-align: left; font-weight: 600;">Variable</th>
      <th style="padding: 12px; border: 1px solid var(--vp-c-border, #d0d7de); text-align: left; font-weight: 600;">Value</th>
    </tr>
  </thead>
  <tbody>
${rows}
  </tbody>
</table>
</div>
<!-- VARIABLES_TABLE_END -->
`
  }

  private formatValueForDisplay(value: any): string {
    if (typeof value === "string") {
      const escaped = this.escapeHtml(value)

      // Special formatting for functions
      if (this.looksLikeFunction(value)) {
        return `<pre style="margin: 0; white-space: pre-wrap; font-family: var(--vp-font-family-mono); padding: 8px; background: var(--vp-code-bg); border-radius: 4px; font-size: 0.9em; border-left: 3px solid var(--vp-c-brand);"><code class="language-javascript">${escaped}</code></pre>`
      }

      if (value.includes("\n")) {
        return `<pre style="margin: 0; white-space: pre-wrap; font-family: var(--vp-font-family-mono); padding: 8px; background: var(--vp-code-bg); border-radius: 4px; font-size: 0.9em;"><code>${escaped}</code></pre>`
      } else {
        return `<code style="padding: 2px 4px; background: var(--vp-code-bg); border-radius: 3px; font-family: var(--vp-font-family-mono);">"${escaped}"</code>`
      }
    } else {
      const jsonValue = JSON.stringify(value, null, 2)
      const escaped = this.escapeHtml(jsonValue)

      if (jsonValue.includes("\n")) {
        return `<pre style="margin: 0; white-space: pre-wrap; font-family: var(--vp-font-family-mono); padding: 8px; background: var(--vp-code-bg); border-radius: 4px; font-size: 0.9em;"><code>${escaped}</code></pre>`
      } else {
        return `<code style="padding: 2px 4px; background: var(--vp-code-bg); border-radius: 3px; font-family: var(--vp-font-family-mono);">${escaped}</code>`
      }
    }
  }

  private looksLikeFunction(value: string): boolean {
    const trimmed = value.trim()
    return (
      // Arrow functions
      trimmed.includes("=>") ||
      // Traditional functions
      trimmed.startsWith("function") ||
      // Async functions
      trimmed.startsWith("async") ||
      // Parentheses start (likely parameters)
      /^\([^)]*\)\s*=>/.test(trimmed)
    )
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
  }
}

// Main plugin setup
export function setupVariablesPlugin(
  md: MarkdownRenderer,
  rootDir: string = process.cwd()
) {
  const processor = new ContentProcessor()
  const originalRender = md.render.bind(md)

  md.render = function (src: string, env: any = {}) {
    try {
      const processedSrc = processor.processContent(src, {
        variables: {},
        filePath: env.path || env.relativePath || "",
        rootDir,
      })

      return originalRender(processedSrc, env)
    } catch (error) {
      console.error("Error in variables plugin:", error)
      // Fallback to original content on error
      return originalRender(src, env)
    }
  }
}

export function createVariablesConfig(rootDir: string = process.cwd()) {
  return {
    config: (md: MarkdownRenderer) => {
      setupVariablesPlugin(md, rootDir)
    },
  }
}

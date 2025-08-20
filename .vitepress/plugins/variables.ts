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
  type: "variables" | "variables-hide-table" | "include"
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
      if (block.type === "variables" || block.type === "variables-hide-table") {
        const blockVars = this.parser.parseVariablesBlock(block.content)
        currentVariables = { ...currentVariables, ...blockVars }
        block.data = { variables: blockVars, context: currentVariables }
      } else if (block.type === "include") {
        block.data = { ...block.data, context: currentVariables }
      }
    }

    // Backward pass to replace content
    for (let i = blocks.length - 1; i >= 0; i--) {
      const block = blocks[i]
      let replacement = ""

      if (block.type === "variables") {
        replacement = this.renderVariablesDisplay(block.data.variables)
      } else if (block.type === "variables-hide-table") {
        // Hidden variables block - no output, just empty string
        replacement = ""
      } else if (block.type === "include") {
        replacement = this.processInclude(block, context, currentVariables)
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

    // Variables blocks (visible table)
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

    // Hidden variables blocks (no table output)
    const hiddenVariablesRegex =
      /```(?:variables-hide-table|vars-hide-table|variables-hidden|vars-hidden)\n([\s\S]*?)\n```/g
    while ((match = hiddenVariablesRegex.exec(content)) !== null) {
      blocks.push({
        type: "variables-hide-table",
        start: match.index,
        end: match.index + match[0].length,
        content: match[1],
      })
    }

    // Include blocks - Fixed regex to properly capture multiline overrides
    const includeRegex = /<!--\s*@include:\s*([^{]+?)(\{[\s\S]*?\})?\s*-->/g
    while ((match = includeRegex.exec(content)) !== null) {
      console.log(`Found include block:`, {
        fullMatch: match[0],
        path: match[1]?.trim(),
        overrides: match[2],
      }) // Debug log

      blocks.push({
        type: "include",
        start: match.index,
        end: match.index + match[0].length,
        content: match[1].trim(),
        data: { overrides: match[2] || null }, // This was the issue - data was being overwritten
      })
    }

    return blocks.sort((a, b) => a.start - b.start)
  }

  private processInclude(
    block: ParsedBlock,
    context: ProcessContext,
    currentVariables: Variables
  ): string {
    try {
      const includePath = block.content
      const fullPath = path.resolve(path.dirname(context.filePath), includePath)

      console.log(`Processing include: ${includePath}`) // Debug log
      console.log(`Block data:`, block.data) // Debug log

      if (!fs.existsSync(fullPath)) {
        console.warn(`Include file not found: ${fullPath}`)
        return `<!-- Include not found: ${includePath} -->`
      }

      const includeContent = fs.readFileSync(fullPath, "utf-8")

      // Start with current variables from context
      let includeVariables = { ...currentVariables }
      console.log(
        `Starting with current variables:`,
        Object.keys(currentVariables)
      ) // Debug log

      // Parse and merge inline overrides
      if (block.data?.overrides) {
        console.log(`Raw overrides string: "${block.data.overrides}"`) // Debug log
        try {
          const inlineVars = this.parseInlineVariables(block.data.overrides)
          console.log(`Parsed inline variables for ${includePath}:`, inlineVars) // Debug log
          includeVariables = { ...includeVariables, ...inlineVars }
          console.log(`Merged variables:`, Object.keys(includeVariables)) // Debug log
        } catch (error) {
          console.warn("Failed to parse include overrides:", error)
        }
      } else {
        console.log(`No overrides found in block data`) // Debug log
      }

      console.log(
        `Processing include ${includePath} with variables:`,
        includeVariables
      ) // Debug log

      // Process the included content with the merged variables
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
    console.log(`Raw override string received: "${overrideStr}"`) // Debug log

    const variables: Variables = {}

    try {
      // Remove outer braces and trim
      const content = overrideStr
        .trim()
        .replace(/^\{|\}$/g, "")
        .trim()

      if (!content) {
        console.log(`No content after processing override string`) // Debug log
        return variables
      }

      console.log(`Content after brace removal: "${content}"`) // Debug log

      // Try YAML parsing first - but format it properly for YAML
      try {
        // Convert space-separated format to proper YAML
        const yamlContent = this.convertToYAML(content)
        console.log(`Converted to YAML format: "${yamlContent}"`) // Debug log

        const yamlResult = yaml.load(yamlContent) as Variables
        console.log(`YAML parsed result:`, yamlResult) // Debug log
        return yamlResult || {}
      } catch (yamlError) {
        console.log(`YAML parsing failed:`, yamlError) // Debug log
        console.log(`Falling back to manual parsing`) // Debug log
        // Fall back to manual parsing for mixed syntax
        const manualResult = this.parseInlineManual(content)
        console.log(`Manual parsing result:`, manualResult) // Debug log
        return manualResult
      }
    } catch (error) {
      console.warn("Failed to parse inline variables:", overrideStr, error)
      return variables
    }
  }

  private convertToYAML(content: string): string {
    // If it already looks like YAML (has newlines), just use it
    if (content.includes("\n")) {
      return content
    }

    // Convert space-separated to YAML format
    // "BROADCASTCHANNELS: todoCreated STOREACTIONTYPE: dataCreate"
    // becomes "BROADCASTCHANNELS: todoCreated\nSTOREACTIONTYPE: dataCreate"

    const tokens = content.split(/\s+/)
    const yamlLines: string[] = []
    let i = 0

    while (i < tokens.length) {
      const token = tokens[i]

      // Look for key: pattern
      if (token.includes(":")) {
        const [key, ...valueParts] = token.split(":")
        let value = valueParts.join(":").trim()

        // If no value after the colon, look at the next token(s)
        if (!value && i + 1 < tokens.length) {
          i++
          value = tokens[i]

          // Continue collecting value tokens until we hit the next key
          while (i + 1 < tokens.length && !tokens[i + 1].includes(":")) {
            i++
            value += " " + tokens[i]
          }
        }

        yamlLines.push(`${key}: ${value}`)
      }

      i++
    }

    return yamlLines.join("\n")
  }

  private parseInlineManual(content: string): Variables {
    const variables: Variables = {}

    // Handle space-separated key: value pairs
    // Use a more sophisticated approach to split on spaces while respecting quoted values
    const pairs = this.splitInlinePairs(content)

    for (const pair of pairs) {
      // Look for key: value pattern
      const colonMatch = pair.match(/^(\w+):\s*(.*)$/)
      if (colonMatch) {
        const key = colonMatch[1]
        let value = colonMatch[2].trim()

        // Parse the value
        try {
          variables[key] = JSON.parse(value)
        } catch {
          if (this.looksLikeFunction(value)) {
            variables[key] = value.trim()
          } else {
            // Remove quotes if present, otherwise use as-is
            variables[key] = value.replace(/^["']|["']$/g, "")
          }
        }
      } else {
        // Try key=value format as fallback
        const equalsMatch = pair.match(/^(\w+)\s*=\s*(.*)$/)
        if (equalsMatch) {
          const key = equalsMatch[1]
          let value = equalsMatch[2].trim()

          try {
            variables[key] = JSON.parse(value)
          } catch {
            if (this.looksLikeFunction(value)) {
              variables[key] = value.trim()
            } else {
              variables[key] = value.replace(/^["']|["']$/g, "")
            }
          }
        }
      }
    }

    console.log(`Manual parsing result:`, variables) // Debug log
    return variables
  }

  private splitInlinePairs(content: string): string[] {
    const pairs: string[] = []
    let current = ""
    let inQuotes = false
    let quoteChar = ""
    let i = 0

    while (i < content.length) {
      const char = content[i]

      if ((char === '"' || char === "'") && !inQuotes) {
        inQuotes = true
        quoteChar = char
        current += char
      } else if (char === quoteChar && inQuotes) {
        inQuotes = false
        quoteChar = ""
        current += char
      } else if (char === " " && !inQuotes) {
        // Look ahead to see if this space separates key:value pairs
        if (current.trim() && this.looksLikeKeyValuePair(current.trim())) {
          pairs.push(current.trim())
          current = ""
        } else {
          current += char
        }
      } else {
        current += char
      }
      i++
    }

    if (current.trim()) {
      pairs.push(current.trim())
    }

    // If no proper pairs found, try splitting on spaces and recombining
    if (
      pairs.length === 0 ||
      pairs.every((p) => !this.looksLikeKeyValuePair(p))
    ) {
      return this.fallbackSplitPairs(content)
    }

    return pairs
  }

  private looksLikeKeyValuePair(str: string): boolean {
    return /^\w+\s*[:=]\s*.+/.test(str.trim())
  }

  private fallbackSplitPairs(content: string): string[] {
    // For space-separated format like "BROADCASTCHANNELS: todoCreated STOREACTIONTYPE: dataCreate"
    // We need to be smart about where to split
    const tokens = content.split(/\s+/)
    const pairs: string[] = []
    let i = 0

    while (i < tokens.length) {
      const token = tokens[i]

      // Look for key: pattern
      if (token.includes(":")) {
        const [key, ...valueParts] = token.split(":")
        let value = valueParts.join(":").trim()

        // If no value after the colon, look at the next token
        if (!value && i + 1 < tokens.length) {
          i++
          value = tokens[i]

          // Continue collecting value tokens until we hit the next key
          while (
            i + 1 < tokens.length &&
            !tokens[i + 1].includes(":") &&
            !this.looksLikeKeyValuePair(tokens[i + 1])
          ) {
            i++
            value += " " + tokens[i]
          }
        }

        pairs.push(`${key}: ${value}`)
      } else if (token.includes("=")) {
        // Handle key=value format
        pairs.push(token)
      }

      i++
    }

    return pairs
  }

  private substituteVariables(content: string, variables: Variables): string {
    let result = content

    console.log(
      `Substituting variables in content. Available variables:`,
      Object.keys(variables)
    ) // Debug log

    // Handle fallback syntax: ${VAR:fallback}
    result = result.replace(
      /\$\{(\w+):([^}]+)\}/g,
      (match, varName, fallback) => {
        if (variables.hasOwnProperty(varName)) {
          const value = variables[varName]
          const substitution =
            typeof value === "string" ? value : JSON.stringify(value)
          console.log(`Substituted ${match} with "${substitution}"`) // Debug log
          return substitution
        }
        console.log(`Using fallback for ${match}: "${fallback}"`) // Debug log
        return fallback
      }
    )

    // Handle simple variables: ${VAR} or VAR_NAME
    for (const [key, value] of Object.entries(variables)) {
      const displayValue =
        typeof value === "string" ? value : JSON.stringify(value)

      // Replace ${VARIABLE} format
      const dollarBraceRegex = new RegExp(`\\$\\{${key}\\}`, "g")
      if (dollarBraceRegex.test(result)) {
        result = result.replace(dollarBraceRegex, displayValue)
        console.log(`Substituted \${${key}} with "${displayValue}"`) // Debug log
      }

      // Replace standalone variables (with word boundaries, but not in variable tables)
      if (!result.includes("<!-- VARIABLES_TABLE_START -->")) {
        const standaloneRegex = new RegExp(`\\b${key}\\b`, "g")
        if (standaloneRegex.test(result)) {
          result = result.replace(standaloneRegex, displayValue)
          console.log(`Substituted standalone ${key} with "${displayValue}"`) // Debug log
        }
      } else {
        // More careful replacement when tables are present
        const tableParts = result.split(
          /(<!-- VARIABLES_TABLE_START -->[\s\S]*?<!-- VARIABLES_TABLE_END -->)/g
        )
        for (let i = 0; i < tableParts.length; i += 2) {
          const standaloneRegex = new RegExp(`\\b${key}\\b`, "g")
          if (standaloneRegex.test(tableParts[i])) {
            tableParts[i] = tableParts[i].replace(standaloneRegex, displayValue)
            console.log(
              `Substituted standalone ${key} in non-table section with "${displayValue}"`
            ) // Debug log
          }
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

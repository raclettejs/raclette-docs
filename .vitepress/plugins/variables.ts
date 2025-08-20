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

// Unified variables parser - handles both global and inline variables
class VariablesParser {
  parseVariables(content: string, isInline: boolean = false): Variables {
    try {
      let yamlContent = content

      // For inline variables, handle the brace removal
      if (isInline) {
        yamlContent = content
          .trim()
          .replace(/^\{|\}$/g, "")
          .trim()

        if (!yamlContent) return {}

        // Convert space-separated format to proper YAML if needed
        if (!yamlContent.includes("\n") && yamlContent.includes(":")) {
          yamlContent = this.convertSpaceSeparatedToYAML(yamlContent)
        }
      }

      const parsed = (yaml.load(yamlContent) as Variables) || {}
      return parsed // Remove normalization - let YAML handle it
    } catch (error) {
      console.warn("Failed to parse variables:", error)
      return {}
    }
  }

  private convertSpaceSeparatedToYAML(content: string): string {
    // Convert "KEY1: value1 KEY2: value2" to proper YAML
    const tokens = content.split(/\s+/)
    const yamlLines: string[] = []
    let i = 0

    while (i < tokens.length) {
      const token = tokens[i]

      if (token.includes(":")) {
        const [key, ...valueParts] = token.split(":")
        let value = valueParts.join(":").trim()

        if (!value && i + 1 < tokens.length) {
          i++
          value = tokens[i]

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
}

// Content processor
class ContentProcessor {
  private parser = new VariablesParser()

  processContent(content: string, context: ProcessContext): string {
    const blocks = this.parseBlocks(content)
    let processedContent = content
    let currentVariables = { ...context.variables }

    // Forward pass to build variable context
    for (const block of blocks) {
      if (block.type === "variables") {
        const blockVars = this.parser.parseVariables(block.content)
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
        replacement = "" // Hidden variables
      } else if (block.type === "include") {
        replacement = this.processInclude(block, context, currentVariables)
      }

      processedContent =
        processedContent.substring(0, block.start) +
        replacement +
        processedContent.substring(block.end)
    }

    // Apply variable substitution
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
    const includeRegex = /<!--\s*@include:\s*([^{]+?)(\{[\s\S]*?\})?\s*-->/g
    while ((match = includeRegex.exec(content)) !== null) {
      blocks.push({
        type: "include",
        start: match.index,
        end: match.index + match[0].length,
        content: match[1].trim(),
        data: { overrides: match[2] || null },
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

      if (!fs.existsSync(fullPath)) {
        console.warn(`Include file not found: ${fullPath}`)
        return `<!-- Include not found: ${includePath} -->`
      }

      const includeContent = fs.readFileSync(fullPath, "utf-8")
      let includeVariables = { ...currentVariables }

      // Parse inline overrides if present
      if (block.data?.overrides) {
        const inlineVars = this.parser.parseVariables(
          block.data.overrides,
          true
        )
        includeVariables = { ...includeVariables, ...inlineVars }
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

  private substituteVariables(content: string, variables: Variables): string {
    let result = content

    // First, handle all variable substitutions
    // Handle fallback syntax: ${VAR:fallback} or ${VAR:} (empty fallback)
    result = result.replace(
      /\$\{(\w+):([^}]*)\}/g,
      (match, varName, fallback) => {
        return variables.hasOwnProperty(varName)
          ? this.formatValue(variables[varName])
          : fallback
      }
    )

    // Handle simple variables: ${VAR} with proper indentation
    for (const [key, value] of Object.entries(variables)) {
      const displayValue = this.formatValue(value)

      // Replace ${VARIABLE} format with context-aware indentation
      const dollarBraceRegex = new RegExp(`\\$\\{${key}\\}`, "g")

      // Process each match individually to handle indentation correctly
      let match
      while ((match = dollarBraceRegex.exec(result)) !== null) {
        const matchStart = match.index
        const matchEnd = match.index + match[0].length
        let replacement = displayValue

        // Replace this specific occurrence
        result =
          result.substring(0, matchStart) +
          replacement +
          result.substring(matchEnd)

        // Reset regex lastIndex since we modified the string
        dollarBraceRegex.lastIndex = matchStart + replacement.length
      }

      // Reset regex for next variable
      dollarBraceRegex.lastIndex = 0

      // Only replace standalone variables that are complete words
      const standaloneRegex = new RegExp(`\\b${key}\\b`, "g")
      let standaloneMatch
      while ((standaloneMatch = standaloneRegex.exec(result)) !== null) {
        const matchStart = standaloneMatch.index
        const matchEnd = matchStart + standaloneMatch[0].length

        // Check if this is inside a ${} pattern - if so, skip it
        const beforeMatch = result.substring(
          Math.max(0, matchStart - 10),
          matchStart
        )
        const afterMatch = result.substring(
          matchEnd,
          Math.min(result.length, matchEnd + 10)
        )
        if (beforeMatch.includes("${") && afterMatch.includes("}")) {
          continue // Skip if it's part of ${VAR} syntax
        }

        // Apply same indentation logic for standalone variables
        const beforeMatchFull = result.substring(0, matchStart)
        const lastNewlineIndex = beforeMatchFull.lastIndexOf("\n")
        const lineStart = lastNewlineIndex === -1 ? 0 : lastNewlineIndex + 1
        const linePrefix = result.substring(lineStart, matchStart)
        const indentationMatch = linePrefix.match(/^(\s*)/)
        const baseIndentation = indentationMatch ? indentationMatch[1] : ""

        let replacement = displayValue
        if (displayValue.includes("\n")) {
          const lines = displayValue.split("\n")
          replacement = lines
            .map((line, index) => {
              if (index === 0) return line
              if (line.trim() === "") return ""
              return baseIndentation + line
            })
            .join("\n")
        }

        // Replace this specific occurrence
        result =
          result.substring(0, matchStart) +
          replacement +
          result.substring(matchEnd)

        // Reset regex lastIndex since we modified the string
        standaloneRegex.lastIndex = matchStart + replacement.length
      }

      // Reset regex for next variable
      standaloneRegex.lastIndex = 0
    }

    // After all substitutions, remove lines that are now empty (whitespace only)
    result = result.replace(/^\s*$\n/gm, "")

    return result
  }

  private formatValue(value: any): string {
    return typeof value === "string" ? value : JSON.stringify(value)
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

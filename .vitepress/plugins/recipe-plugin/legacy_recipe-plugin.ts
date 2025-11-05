import { Plugin } from "vite"
import { readFileSync, existsSync } from "fs"
import { resolve, dirname, relative } from "path"

/**
 * Recipe Docs Plugin for VitePress
 *
 * Processes markdown files with:
 * - Frontmatter variable inheritance
 * - Recursive includes with variable overrides
 * - YAML-style inline variable definitions
 * - Build-time validation
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
 */

interface VariableContext {
  [key: string]: string
}

interface ProcessingContext {
  filePath: string
  includeChain: string[]
  variables: VariableContext
}

class RecipeDocsError extends Error {
  constructor(message: string, public filePath?: string) {
    super(message)
    this.name = "RecipeDocsError"
  }
}

export function recipeDocsPlugin(): Plugin {
  return {
    name: "recipe-docs",
    enforce: "pre",

    transform(code: string, id: string) {
      if (!id.endsWith(".md")) {
        return null
      }

      try {
        const processedContent = processMarkdownFile(id, code)
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

  // ============================================================================
  // Frontmatter Parsing
  // ============================================================================

  function extractFrontmatter(content: string): {
    frontmatter: VariableContext
    body: string
  } {
    const frontmatterMatch = content.match(
      /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/
    )

    if (!frontmatterMatch) {
      return { frontmatter: {}, body: content }
    }

    const yamlContent = frontmatterMatch[1]
    const body = frontmatterMatch[2]

    try {
      const frontmatter = parseYaml(yamlContent)
      return { frontmatter, body }
    } catch (error) {
      throw new RecipeDocsError(
        `Failed to parse frontmatter: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  function parseYaml(yamlContent: string): VariableContext {
    const result: VariableContext = {}
    const lines = yamlContent.split(/\r?\n/)

    let i = 0
    while (i < lines.length) {
      const line = lines[i]
      const trimmedLine = line.trim()

      if (!trimmedLine || trimmedLine.startsWith("#")) {
        i++
        continue
      }

      const colonIndex = trimmedLine.indexOf(":")
      if (colonIndex === -1) {
        i++
        continue
      }

      const key = trimmedLine.slice(0, colonIndex).trim()
      const valueStart = trimmedLine.slice(colonIndex + 1).trim()

      if (valueStart === "|" || valueStart === ">") {
        // Block scalar
        const { value, nextIndex } = parseBlockScalar(
          lines,
          i,
          line.length - line.trimStart().length,
          valueStart === "|"
        )
        result[key] = value
        i = nextIndex
      } else {
        // Simple value
        result[key] = parseSimpleValue(valueStart)
        i++
      }
    }

    return result
  }

  function parseBlockScalar(
    lines: string[],
    startIndex: number,
    baseIndent: number,
    isLiteral: boolean
  ): { value: string; nextIndex: number } {
    const blockLines: string[] = []
    let i = startIndex + 1

    while (i < lines.length) {
      const line = lines[i]
      const lineIndent = line.length - line.trimStart().length

      if (line.trim() === "") {
        blockLines.push("")
        i++
        continue
      }

      if (lineIndent > baseIndent) {
        blockLines.push(line)
        i++
      } else {
        break
      }
    }

    if (blockLines.length === 0) {
      return { value: "", nextIndex: i }
    }

    // Remove common indentation
    const nonEmptyLines = blockLines.filter((l) => l.trim())
    const minIndent = Math.min(
      ...nonEmptyLines.map((l) => l.length - l.trimStart().length)
    )

    const dedentedLines = blockLines.map((l) => {
      if (!l.trim()) return ""
      return l.slice(minIndent)
    })

    if (isLiteral) {
      return { value: dedentedLines.join("\n"), nextIndex: i }
    } else {
      // Folded scalar
      const value = dedentedLines
        .join("\n")
        .replace(/\n+/g, "\n")
        .replace(/\n/g, " ")
        .trim()
      return { value, nextIndex: i }
    }
  }

  function parseSimpleValue(value: string): string {
    if (!value) return ""

    // Strip outermost quotes (both single and double)
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      return value.slice(1, -1)
    }

    return value
  }

  // ============================================================================
  // Include Processing
  // ============================================================================

  function processIncludes(
    content: string,
    context: ProcessingContext
  ): string {
    // Match: <!--@include: path/to/file.md ... -->
    const includeRegex = /<!--@include:\s*([^\s\n]+?)(\s+[\s\S]*?)?-->/g
    const matches: Array<{
      fullMatch: string
      path: string
      inlineVars: VariableContext
      start: number
      end: number
    }> = []

    let match: RegExpExecArray | null
    while ((match = includeRegex.exec(content)) !== null) {
      const [fullMatch, pathPart, inlineVarsPart] = match

      matches.push({
        fullMatch,
        path: pathPart.trim(),
        inlineVars: parseYaml(inlineVarsPart?.trim() || ""),
        start: match.index,
        end: match.index + fullMatch.length,
      })
    }

    // Process matches in reverse to maintain string positions
    let result = content
    for (let i = matches.length - 1; i >= 0; i--) {
      const { path, inlineVars, start, end } = matches[i]
      const includedContent = loadInclude(path, inlineVars, context)
      result = result.slice(0, start) + includedContent + result.slice(end)
    }

    return result
  }

  function loadInclude(
    includePath: string,
    inlineVars: VariableContext,
    parentContext: ProcessingContext
  ): string {
    const currentDir = dirname(parentContext.filePath)
    const resolvedPath = resolve(currentDir, includePath)

    if (!existsSync(resolvedPath)) {
      const relPath = relative(process.cwd(), parentContext.filePath)
      throw new RecipeDocsError(
        `Include file not found: "${includePath}"\n  Referenced in: ${relPath}`,
        parentContext.filePath
      )
    }

    if (parentContext.includeChain.includes(resolvedPath)) {
      const chain = [...parentContext.includeChain, resolvedPath]
        .map((p) => relative(process.cwd(), p))
        .join("\n    → ")
      throw new RecipeDocsError(
        `Circular include detected:\n    ${chain}`,
        parentContext.filePath
      )
    }

    const includeContent = readFileSync(resolvedPath, "utf-8")
    const { frontmatter: includeFrontmatter, body: includeBody } =
      extractFrontmatter(includeContent)

    // Variable precedence: inline > parent > included file
    const mergedVariables: VariableContext = {
      ...includeFrontmatter,
      ...parentContext.variables,
      ...inlineVars,
    }

    const includeContext: ProcessingContext = {
      filePath: resolvedPath,
      includeChain: [...parentContext.includeChain, resolvedPath],
      variables: mergedVariables,
    }

    const processedBody = processIncludes(includeBody, includeContext)
    return interpolateVariables(processedBody, includeContext)
  }

  // ============================================================================
  // Variable Interpolation
  // ============================================================================

  function interpolateVariables(
    content: string,
    context: ProcessingContext
  ): string {
    // Handle escaped variables
    content = content.replace(/\\(\{\{\s*\$frontmatter\.[^}]+\}\})/g, "$1")

    // Identify lines with only empty variables (for removal)
    const linesToRemove = identifyEmptyVariableLines(content, context)

    // Replace all variables
    const variableRegex = /\{\{\s*\$frontmatter\.([^}]+?)\}\}/g
    const result = content.replace(variableRegex, (match, varExpr, offset) => {
      if (offset > 0 && content[offset - 1] === "\\") {
        return match
      }

      return replaceVariable(varExpr, content, offset, context)
    })

    // Remove empty variable lines and clean up spacing
    return cleanupResult(result, linesToRemove)
  }

  function identifyEmptyVariableLines(
    content: string,
    context: ProcessingContext
  ): Set<number> {
    const linesToRemove = new Set<number>()
    const lines = content.split("\n")
    const variableRegex = /\{\{\s*\$frontmatter\.([^}]+?)\}\}/g

    lines.forEach((line, lineIndex) => {
      const matches = [...line.matchAll(variableRegex)]
      if (matches.length === 0) return

      const allVariablesEmpty = matches.every((match) => {
        const varName = match[1].split(":")[0].trim()
        const value = context.variables[varName]
        return varName in context.variables && !value
      })

      const lineWithoutVars = line.replace(variableRegex, "")
      const hasOtherContent = lineWithoutVars.trim().length > 0

      if (allVariablesEmpty && !hasOtherContent) {
        linesToRemove.add(lineIndex)
      }
    })

    return linesToRemove
  }

  function replaceVariable(
    varExpr: string,
    content: string,
    offset: number,
    context: ProcessingContext
  ): string {
    const [varName, ...fallbackParts] = varExpr.split(":")
    const cleanVarName = varName.trim()
    const fallback = fallbackParts.join(":").trim()

    const hasVariable = cleanVarName in context.variables
    const value = context.variables[cleanVarName]

    let replacementValue = ""

    if (hasVariable) {
      if (value) {
        replacementValue = value
      } else {
        return ""
      }
    } else if (fallback) {
      replacementValue = fallback
    } else {
      throwUndefinedVariableError(cleanVarName, context)
    }

    // Apply indentation for multiline values
    if (replacementValue.includes("\n")) {
      return applyIndentation(replacementValue, content, offset)
    }

    return replacementValue
  }

  function applyIndentation(
    value: string,
    content: string,
    offset: number
  ): string {
    const lineStart = content.lastIndexOf("\n", offset - 1) + 1
    const lineBeforeVar = content.substring(lineStart, offset)
    const indentation = lineBeforeVar.match(/^(\s*)/)?.[1] || ""

    const valueLines = value.split("\n")
    return valueLines
      .map((line, idx) => (idx === 0 ? line : indentation + line))
      .join("\n")
  }

  function cleanupResult(result: string, linesToRemove: Set<number>): string {
    const lines = result.split("\n")
    const filteredLines = lines.filter((_, idx) => !linesToRemove.has(idx))

    // Collapse multiple spaces (but preserve leading indentation)
    const finalLines = filteredLines.map((line) =>
      line.replace(/(\S)  +/g, "$1 ")
    )

    return finalLines.join("\n")
  }

  function throwUndefinedVariableError(
    varName: string,
    context: ProcessingContext
  ): never {
    const relPath = relative(process.cwd(), context.filePath)
    const availableVars = Object.keys(context.variables).join(", ")
    throw new RecipeDocsError(
      `Undefined variable: "{{$frontmatter.${varName}}}"\n` +
        `  File: ${relPath}\n` +
        `  Available variables: ${availableVars || "(none)"}\n` +
        `  Tip: Add the variable to frontmatter (even if empty) to suppress this error`,
      context.filePath
    )
  }
}

export default recipeDocsPlugin

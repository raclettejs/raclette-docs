import { Plugin } from "vite"
import { readFileSync, existsSync } from "fs"
import { resolve, dirname } from "path"

interface VariableContext {
  [key: string]: any
}

interface IncludeMatch {
  full: string
  path: string
  inlineVars: VariableContext
  startIndex: number
  endIndex: number
}

export function recipeDocsPlugin(): Plugin {
  return {
    name: "recipe-docs",
    enforce: "pre",

    transform(code: string, id: string) {
      // Only process markdown files
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
        console.error(`[recipe-docs] Error processing ${id}:`, error)
        return null
      }
    },
  }

  function processMarkdownFile(filePath: string, content: string): string {
    // Extract frontmatter manually (simple approach)
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)

    let frontmatter: VariableContext = {}
    let markdownContent = content

    if (frontmatterMatch) {
      const yamlContent = frontmatterMatch[1]
      markdownContent = frontmatterMatch[2]

      // Parse YAML frontmatter manually (simple key-value pairs and basic structures)
      frontmatter = parseSimpleYaml(yamlContent)
    }

    // Process includes recursively
    let processedContent = processIncludes(
      markdownContent,
      filePath,
      frontmatter
    )

    // Interpolate variables in the final content
    processedContent = interpolateVariables(processedContent, frontmatter)

    // Reconstruct the file with original frontmatter
    if (frontmatterMatch) {
      return `---\n${frontmatterMatch[1]}\n---\n${processedContent}`
    }

    return processedContent
  }

  function parseSimpleYaml(yamlContent: string): VariableContext {
    const result: VariableContext = {}
    const lines = yamlContent.split("\n")

    let currentKey = ""
    let currentValue = ""
    let inMultilineValue = false
    let indentLevel = 0

    for (const line of lines) {
      const trimmedLine = line.trim()

      if (!trimmedLine || trimmedLine.startsWith("#")) {
        continue
      }

      // Check for key-value pairs
      if (trimmedLine.includes(":") && !inMultilineValue) {
        // Save previous key if exists
        if (currentKey) {
          result[currentKey] = processYamlValue(currentValue.trim())
        }

        const colonIndex = trimmedLine.indexOf(":")
        currentKey = trimmedLine.slice(0, colonIndex).trim()
        const valueStart = trimmedLine.slice(colonIndex + 1).trim()

        if (valueStart === "|" || valueStart === ">") {
          // Start of multiline value
          inMultilineValue = true
          currentValue = ""
          indentLevel = line.length - line.trimLeft().length
        } else if (valueStart === "") {
          // Empty value or start of nested structure
          currentValue = ""
          inMultilineValue = false
        } else {
          // Simple single-line value
          currentValue = valueStart
          inMultilineValue = false
        }
      } else if (inMultilineValue) {
        // Handle multiline values
        const lineIndent = line.length - line.trimLeft().length
        if (lineIndent > indentLevel || trimmedLine) {
          currentValue +=
            (currentValue ? "\n" : "") + line.slice(indentLevel + 2) // +2 for the pipe/gt char
        } else {
          // End of multiline value
          inMultilineValue = false
          result[currentKey] = currentValue.trim()
          currentKey = ""
          currentValue = ""
        }
      }
    }

    // Handle last key
    if (currentKey) {
      result[currentKey] = processYamlValue(currentValue.trim())
    }

    return result
  }

  function processYamlValue(value: string): any {
    // Handle basic YAML value types
    if (value === "true") return true
    if (value === "false") return false
    if (value === "null") return null
    if (/^\d+$/.test(value)) return parseInt(value, 10)
    if (/^\d*\.\d+$/.test(value)) return parseFloat(value)

    // Handle arrays (simple format: - item)
    if (value.includes("\n-")) {
      return value
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.startsWith("-"))
        .map((line) => line.slice(1).trim())
    }

    return value
  }

  function processIncludes(
    content: string,
    currentFilePath: string,
    baseVariables: VariableContext
  ): string {
    const includeRegex = /<!--@include:\s*([^{]+?)(?:\{([^}]*)\})?\s*-->/gs
    let processedContent = content
    const matches: IncludeMatch[] = []
    let match: RegExpExecArray | null

    // Collect all matches
    while ((match = includeRegex.exec(content)) !== null) {
      const [fullMatch, pathPart, inlineVarsPart] = match
      const path = pathPart.trim()

      // Parse inline variables
      const inlineVars: VariableContext = {}
      if (inlineVarsPart) {
        parseInlineVariables(inlineVarsPart.trim(), inlineVars)
      }

      matches.push({
        full: fullMatch,
        path,
        inlineVars,
        startIndex: match.index,
        endIndex: match.index + fullMatch.length,
      })
    }

    // Process matches in reverse order to maintain string positions
    matches.reverse().forEach((includeMatch) => {
      const includedContent = loadAndProcessInclude(
        includeMatch.path,
        currentFilePath,
        baseVariables,
        includeMatch.inlineVars
      )

      processedContent =
        processedContent.slice(0, includeMatch.startIndex) +
        includedContent +
        processedContent.slice(includeMatch.endIndex)
    })

    return processedContent
  }

  function parseInlineVariables(
    inlineVarsPart: string,
    inlineVars: VariableContext
  ) {
    // Parse inline variables as YAML-like structure
    try {
      const parsed = parseSimpleYaml(inlineVarsPart)
      Object.assign(inlineVars, parsed)
    } catch (error) {
      console.warn("[recipe-docs] Failed to parse inline variables:", error)
    }
  }

  function loadAndProcessInclude(
    includePath: string,
    currentFilePath: string,
    baseVariables: VariableContext,
    inlineVars: VariableContext
  ): string {
    // Resolve the include path relative to current file
    const currentDir = dirname(currentFilePath)
    const resolvedPath = resolve(currentDir, includePath)

    if (!existsSync(resolvedPath)) {
      console.warn(`[recipe-docs] Include file not found: ${includePath}`)
      return `<!-- Include not found: ${includePath} -->`
    }

    // Read and process the include file
    const includeContent = readFileSync(resolvedPath, "utf-8")
    const processedInclude = processMarkdownFile(resolvedPath, includeContent)

    // Extract frontmatter from processed include for variable context
    const frontmatterMatch = processedInclude.match(
      /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
    )
    let includeFrontmatter: VariableContext = {}
    let includeMarkdown = processedInclude

    if (frontmatterMatch) {
      includeFrontmatter = parseSimpleYaml(frontmatterMatch[1])
      includeMarkdown = frontmatterMatch[2]
    }

    // Create merged variable context with proper fallback inheritance
    const mergedVariables: VariableContext = {
      ...includeFrontmatter, // Fallback values from include file
      ...baseVariables, // Variables from parent context
      ...inlineVars, // Inline variables have highest precedence
    }

    // Interpolate variables in the included content (without frontmatter)
    return interpolateVariables(includeMarkdown, mergedVariables)
  }

  function interpolateVariables(
    content: string,
    variables: VariableContext
  ): string {
    // Split into lines for processing
    const lines = content.split("\n")

    const processedLines = lines.map((line) => {
      // Check if line contains only whitespace and a single variable
      const variableMatches = [
        ...line.matchAll(/\{\{\$frontmatter\.([^}]+)\}\}/g),
        ...line.matchAll(/__([A-Z_][A-Z0-9_]*)__/g),
      ]

      // If line has only one variable and nothing else meaningful, handle specially
      if (variableMatches.length === 1) {
        const restOfLine = line
          .replace(/\{\{\$frontmatter\.([^}]+)\}\}/g, "")
          .replace(/__([A-Z_][A-Z0-9_]*)__/g, "")
          .trim()

        if (restOfLine === "" || /^[\s,]*$/.test(restOfLine)) {
          // Line contains only the variable (and maybe whitespace/comma)
          const match = variableMatches[0]
          const varName = match[1]
          const value = getVariableValue(varName, variables)

          if (value.length === 0) {
            // Return null to indicate this line should be removed
            return null
          }
        }
      }

      // Regular replacement for all other cases
      return line
        .replace(/\{\{\$frontmatter\.([^}]+)\}\}/g, (match, varName) => {
          return replaceVariable(match, varName, variables)
        })
        .replace(/__([A-Z_][A-Z0-9_]*)__/g, (match, varName) => {
          return replaceVariable(match, varName, variables)
        })
    })

    // Filter out null lines (empty variables on their own lines)
    return processedLines.filter((line) => line !== null).join("\n")
  }

  function getVariableValue(
    varName: string,
    variables: VariableContext
  ): string {
    const [primaryVar, ...fallbackParts] = varName.split(":")
    const cleanVarName = primaryVar.trim()
    const fallback = fallbackParts.join(":").trim()

    const value = variables[cleanVarName]
    let stringValue = value !== undefined && value !== null ? String(value) : ""

    // Handle YAML block scalars - remove trailing newlines for inline usage
    stringValue = stringValue.replace(/\n+$/, "")

    if (stringValue.length > 0) {
      return stringValue
    } else if (fallback) {
      return fallback
    } else {
      return ""
    }
  }

  function replaceVariable(
    match: string,
    varName: string,
    variables: VariableContext
  ): string {
    const value = getVariableValue(varName, variables)

    if (value.length === 0) {
      console.log(
        `[recipe-docs] Variable '${varName
          .split(":")[0]
          .trim()}' is empty - replacing with empty string`
      )
    }

    return value
  }
}

export default recipeDocsPlugin

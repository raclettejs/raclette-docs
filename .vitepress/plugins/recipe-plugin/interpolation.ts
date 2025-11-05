import { relative } from "path"
import { ProcessingContext } from "./types"
import { RecipeDocsError } from "./utils"

export function interpolateVariables(
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

import { VariableContext, FrontmatterResult } from "./types"
import { RecipeDocsError } from "./utils"

export function extractFrontmatter(content: string): FrontmatterResult {
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

export function parseYaml(yamlContent: string): VariableContext {
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

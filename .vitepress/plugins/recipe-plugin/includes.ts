import { readFileSync, existsSync } from "fs"
import { resolve, dirname, relative } from "path"
import { ProcessingContext, VariableContext } from "./types"
import { RecipeDocsError } from "./utils"
import { extractFrontmatter, parseYaml } from "./frontmatter"
import { interpolateVariables } from "./interpolation"

export function processIncludes(
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

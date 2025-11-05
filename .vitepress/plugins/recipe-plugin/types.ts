export interface VariableContext {
  [key: string]: string
}

export interface ProcessingContext {
  filePath: string
  includeChain: string[]
  variables: VariableContext
}

export interface RecipeDocsPluginOptions {
  exportCompiled?: boolean
  exportPath?: string
  exportExclude?: string[] | ((filePath: string) => boolean)
}

export interface FrontmatterResult {
  frontmatter: VariableContext
  body: string
}

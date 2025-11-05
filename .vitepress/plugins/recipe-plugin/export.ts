import { writeFileSync, mkdirSync, existsSync } from "fs"
import { dirname, relative, resolve, join } from "path"
import {
  stripVitePressComponents,
  cleanupExtraWhitespace,
  shouldExcludeFile,
} from "./utils"

export class CompiledDocsExporter {
  private exportPath: string
  private sourceRoot: string
  private processedFiles = new Map<string, string>()
  private excludeFilter?: string[] | ((filePath: string) => boolean)

  constructor(
    exportPath: string,
    excludeFilter?: string[] | ((filePath: string) => boolean)
  ) {
    this.exportPath = resolve(process.cwd(), exportPath)
    // Assume source root is where .vitepress folder is located
    this.sourceRoot = resolve(process.cwd())
    this.excludeFilter = excludeFilter
  }

  /**
   * Register a processed markdown file for export
   */
  registerFile(filePath: string, compiledContent: string): void {
    this.processedFiles.set(filePath, compiledContent)
  }

  /**
   * Export a single file immediately (useful during transform)
   */
  exportFile(filePath: string, compiledContent: string): void {
    // Check if file should be excluded
    if (shouldExcludeFile(filePath, this.excludeFilter)) {
      return
    }

    const cleanedContent = this.prepareForExport(compiledContent)
    const outputPath = this.getOutputPath(filePath)

    this.writeFile(outputPath, cleanedContent)
  }

  /**
   * Export all registered files (useful for batch processing)
   */
  exportAll(): void {
    for (const [filePath, content] of this.processedFiles) {
      this.exportFile(filePath, content)
    }
  }

  /**
   * Prepare content for export by removing VitePress-specific syntax
   */
  private prepareForExport(content: string): string {
    let cleaned = content

    // Strip VitePress components and directives
    cleaned = stripVitePressComponents(cleaned)

    // Clean up extra whitespace
    cleaned = cleanupExtraWhitespace(cleaned)

    return cleaned
  }

  /**
   * Calculate output path maintaining directory structure
   */
  private getOutputPath(sourcePath: string): string {
    const relativePath = relative(this.sourceRoot, sourcePath)
    return join(this.exportPath, relativePath)
  }

  /**
   * Write file to disk, creating directories as needed
   */
  private writeFile(outputPath: string, content: string): void {
    const dir = dirname(outputPath)

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }

    writeFileSync(outputPath, content, "utf-8")
  }

  /**
   * Get statistics about exported files
   */
  getStats(): { totalFiles: number; exportPath: string } {
    return {
      totalFiles: this.processedFiles.size,
      exportPath: this.exportPath,
    }
  }
}

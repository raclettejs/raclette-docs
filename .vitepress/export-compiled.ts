#!/usr/bin/env node
/**
 * Standalone script to export compiled markdown files without building VitePress
 *
 * Usage:
 *   npx tsx export-compiled.ts
 *   yarn tsx export-compiled.ts
 */

import { readdirSync, statSync } from "fs"
import { join, relative } from "path"
import { recipeDocsPlugin } from "./plugins/recipe-plugin"

interface ExportConfig {
  sourceDir: string
  exportPath: string
  exportExclude?: string[] | ((filePath: string) => boolean)
}

const config: ExportConfig = {
  sourceDir: ".", // Root directory to scan for .md files
  exportPath: "./compiled-docs",
  exportExclude: [
    "index.md",
    "README.md",
    "LICENSE.md",
    "node_modules/**",
    ".vitepress/**",
    "dist/**",
  ],
}

async function findMarkdownFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = []
  const entries = readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    const relativePath = relative(baseDir, fullPath)

    // Skip excluded directories
    if (entry.isDirectory()) {
      if (
        entry.name === "node_modules" ||
        entry.name === ".vitepress" ||
        entry.name === "dist" ||
        entry.name === ".git" ||
        entry.name === "compiled-docs"
      ) {
        continue
      }
      files.push(...(await findMarkdownFiles(fullPath, baseDir)))
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath)
    }
  }

  return files
}

async function exportCompiledDocs() {
  console.log("🚀 Starting compiled markdown export...\n")

  const startTime = Date.now()
  const markdownFiles = await findMarkdownFiles(config.sourceDir)

  console.log(`📄 Found ${markdownFiles.length} markdown files\n`)

  // Create a mock Vite plugin context
  const plugin = recipeDocsPlugin({
    exportCompiled: true,
    exportPath: config.exportPath,
    exportExclude: config.exportExclude,
  })

  // Initialize the plugin
  if (plugin.buildStart) {
    const mockContext = {
      info: (msg: string) => console.log(msg),
      error: (msg: string | Error) => console.error("❌", msg),
      warn: (msg: string) => console.warn("⚠️", msg),
    }
    plugin.buildStart.call(mockContext)
  }

  // Process each file
  let processed = 0
  let skipped = 0

  for (const filePath of markdownFiles) {
    try {
      const fs = await import("fs/promises")
      const code = await fs.readFile(filePath, "utf-8")

      if (plugin.transform) {
        const mockContext = {
          error: (msg: string | Error) => {
            throw new Error(typeof msg === "string" ? msg : msg.message)
          },
        }
        await plugin.transform.call(mockContext, code, filePath)
        processed++

        const relPath = relative(process.cwd(), filePath)
        console.log(`✓ ${relPath}`)
      }
    } catch (error) {
      skipped++
      const relPath = relative(process.cwd(), filePath)
      console.error(`✗ ${relPath}`)
      if (error instanceof Error) {
        console.error(`  ${error.message}\n`)
      }
    }
  }

  // Finalize
  if (plugin.buildEnd) {
    const mockContext = {
      info: (msg: string) => console.log("\n" + msg),
    }
    plugin.buildEnd.call(mockContext)
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2)
  console.log(`\n⏱️  Completed in ${duration}s`)
  console.log(`✅ Processed: ${processed} files`)
  if (skipped > 0) {
    console.log(`⚠️  Skipped: ${skipped} files`)
  }
}

// Run the export
exportCompiledDocs().catch((error) => {
  console.error("❌ Export failed:", error)
  process.exit(1)
})

import { pathToFileURL } from 'node:url'
import { existsSync, promises as fsp, readFileSync } from 'node:fs'
import { cpus } from 'node:os'
import { join, relative, resolve } from 'pathe'
import { createRouter as createRadixRouter, exportMatcher, toRouteMatcher } from 'radix3'
import { joinURL, withTrailingSlash } from 'ufo'
import { build, copyPublicAssets, createDevServer, createNitro, prepare, prerender, writeTypes } from 'nitro'
import type { Nitro, NitroConfig, NitroOptions } from 'nitro/types'
import { createIsIgnored, findPath, logger, resolveAlias, resolveIgnorePatterns, resolveNuxtModule } from '@nuxt/kit'
import escapeRE from 'escape-string-regexp'
import { defu } from 'defu'
import { dynamicEventHandler } from 'h3'
import { isWindows } from 'std-env'
import { ImpoundPlugin } from 'impound'
import type { Nuxt, NuxtOptions } from 'nuxt/schema'
import { resolveModulePath } from 'exsolve'
import { NitroRollupConfig } from '../../schema/src/config/nitro'

export async function createNitroApp(nuxt: Nuxt): Promise<Nitro> {
  const nitroConfig: NitroConfig = defu(nuxt.options.nitro, {
    // Default Nitro configuration
    debug: nuxt.options.debug,
    rootDir: nuxt.options.rootDir,
    workspaceDir: nuxt.options.workspaceDir,
    srcDir: nuxt.options.serverDir,
    dev: nuxt.options.dev,
    buildDir: resolve(nuxt.options.buildDir, 'nitro'),

    // Use the separate NitroRollupConfig interface to avoid type instantiation depth issues
    rollupConfig: {
      output: {},
      plugins: []
    } as NitroRollupConfig,

    // Other default configuration options
    // ...
  })

  // Register nuxt protection patterns
  nitroConfig.rollupConfig = nitroConfig.rollupConfig || { output: {}, plugins: [] }
  const rollupPlugins = (nitroConfig.rollupConfig.plugins = nitroConfig.rollupConfig.plugins || [])
  nitroConfig.rollupConfig.plugins = Array.isArray(rollupPlugins) ? rollupPlugins : [rollupPlugins]

  const sharedDir = withTrailingSlash(resolve(nuxt.options.rootDir, nuxt.options.dir.shared))
  const relativeSharedDir = withTrailingSlash(relative(nuxt.options.rootDir, resolve(nuxt.options.rootDir, nuxt.options.dir.shared)))

  // Create and return the Nitro instance
  const nitro = await createNitro(nitroConfig)

  // ... rest of the implementation

  return nitro
}
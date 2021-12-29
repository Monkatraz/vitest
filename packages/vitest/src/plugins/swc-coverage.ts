import { createRequire } from 'module'
import type { Plugin, ResolvedConfig, UserConfig } from 'vite'
import type SWC from '@swc/core'

const scriptRegexp = /\.[tj]sx?$/

const require = createRequire(import.meta.url)

function isEnabled(config: UserConfig | ResolvedConfig) {
  return process.env.NODE_V8_COVERAGE && config.test?.coverage?.swc
}

function makeSWCConfig(id: string): SWC.Options {
  return {
    configFile: false,
    filename: id,
    sourceMaps: true,
    jsc: {
      target: 'es2022',
      keepClassNames: true,
      parser: {
        syntax: 'typescript',
        decorators: true,
      },
      minify: {
        // @ts-ignore - not in swc node types, but still valid
        format: { comments: 'all' },
        keepFnames: true,
        keepClassnames: true,
      },
    },
  }
}

export const SWCCoveragePlugin = (): Plugin => {
  let config: ResolvedConfig

  return {
    name: 'vitest:swc-coverage-plugin',
    enforce: 'pre',

    config(config) {
      if (isEnabled(config)) return { esbuild: false }
    },

    configResolved(resolved) {
      config = resolved
    },

    async transform(code, id) {
      if (!isEnabled(config) || !scriptRegexp.test(id)) return
      const swc: typeof SWC = require('@swc/core')
      const result = await swc.transform(code, makeSWCConfig(id))
      return { code: result.code, map: result.map }
    },
  }
}

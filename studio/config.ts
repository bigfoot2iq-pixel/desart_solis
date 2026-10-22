import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemaTypes'
import {SINGLETONS, structure} from './structure'

type StudioConfigOptions = {
  projectId: string
  dataset: string
  /** Only set when the Studio is mounted inside another app (e.g. Next.js). */
  basePath?: string
}

/**
 * The single source of truth for the Studio configuration.
 *
 * `sanity.config.ts` in `studio/` uses it for the standalone/hosted Studio, and
 * the Next.js app mounts the same config at `/admin`, so the content model and
 * the desk structure can never drift apart.
 */
export function createStudioConfig({projectId, dataset, basePath}: StudioConfigOptions) {
  return defineConfig({
    name: 'default',
    title: 'Desart Solis',
    ...(basePath ? {basePath} : {}),
    projectId,
    dataset,
    plugins: [structureTool({structure}), visionTool()],
    schema: {
      types: schemaTypes,
      // Settings is a single document: hide it from "Create new"
      templates: (templates) => templates.filter(({schemaType}) => !SINGLETONS.includes(schemaType)),
    },
    document: {
      actions: (actions, {schemaType}) =>
        SINGLETONS.includes(schemaType)
          ? actions.filter(({action}) => action && ['publish', 'discardChanges', 'restore'].includes(action))
          : actions,
    },
  })
}

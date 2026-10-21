import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemaTypes'
import {SINGLETONS, structure} from './structure'

export default defineConfig({
  name: 'default',
  title: 'Desart Solis',
  projectId: '6d0ozc5q',
  dataset: 'production',
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

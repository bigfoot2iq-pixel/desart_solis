import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '6d0ozc5q',
    dataset: 'production',
  },
  deployment: {
    appId: 'xmeyfx7yupt5tbdobzug8brb',
    autoUpdates: true,
  },
  studioHost: 'desart-solis',
  typegen: {
    path: ['../app/**/*.{ts,tsx}', '../sanity/**/*.ts'],
    schema: 'schema.json',
    generates: '../sanity.types.ts',
    overloadClientMethods: true,
  },
})

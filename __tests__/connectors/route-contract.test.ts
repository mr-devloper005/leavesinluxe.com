import fs from 'node:fs'
import path from 'node:path'
import { assertContract } from '../helpers/contract'

const requiredRoutes = [
  'src/app/article/[slug]/page.tsx',
  'src/app/listing/[slug]/page.tsx',
  'src/app/image/[slug]/page.tsx',
  'src/app/classified/[slug]/page.tsx',
  'src/app/sbm/[slug]/page.tsx',
  'src/app/pdf/[slug]/page.tsx',
  'src/app/api/health/route.ts',
]

describe('legacy singular route contract', () => {
  it('keeps backlink-compatible singular detail routes available', () => {
    assertContract(
      requiredRoutes.map((route) => ({
        name: `Required route exists: ${route}`,
        pass: fs.existsSync(path.join(process.cwd(), route)),
        expected: 'Route wrapper/page file exists',
        actual: fs.existsSync(path.join(process.cwd(), route)) ? 'exists' : 'missing',
        hint: 'Do not remove singular detail routes; old backlinks use /article, /listing, /image, /classified, /sbm, and /pdf. /api/health is required for deploy verification.',
        file: route,
      })),
    )
  })
})

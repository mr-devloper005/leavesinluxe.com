import { getVisualPreset, visualPresets, visualSystem } from '@/editable/theme/visual-system'
import { slot4BrandConfig } from '@/editable/theme/brand.config'
import { assertContract, isHexColor, isNonEmptyString } from '../helpers/contract'

describe('editable visual system contract', () => {
  it('keeps brand identity available', () => {
    assertContract([
      {
        name: 'Brand siteName is required',
        pass: isNonEmptyString(slot4BrandConfig.siteName),
        expected: 'slot4BrandConfig.siteName is a non-empty string',
        actual: slot4BrandConfig.siteName,
        hint: 'Keep brand.config.ts connected to site identity. Do not hard-delete siteName.',
        file: 'src/editable/theme/brand.config.ts',
      },
      {
        name: 'Brand domain is required',
        pass: isNonEmptyString(slot4BrandConfig.domain),
        expected: 'slot4BrandConfig.domain is a non-empty string',
        actual: slot4BrandConfig.domain,
        hint: 'Keep domain available for copy, metadata, and footer content.',
        file: 'src/editable/theme/brand.config.ts',
      },
      {
        name: 'Brand productKind is required',
        pass: isNonEmptyString(slot4BrandConfig.productKind),
        expected: 'directory/editorial/visual/curation-style product kind',
        actual: slot4BrandConfig.productKind,
        hint: 'Do not remove productKind; page tone logic uses it.',
        file: 'src/editable/theme/brand.config.ts',
      },
      {
        name: 'Primary accent must be a hex color',
        pass: isHexColor(slot4BrandConfig.accents.primary),
        expected: 'Hex color like #0f172a',
        actual: slot4BrandConfig.accents.primary,
        hint: 'Use a valid hex color for accents.primary.',
        file: 'src/editable/theme/brand.config.ts',
      },
    ])
  })

  it('keeps recommended preset valid', () => {
    const preset = getVisualPreset()
    assertContract([
      {
        name: 'Recommended preset does not exist',
        pass: Object.keys(visualPresets).includes(visualSystem.recommendedPreset),
        expected: `One of: ${Object.keys(visualPresets).join(', ')}`,
        actual: visualSystem.recommendedPreset,
        hint: 'Update visualSystem.recommendedPreset to an existing key in visualPresets.',
        file: 'src/editable/theme/visual-system.ts',
      },
      {
        name: 'Preset label is required',
        pass: isNonEmptyString(preset.label),
        expected: 'preset.label is a non-empty string',
        actual: preset.label,
        hint: 'Every visual preset needs a readable label for editors.',
        file: 'src/editable/theme/visual-system.ts',
      },
      {
        name: 'Preset background color must be hex',
        pass: isHexColor(preset.colors.background),
        expected: 'Hex color like #f7efe3',
        actual: preset.colors.background,
        hint: 'Use valid hex color tokens in visual presets.',
        file: 'src/editable/theme/visual-system.ts',
      },
      {
        name: 'Preset foreground color must be hex',
        pass: isHexColor(preset.colors.foreground),
        expected: 'Hex color like #201711',
        actual: preset.colors.foreground,
        hint: 'Use valid hex color tokens in visual presets.',
        file: 'src/editable/theme/visual-system.ts',
      },
    ])
  })

  it('keeps layout and motion tokens for UI redesigns', () => {
    assertContract([
      {
        name: 'Layout page container token changed unexpectedly',
        pass: visualSystem.layout.page.includes('max-w-7xl'),
        expected: 'visualSystem.layout.page includes max-w-7xl',
        actual: visualSystem.layout.page,
        hint: 'Keep a stable page container token. You can style pages, but base spacing contract should stay available.',
        file: 'src/editable/theme/visual-system.ts',
      },
      {
        name: 'Page load motion token missing animate-in',
        pass: visualSystem.motion.pageLoad.includes('animate-in'),
        expected: 'visualSystem.motion.pageLoad includes animate-in',
        actual: visualSystem.motion.pageLoad,
        hint: 'Keep pageLoad as an animation utility string or update tests with a deliberate new motion contract.',
        file: 'src/editable/theme/visual-system.ts',
      },
      {
        name: 'Hero title typography token changed unexpectedly',
        pass: visualSystem.typography.heroTitle.includes('text-5xl'),
        expected: 'visualSystem.typography.heroTitle includes text-5xl',
        actual: visualSystem.typography.heroTitle,
        hint: 'Keep a large hero title baseline so AI redesigns do not collapse visual hierarchy.',
        file: 'src/editable/theme/visual-system.ts',
      },
    ])
  })
})

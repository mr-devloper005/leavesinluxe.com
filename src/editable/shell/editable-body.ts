import type { CSSProperties } from 'react'

import { getFactoryState } from '@/design/factory/get-factory-state'
import { editableRootStyle } from '@/editable/layouts/design-contract'

export type EditableBodyProps = {
  dataSiteShell: string
  dataMotionPack: string
  className: string
  style: CSSProperties
}

export function getEditableBodyProps(): EditableBodyProps {
  const { recipe, brandPack } = getFactoryState()

  return {
    dataSiteShell: recipe.homeLayout,
    dataMotionPack: recipe.motionPack,
    className: `${brandPack.bodyClassName} ${brandPack.fontClassName} ${brandPack.paletteClassName}`,
    style: editableRootStyle,
  }
}

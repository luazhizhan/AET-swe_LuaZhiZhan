export type Position =
  | 't1'
  | 't2'
  | 't3'
  | 'm1'
  | 'm2'
  | 'm3'
  | 'l1'
  | 'l2'
  | 'l3'

export const boxPositionAria = (position: Position) => {
  switch (position) {
    case 't1':
      return 'top left'
    case 't2':
      return 'top center'
    case 't3':
      return 'top right'
    case 'm1':
      return 'middle left'
    case 'm2':
      return 'middle center'
    case 'm3':
      return 'middle right'
    case 'l1':
      return 'bottom left'
    case 'l2':
      return 'bottom center'
    case 'l3':
      return 'bottom right'
  }
}

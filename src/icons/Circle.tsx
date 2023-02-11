import * as React from 'react'

const Circle = (
  props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>
) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" {...props}>
    <path d="M224 96a160 160 0 1 0 0 320 160 160 0 1 0 0-320zm224 160a224 224 0 1 1-448 0 224 224 0 1 1 448 0z" />
  </svg>
)

export default Circle

import { ComponentProps } from 'react'
import { tv, VariantProps } from 'tailwind-variants'

const label = tv({
  base: 'text-xs font-normal text-gray-500 peer-focus:font-bold peer-active:font-bold',
  variants: {
    inputStatus: {
      normal: 'peer-focus:text-blue-base peer-active:text-blue-base',
      error:
        'peer-focus:text-danger peer-active:text-danger text-danger font-bold',
    },
  },
  defaultVariants: {
    inputStatus: 'normal',
  },
})

export type LabelProps = ComponentProps<'label'> &
  VariantProps<typeof label> & {
    inputId: string
    inputStatus?: string
  }

export const Label = ({
  inputId,
  className,
  inputStatus,
  ...props
}: LabelProps) => {
  return (
    <label
      htmlFor={inputId}
      className={label({ inputStatus, className })}
      {...props}
    >
      {props.children}
    </label>
  )
}

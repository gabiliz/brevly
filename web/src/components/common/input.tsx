import { ComponentProps } from 'react'
import { tv, VariantProps } from 'tailwind-variants'

const input = tv({
  base: 'peer text-md rounded-lg border p-4 font-normal placeholder:text-gray-400',
  variants: {
    inputStatus: {
      normal: 'focus:border-blue-base active:border-blue-base border-gray-300',
      error: 'border-danger focus:border-danger active:border-danger',
    },
  },
  defaultVariants: {
    inputStatus: 'normal',
  },
})

export type InputProps = ComponentProps<'input'> &
  VariantProps<typeof input> & {
    inputId: string
    inputStatus?: string
    value?: string | number
  }

export const Input = ({
  inputId,
  className,
  inputStatus,
  ...props
}: InputProps) => {
  return (
    <input
      id={inputId}
      className={input({ inputStatus, className })}
      {...props}
    />
  )
}

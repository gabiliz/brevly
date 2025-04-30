import { ComponentProps, ReactNode, useRef } from 'react'
import { tv, VariantProps } from 'tailwind-variants'
import { Spinner } from '@phosphor-icons/react/dist/icons/Spinner'

const button = tv({
  base: 'flex cursor-pointer items-center justify-center rounded-lg border border-transparent font-sans duration-100 ease-in-out',
  variants: {
    variant: {
      primary: 'bg-blue-base hover:bg-blue-dark text-white',
      secondary:
        'hover:border-blue-base bg-gray-200 text-sm text-gray-500 hover:border',
    },
    disabled: {
      true: 'bg-blue-base/50 cursor-not-allowed hover:border-none',
    },
    loading: { true: 'cursor-wait' },
  },
  compoundVariants: [
    {
      disabled: true,
      variant: 'secondary',
      class: 'cursor-not-allowed bg-gray-200/50 text-gray-500/50',
    },
  ],
  defaultVariants: {
    variant: 'primary',
    disabled: false,
    loading: false,
  },
})

export type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof button> & {
    children: ReactNode
    loading?: boolean
  }

export const Button = ({
  variant,
  disabled,
  loading,
  children,
  className,
  ...props
}: ButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null)

  return (
    <button
      ref={buttonRef}
      disabled={disabled || loading}
      className={button({
        variant,
        disabled: disabled || loading,
        loading,
        className,
      })}
      {...props}
    >
      {loading && (
        <Spinner
          size={16}
          className={`${variant === 'primary' ? 'text-white' : 'text-gray-600'} mr-2 animate-spin`}
        />
      )}
      {children}
    </button>
  )
}

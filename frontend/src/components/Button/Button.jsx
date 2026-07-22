import clsx from 'clsx'

function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  loading = false,
  children,
  ...props
}) {
  const buttonType = Component === 'button' ? type : undefined

  return (
    <Component
      type={buttonType}
      className={clsx('btn', `btn-${variant}`, size === 'sm' && 'btn-sm', className)}
      disabled={Component === 'button' ? loading || props.disabled : undefined}
      {...props}
    >
      {loading ? 'Please wait...' : children}
    </Component>
  )
}

export default Button
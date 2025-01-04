interface LabelProps {
  label: string
}

export const Label = ( props: LabelProps ) => {
  return (
    <label className="block text-xs text-gray-500 font-medium mb-2">{props.label}</label>
  )
}

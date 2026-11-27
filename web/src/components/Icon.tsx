// Icono de Pictogrammers (Material Design Icons, paquete @mdi/js).
// Un solo trazo relleno, de UN color: toma el color del texto que lo rodea (currentColor).
// Tamaño por defecto: 24px, la rejilla en la que están dibujados. Ver design-system/README.md → Icons.
export function Icon({ path, size = 24, className }: { path: string; size?: number; className?: string }) {
  return (
    <svg className={className ? `icon ${className}` : 'icon'} viewBox="0 0 24 24" width={size} height={size}
      aria-hidden="true" focusable="false">
      <path d={path} />
    </svg>
  )
}

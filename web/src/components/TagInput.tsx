import { useState } from 'react'

// Campo para escribir palabras sueltas y convertirlas en etiquetas.
export function TagInput({ id, values, onChange, placeholder }: {
  id: string
  values: string[]
  onChange: (v: string[]) => void
  placeholder: string
}) {
  const [text, setText] = useState('')
  const add = () => {
    const word = text.trim()
    if (word && !values.some((v) => v.toLowerCase() === word.toLowerCase())) onChange([...values, word])
    setText('')
  }
  return (
    <div>
      <form className="tag-form" onSubmit={(e) => { e.preventDefault(); add() }}>
        <input id={id} className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} autoComplete="off" />
        <button className="btn" type="submit" disabled={!text.trim()}>Añadir</button>
      </form>
      {values.length > 0 && (
        <ul className="chips" aria-label="Palabras añadidas">
          {values.map((v) => (
            <li key={v}>
              <button className="chip chip-removable" onClick={() => onChange(values.filter((x) => x !== v))} aria-label={`Quitar ${v}`}>
                {v} <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

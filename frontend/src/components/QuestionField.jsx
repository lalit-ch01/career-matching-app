// Renders one assessment question.
//   type 'single' -> radio buttons, value is a string
//   type 'multi'  -> checkboxes, value is an array of strings
//   type 'scale'  -> radio buttons 1-5 laid out in a row, value is a string
//                    (behaves like 'single', just rendered differently)
// It is a "controlled" component: the parent (Assessment page) owns the answer
// and passes it in through `value`; changes are reported through `onChange`.
function QuestionField({ question, value, error, onChange }) {
  const { id, type, label, help, options, maxSelect, minLabel, maxLabel } = question
  const isMulti = type === 'multi'
  const isScale = type === 'scale'

  function handleChange(optionValue) {
    if (!isMulti) {
      onChange(id, optionValue)
      return
    }
    const alreadySelected = value.includes(optionValue)
    if (alreadySelected) {
      onChange(id, value.filter((v) => v !== optionValue))
    } else if (!maxSelect || value.length < maxSelect) {
      onChange(id, [...value, optionValue])
    }
  }

  return (
    <fieldset className="question">
      <legend className="question-label">{label}</legend>
      {help && <p className="question-help">{help}</p>}

      {isScale && (minLabel || maxLabel) && (
        <div className="scale-captions">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}

      <div className={`option-list${isScale ? ' option-list-scale' : ''}`}>
        {options.map((option) => {
          const checked = isMulti ? value.includes(option.value) : value === option.value
          // Once the limit is reached, the remaining checkboxes are disabled.
          const disabled = isMulti && maxSelect && !checked && value.length >= maxSelect
          return (
            <label key={option.value} className={`option${checked ? ' option-selected' : ''}`}>
              <input
                type={isMulti ? 'checkbox' : 'radio'}
                name={id}
                value={option.value}
                checked={checked}
                disabled={disabled}
                onChange={() => handleChange(option.value)}
              />
              <span>{option.label}</span>
            </label>
          )
        })}
      </div>

      {error && (
        <p className="question-error" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  )
}

export default QuestionField

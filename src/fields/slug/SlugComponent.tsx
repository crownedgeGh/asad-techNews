'use client'

import React, { useEffect, useState } from 'react'
import { Button, FieldLabel, TextInput, useField, useFormFields } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'

import { formatSlug } from './formatSlug'

const SOURCE_FIELD = 'title'

export const SlugComponent: TextFieldClientComponent = ({ field, path }) => {
  const { value, setValue } = useField<string>({ path })
  const [locked, setLocked] = useState(!value)

  const sourceValue = useFormFields(([fields]) => fields[SOURCE_FIELD]?.value as string)

  useEffect(() => {
    if (!locked || !sourceValue) return
    const formatted = formatSlug(sourceValue)
    if (formatted !== value) setValue(formatted)
  }, [sourceValue, locked, value, setValue])

  return (
    <div className="field-type slug-field-component">
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 'calc(var(--base) * 0.2)',
        }}
      >
        <FieldLabel htmlFor={`field-${path}`} label={field.label ?? 'Slug'} required={field.required} />
        <Button buttonStyle="none" onClick={() => setLocked((prev) => !prev)} size="xsmall">
          {locked ? 'Unlock' : 'Auto-generate'}
        </Button>
      </div>
      <TextInput
        path={path}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setLocked(false)
          setValue(e.target.value)
        }}
      />
    </div>
  )
}

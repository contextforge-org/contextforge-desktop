import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import type { ParsedField } from '../lib/toolTestUtils';

interface ToolTestFormFieldProps {
  field: ParsedField;
  value: any;
  arrayValues?: string[];
  onChange: (value: any) => void;
  onArrayChange?: (values: string[]) => void;
}

export function ToolTestFormField({
  field,
  value,
  arrayValues,
  onChange,
  onArrayChange,
}: ToolTestFormFieldProps) {
  const { theme } = useTheme();

  const inputClassName = `w-full px-3 py-2 rounded-md border transition-colors ${
    theme === 'dark'
      ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:border-cyan-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-cyan-500'
  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`;

  const labelClassName = `block text-sm font-medium mb-2 ${
    theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
  }`;

  const descriptionClassName = `text-xs mb-2 ${
    theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
  }`;

  // Render field based on type
  switch (field.type) {
    case 'boolean':
      return (
        <div>
          <label className={labelClassName}>
            {field.name}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.description && (
            <p className={descriptionClassName}>{field.description}</p>
          )}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value === true || value === 'true'}
              onChange={(e) => onChange(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
            />
            <span className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}>
              {value === true || value === 'true' ? 'True' : 'False'}
            </span>
          </div>
        </div>
      );

    case 'enum':
      return (
        <div>
          <label className={labelClassName}>
            {field.name}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.description && (
            <p className={descriptionClassName}>{field.description}</p>
          )}
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={inputClassName}
          >
            <option value="">Select an option...</option>
            {field.enumValues?.map((enumValue) => (
              <option key={String(enumValue)} value={String(enumValue)}>
                {String(enumValue)}
              </option>
            ))}
          </select>
        </div>
      );

    case 'array':
      return (
        <div>
          <label className={labelClassName}>
            {field.name}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.description && (
            <p className={descriptionClassName}>{field.description}</p>
          )}
          <div className="space-y-2">
            {(arrayValues || ['']).map((item, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type={field.itemType === 'number' || field.itemType === 'integer' ? 'number' : 'text'}
                  value={item}
                  onChange={(e) => {
                    const newValues = [...(arrayValues || [''])];
                    newValues[index] = e.target.value;
                    onArrayChange?.(newValues);
                  }}
                  placeholder={`${field.name} item ${index + 1}`}
                  className={inputClassName}
                />
                {(arrayValues || ['']).length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newValues = (arrayValues || ['']).filter((_, i) => i !== index);
                      onArrayChange?.(newValues);
                    }}
                    className={`p-2 rounded-md transition-colors ${
                      theme === 'dark'
                        ? 'hover:bg-zinc-800 text-zinc-400'
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newValues = [...(arrayValues || ['']), ''];
                onArrayChange?.(newValues);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                theme === 'dark'
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Plus size={16} />
              Add Item
            </button>
          </div>
        </div>
      );

    case 'object':
      return (
        <div>
          <label className={labelClassName}>
            {field.name}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.description && (
            <p className={descriptionClassName}>{field.description}</p>
          )}
          <textarea
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder='{"key": "value"}'
            rows={4}
            className={inputClassName}
          />
          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-500'}`}>
            Enter valid JSON object
          </p>
        </div>
      );

    case 'number':
    case 'integer':
      return (
        <div>
          <label className={labelClassName}>
            {field.name}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.description && (
            <p className={descriptionClassName}>{field.description}</p>
          )}
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.description || `Enter ${field.name}`}
            min={field.validation?.min}
            max={field.validation?.max}
            step={field.type === 'integer' ? 1 : 'any'}
            className={inputClassName}
          />
          {(field.validation?.min !== undefined || field.validation?.max !== undefined) && (
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-500'}`}>
              {field.validation.min !== undefined && field.validation.max !== undefined
                ? `Range: ${field.validation.min} - ${field.validation.max}`
                : field.validation.min !== undefined
                ? `Minimum: ${field.validation.min}`
                : `Maximum: ${field.validation.max}`}
            </p>
          )}
        </div>
      );

    default: // string
      return (
        <div>
          <label className={labelClassName}>
            {field.name}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.description && (
            <p className={descriptionClassName}>{field.description}</p>
          )}
          <input
            type="text"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.description || `Enter ${field.name}`}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
            pattern={field.validation?.pattern}
            className={inputClassName}
          />
          {(field.validation?.minLength !== undefined || field.validation?.maxLength !== undefined) && (
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-500'}`}>
              {field.validation.minLength !== undefined && field.validation.maxLength !== undefined
                ? `Length: ${field.validation.minLength} - ${field.validation.maxLength} characters`
                : field.validation.minLength !== undefined
                ? `Minimum: ${field.validation.minLength} characters`
                : `Maximum: ${field.validation.maxLength} characters`}
            </p>
          )}
        </div>
      );
  }
}

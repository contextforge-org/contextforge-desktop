/**
 * Utility functions for tool testing functionality
 * Handles input schema parsing, parameter processing, and validation
 */

export interface JsonSchema {
  type?: string;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  items?: JsonSchemaProperty;
  enum?: any[];
  anyOf?: JsonSchemaProperty[];
  description?: string;
}

export interface JsonSchemaProperty {
  type?: string | string[];
  description?: string;
  enum?: any[];
  items?: JsonSchemaProperty;
  anyOf?: JsonSchemaProperty[];
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  default?: any;
}

export interface ParsedField {
  name: string;
  type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'enum';
  description?: string;
  required: boolean;
  enumValues?: any[];
  itemType?: string;
  default?: any;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

/**
 * Parse JSON schema to extract field information
 */
export function parseInputSchema(schemaInput: string | object): ParsedField[] {
  try {
    // Handle both string and object inputs
    let schema: JsonSchema;
    if (typeof schemaInput === 'string') {
      // If it's an empty string or just whitespace, return empty array
      if (!schemaInput.trim()) {
        return [];
      }
      schema = JSON.parse(schemaInput);
    } else if (typeof schemaInput === 'object' && schemaInput !== null) {
      schema = schemaInput as JsonSchema;
    } else {
      return [];
    }
    
    const fields: ParsedField[] = [];
    
    if (!schema.properties) {
      return fields;
    }

    const requiredFields = schema.required || [];

    for (const [fieldName, fieldSchema] of Object.entries(schema.properties)) {
      const field = parseField(fieldName, fieldSchema, requiredFields.includes(fieldName));
      if (field) {
        fields.push(field);
      }
    }

    return fields;
  } catch (error) {
    console.error('Error parsing input schema:', error);
    return [];
  }
}

/**
 * Parse individual field from schema
 */
function parseField(name: string, schema: JsonSchemaProperty, required: boolean): ParsedField | null {
  // Handle anyOf (union types)
  if (schema.anyOf && Array.isArray(schema.anyOf)) {
    const types = schema.anyOf.map(s => s.type).filter(Boolean);
    if (types.length > 0) {
      schema = { ...schema, type: types[0] as string };
    }
  }

  // Determine field type
  let fieldType: ParsedField['type'] = 'string';
  let itemType: string | undefined;
  let enumValues: any[] | undefined;

  if (schema.enum) {
    fieldType = 'enum';
    enumValues = schema.enum;
  } else if (schema.type === 'array') {
    fieldType = 'array';
    if (schema.items) {
      const itemTypes = Array.isArray(schema.items.anyOf)
        ? schema.items.anyOf.map(t => t.type)
        : [schema.items.type];
      itemType = itemTypes.find(t => t) as string || 'string';
    }
  } else if (schema.type === 'object') {
    fieldType = 'object';
  } else if (schema.type === 'boolean') {
    fieldType = 'boolean';
  } else if (schema.type === 'number') {
    fieldType = 'number';
  } else if (schema.type === 'integer') {
    fieldType = 'integer';
  }

  // Extract validation rules
  const validation: ParsedField['validation'] = {};
  if (schema.minimum !== undefined) validation.min = schema.minimum;
  if (schema.maximum !== undefined) validation.max = schema.maximum;
  if (schema.minLength !== undefined) validation.minLength = schema.minLength;
  if (schema.maxLength !== undefined) validation.maxLength = schema.maxLength;
  if (schema.pattern) validation.pattern = schema.pattern;

  return {
    name,
    type: fieldType,
    description: schema.description,
    required,
    enumValues,
    itemType,
    default: schema.default,
    validation: Object.keys(validation).length > 0 ? validation : undefined,
  };
}

/**
 * Process form inputs into properly typed parameters for RPC call
 */
export function processInputParameters(
  inputs: Record<string, any>,
  fields: ParsedField[]
): Record<string, any> {
  const params: Record<string, any> = {};

  for (const field of fields) {
    const value = inputs[field.name];

    // Handle empty values
    if (value === null || value === undefined || value === '') {
      if (field.required) {
        params[field.name] = getDefaultValue(field.type);
      }
      continue;
    }

    // Process based on type
    switch (field.type) {
      case 'array':
        params[field.name] = processArrayValue(value, field.itemType);
        break;
      case 'object':
        params[field.name] = processObjectValue(value);
        break;
      case 'boolean':
        params[field.name] = value === 'true' || value === true;
        break;
      case 'number':
      case 'integer':
        params[field.name] = processNumberValue(value);
        break;
      case 'enum':
        if (field.enumValues?.includes(value)) {
          params[field.name] = value;
        }
        break;
      default:
        params[field.name] = value;
    }
  }

  return params;
}

/**
 * Process array values with type conversion
 */
function processArrayValue(value: any, itemType?: string): any[] {
  // If already an array, process each item
  if (Array.isArray(value)) {
    return value.map(item => convertItemType(item, itemType));
  }

  // If string, try to parse as JSON array
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map(item => convertItemType(item, itemType));
      }
    } catch {
      // If not valid JSON, treat as single-item array
      return [convertItemType(value, itemType)];
    }
  }

  return [convertItemType(value, itemType)];
}

/**
 * Convert item to specified type
 */
function convertItemType(item: any, itemType?: string): any {
  if (!itemType) return item;

  switch (itemType) {
    case 'number':
    case 'integer':
      const num = Number(item);
      if (isNaN(num)) {
        throw new Error(`Invalid number: ${item}`);
      }
      return num;
    case 'boolean':
      return item === 'true' || item === true;
    case 'object':
      if (typeof item === 'string') {
        try {
          const parsed = JSON.parse(item);
          if (typeof parsed !== 'object' || Array.isArray(parsed)) {
            throw new Error('Value must be an object');
          }
          return parsed;
        } catch {
          throw new Error('Invalid object format');
        }
      }
      return item;
    default:
      return item;
  }
}

/**
 * Process object value (parse JSON string)
 */
function processObjectValue(value: any): any {
  if (typeof value === 'object' && !Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Value must be an object');
      }
      return parsed;
    } catch {
      throw new Error('Invalid JSON object format');
    }
  }

  throw new Error('Invalid object value');
}

/**
 * Process number value with validation
 */
function processNumberValue(value: any): number {
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`Invalid number: ${value}`);
  }
  return num;
}

/**
 * Get default value for a type
 */
function getDefaultValue(type: ParsedField['type']): any {
  switch (type) {
    case 'array':
      return [];
    case 'object':
      return {};
    case 'boolean':
      return false;
    case 'number':
    case 'integer':
      return 0;
    default:
      return '';
  }
}

/**
 * Parse passthrough headers from multi-line string
 */
export function parsePassthroughHeaders(headersText: string): Record<string, string> {
  const headers: Record<string, string> = {};
  
  if (!headersText.trim()) {
    return headers;
  }

  const lines = headersText.trim().split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const colonIndex = trimmedLine.indexOf(':');
    if (colonIndex <= 0) {
      throw new Error(`Invalid header format: "${trimmedLine}". Expected format: "Header-Name: Value"`);
    }

    const headerName = trimmedLine.substring(0, colonIndex).trim();
    const headerValue = trimmedLine.substring(colonIndex + 1).trim();

    if (!headerName || !headerValue) {
      throw new Error(`Invalid header: empty name or value in "${trimmedLine}"`);
    }

    // Validate header name (basic validation)
    if (!/^[a-zA-Z0-9-]+$/.test(headerName)) {
      throw new Error(`Invalid header name: "${headerName}". Only alphanumeric characters and hyphens allowed.`);
    }

    headers[headerName] = headerValue;
  }

  return headers;
}

/**
 * Validate input value against field schema
 */
export function validateFieldValue(value: any, field: ParsedField): { valid: boolean; error?: string } {
  // Check required
  if (field.required && (value === null || value === undefined || value === '')) {
    return { valid: false, error: `${field.name} is required` };
  }

  // Skip validation if empty and not required
  if (!field.required && (value === null || value === undefined || value === '')) {
    return { valid: true };
  }

  // Type-specific validation
  if (field.type === 'number' || field.type === 'integer') {
    const num = Number(value);
    if (isNaN(num)) {
      return { valid: false, error: `${field.name} must be a valid number` };
    }
    if (field.validation?.min !== undefined && num < field.validation.min) {
      return { valid: false, error: `${field.name} must be at least ${field.validation.min}` };
    }
    if (field.validation?.max !== undefined && num > field.validation.max) {
      return { valid: false, error: `${field.name} must be at most ${field.validation.max}` };
    }
  }

  if (field.type === 'string' && typeof value === 'string') {
    if (field.validation?.minLength !== undefined && value.length < field.validation.minLength) {
      return { valid: false, error: `${field.name} must be at least ${field.validation.minLength} characters` };
    }
    if (field.validation?.maxLength !== undefined && value.length > field.validation.maxLength) {
      return { valid: false, error: `${field.name} must be at most ${field.validation.maxLength} characters` };
    }
    if (field.validation?.pattern && !new RegExp(field.validation.pattern).test(value)) {
      return { valid: false, error: `${field.name} does not match required pattern` };
    }
  }

  return { valid: true };
}

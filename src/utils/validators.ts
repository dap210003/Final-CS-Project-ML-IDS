import { Parameter } from '@/types/parameter';

export const validateParameter = (
  param: Parameter,
  value: string | number
): string | null => {
  // Check if value is empty
  if (value === '' || value === null || value === undefined) {
    return `${param.param_name} is required`;
  }

  // Type validation
  if (param.param_type === 'int' || param.param_type === 'float') {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      return `${param.param_name} must be a number`;
    }

    // Range validation
    if (param.min_value !== null && numValue < param.min_value) {
      return `${param.param_name} must be >= ${param.min_value}`;
    }
    if (param.max_value !== null && numValue > param.max_value) {
      return `${param.param_name} must be <= ${param.max_value}`;
    }
  }

  // Boolean validation
  if (param.param_type === 'bool') {
    if (value !== 'True' && value !== 'False' && value !== true && value !== false) {
      return `${param.param_name} must be True or False`;
    }
  }

  return null; // Valid
};

export const validateAllParameters = (
  parameters: Parameter[],
  values: { [key: string]: any }
): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};

  parameters.forEach(param => {
    const value = values[param.param_name];
    const error = validateParameter(param, value);
    if (error) {
      errors[param.param_name] = error;
    }
  });

  return errors;
};
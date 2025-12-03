import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Parameter, ParameterValues } from "@/types/parameter";
import { validateParameter } from "@/utils/validators";

interface ParameterFormProps {
  parameters: Parameter[];
  values: ParameterValues;
  onChange: (values: ParameterValues) => void;
  errors?: { [key: string]: string };
}

export function ParameterForm({ parameters, values, onChange, errors = {} }: ParameterFormProps) {
  const [localValues, setLocalValues] = useState<ParameterValues>(values);
  const [localErrors, setLocalErrors] = useState<{ [key: string]: string }>(errors);

  // Group parameters by category
  const groupedParams = parameters.reduce((acc, param) => {
    const category = param.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(param);
    return acc;
  }, {} as { [key: string]: Parameter[] });

  // Handle value change
  const handleChange = (paramName: string, value: any, param: Parameter) => {
    const newValues = { ...localValues, [paramName]: value };
    setLocalValues(newValues);
    onChange(newValues);

    // Validate on change
    const error = validateParameter(param, value);
    setLocalErrors(prev => ({
      ...prev,
      [paramName]: error || ''
    }));
  };

  // Initialize local values
  useEffect(() => {
    const initialValues: ParameterValues = {};
    parameters.forEach(param => {
      initialValues[param.param_name] = values[param.param_name] || param.default_value;
    });
    setLocalValues(initialValues);
  }, [parameters]);

  // Render input based on parameter type
  const renderInput = (param: Parameter) => {
    const value = localValues[param.param_name] || param.default_value;
    const error = localErrors[param.param_name] || errors[param.param_name];

    switch (param.param_type) {
      case 'bool':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={param.param_name}
              checked={value === 'True' || value === true}
              onCheckedChange={(checked) => 
                handleChange(param.param_name, checked ? 'True' : 'False', param)
              }
            />
            <Label htmlFor={param.param_name} className="cursor-pointer">
              {value === 'True' || value === true ? 'Enabled' : 'Disabled'}
            </Label>
          </div>
        );

      case 'int':
      case 'float':
        return (
          <Input
            id={param.param_name}
            type="number"
            step={param.param_type === 'float' ? '0.001' : '1'}
            min={param.min_value ?? undefined}
            max={param.max_value ?? undefined}
            value={value}
            onChange={(e) => handleChange(param.param_name, e.target.value, param)}
            className={`bg-input border-border ${error ? 'border-red-500' : ''}`}
          />
        );

      case 'string':
        return (
          <Input
            id={param.param_name}
            type="text"
            value={value}
            onChange={(e) => handleChange(param.param_name, e.target.value, param)}
            className={`bg-input border-border ${error ? 'border-red-500' : ''}`}
          />
        );

      case 'dict':
        return (
          <Input
            id={param.param_name}
            type="text"
            value={value}
            onChange={(e) => handleChange(param.param_name, e.target.value, param)}
            placeholder='{"2":1000,"4":1000}'
            className={`bg-input border-border ${error ? 'border-red-500' : ''}`}
          />
        );

      default:
        return (
          <Input
            id={param.param_name}
            type="text"
            value={value}
            onChange={(e) => handleChange(param.param_name, e.target.value, param)}
            className={`bg-input border-border ${error ? 'border-red-500' : ''}`}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedParams).map(([category, params]) => (
        <Card key={category} className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg capitalize">
              {category.replace('_', ' ')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {params.map((param) => {
              const error = localErrors[param.param_name] || errors[param.param_name];
              
              return (
                <div key={param.param_name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={param.param_name}>
                      {param.param_name.replace(/_/g, ' ')}
                      {param.min_value !== null && param.max_value !== null && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({param.min_value} - {param.max_value})
                        </span>
                      )}
                    </Label>
                  </div>
                  
                  {renderInput(param)}
                  
                  {/* Description */}
                  {param.description && (
                    <p className="text-xs text-muted-foreground">
                      {param.description}
                    </p>
                  )}
                  
                  {/* Error message */}
                  {error && (
                    <p className="text-xs text-red-500">{error}</p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
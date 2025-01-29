import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

type ValidatorType = 'string' | 'number' | 'boolean';

function isValidType(element: any, type: ValidatorType): boolean {
  switch (type) {
    case 'string':
      return typeof element === 'string';
    case 'number':
      return typeof element === 'number';
    case 'boolean':
      return typeof element === 'boolean';
    default:
      return false;
  }
}

export function IsDoubleArrayOfType(
  type: ValidatorType,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: `isDoubleArrayOfType`,
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [type],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [expectedType] = args.constraints;
          if (!Array.isArray(value)) {
            return false; // Not an array
          }

          return value.every(
            (innerArray) =>
              Array.isArray(innerArray) &&
              innerArray.every((element) => isValidType(element, expectedType)),
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a two-dimensional ${args.constraints[0]} array`;
        },
      },
    });
  };
}

import vine from '@vinejs/vine';

// type ValidatorType = 'string' | 'number' | 'boolean';
//
// function isValidType(element: any, type: ValidatorType): boolean {
//   switch (type) {
//     case 'string':
//       return typeof element === 'string';
//     case 'number':
//       return typeof element === 'number';
//     case 'boolean':
//       return typeof element === 'boolean';
//     default:
//       return false;
//   }
// }

// export function IsDoubleArrayOfType(
//   type: ValidatorType,
//   validationOptions?: ValidationOptions,
// ) {
//   return function (object: object, propertyName: string) {
//     registerDecorator({
//       name: `isDoubleArrayOfType`,
//       target: object.constructor,
//       propertyName: propertyName,
//       options: validationOptions,
//       constraints: [type],
//       validator: {
//         validate(value: any, args: ValidationArguments) {
//           const [expectedType] = args.constraints;
//           if (!Array.isArray(value)) {
//             return false; // Not an array
//           }
//
//           return value.every(
//             (innerArray) =>
//               Array.isArray(innerArray) &&
//               innerArray.every((element) => isValidType(element, expectedType)),
//           );
//         },
//         defaultMessage(args: ValidationArguments) {
//           return `${args.property} must be a two-dimensional ${args.constraints[0]} array`;
//         },
//       },
//     });
//   };
// }

export const VAdvanceFilter = vine.compile(
  vine.object({
    filter_by: vine.array(vine.string()).optional().requiredIfExists('filter'),
    filter: vine
      .array(vine.array(vine.string() || vine.number()))
      .optional()
      .requiredIfExists('filter_by'),
    filter_condition: vine.enum(['and', 'or']).optional(),
    search_by: vine.array(vine.string()).optional().requiredIfExists('search'),
    search: vine.string().trim().optional().requiredIfExists('search_by'),
    sort_by: vine.string().optional().requiredIfExists('sort'),
    sort: vine.enum(['DESC', 'ASC']).optional().requiredIfExists('sort_by'),
    filter_date_start_by: vine
      .string()
      .optional()
      .requiredIfExists('start_date'),
    start_date: vine
      .date({ formats: ['iso8601'] })
      .optional()
      .requiredIfExists('filter_date_start_by'),
    filter_date_end_by: vine.string().optional().requiredIfExists('end_date'),
    end_date: vine
      .date({ formats: ['iso8601'] })
      .optional()
      .requiredIfExists('filter_date_end_by'),
    page: vine.number().optional().requiredIfExists('per_page'),
    per_page: vine.number().optional().requiredIfExists('page'),
    group_by: vine
      .array(vine.string())
      .optional()
      .requiredIfExists(['group_sort_by', 'group_sort']),
    group_sort_by: vine
      .string()
      .optional()
      .requiredIfExists(['group_by', 'group_sort']),
    group_sort: vine
      .enum(['MAX', 'MIN'])
      .optional()
      .requiredIfExists(['group_by', 'group_sort_by']),
  }),
);

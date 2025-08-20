import { z } from 'zod/v4';

export const VAdvanceFilter = z.object({
  filter_by: z.array(z.string()).optional(),
  filter: z.array(z.array(z.string())).optional(),
  filter_condition: z.enum(['and', 'or']).optional(),

  filter_nested_by: z.array(z.string()).optional(),
  filter_nested_condition: z.enum(['and', 'or']).optional(),
  filter_nested: z.array(z.array(z.string())).optional(),
  filter_nested_parent_by: z.array(z.string()).optional(),
  filter_nested_parent_condition: z.enum(['and', 'or']).optional(),
  filter_nested_parent: z.array(z.array(z.string())).optional(),
  search_by: z.array(z.string()).optional(),
  search: z.string().trim().optional(),
  sort_by: z.array(z.string()).optional(),
  sort: z.array(z.enum(['desc', 'asc'])).optional(),
  start_by: z.string().optional(),
  start: z.date().optional(),
  end_by: z.string().optional(),
  end: z.date().optional(),
  page: z.number().optional(),
  per_page: z.number().optional(),
  group_by: z.array(z.string()).optional(),
  group_sort_by: z.string().optional(),
  group_sort: z.enum(['max', 'min']).optional(),
  limit: z.number().min(1).optional(),
});

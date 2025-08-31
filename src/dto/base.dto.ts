import { ApiProperty } from '@nestjs/swagger';

export class IResponseAdvanceFilter<T> {
  total: number;
  total_page: number;
  data: T[];
}

export class IAdvanceFilter {
  @ApiProperty({
    type: [String],
  })
  filter_by?: string[];

  @ApiProperty({
    enum: ['and', 'or'],
  })
  filter_condition?: 'and' | 'or' = 'and';

  @ApiProperty({
    isArray: true,
    example: [['example']],
  })
  filter?: string[][];

  @ApiProperty({
    type: [String],
  })
  filter_nested_by?: string[];

  @ApiProperty({
    enum: ['and', 'or'],
  })
  filter_nested_condition?: 'and' | 'or' = 'and';

  @ApiProperty({
    isArray: true,
    example: [['example']],
  })
  filter_nested?: string[][];

  @ApiProperty({
    isArray: true,
    type: [String],
  })
  filter_nested_parent_by?: string[];

  @ApiProperty({
    enum: ['and', 'or'],
  })
  filter_nested_parent_condition?: 'and' | 'or' = 'and';

  @ApiProperty({
    isArray: true,
    example: [['example']],
  })
  filter_nested_parent?: string[][];

  @ApiProperty({
    isArray: true,
    type: [String],
  })
  search_by?: string[];

  @ApiProperty()
  search?: string;

  @ApiProperty()
  start_by?: string;

  @ApiProperty()
  start?: string;

  @ApiProperty()
  end_by?: string;

  @ApiProperty()
  end?: string;

  @ApiProperty({
    enum: ['and', 'or'],
  })
  start_and_end_condition?: 'and' | 'or' = 'and';

  @ApiProperty({
    type: [String],
  })
  sort_by?: string[];

  @ApiProperty({
    enum: ['desc', 'asc'],
    default: 'asc',
  })
  sort?: ('desc' | 'asc')[];

  @ApiProperty()
  page?: number;

  @ApiProperty()
  per_page?: number;

  @ApiProperty({
    type: [String],
  })
  group_by?: string[];

  @ApiProperty()
  group_sort_by?: string;

  @ApiProperty({
    enum: ['max', 'min'],
  })
  group_sort?: 'max' | 'min';

  @ApiProperty()
  limit?: number;
}

export interface IOptionCustomQuery {
  table_alias?: string;
  preload?: string[];
  user_id_alias?: string;

  [Key: string]: any;
}

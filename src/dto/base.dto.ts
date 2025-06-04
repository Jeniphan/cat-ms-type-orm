import { ApiProperty } from '@nestjs/swagger';

export class IResponseAdvanceFilter<T> {
  total: number;
  total_page: number;
  data: T[];
}

export class IAdvanceFilter {
  @ApiProperty({
    type: () => String,
    isArray: true,
  })
  filter_by?: string[];

  @ApiProperty({
    isArray: true,
    example: [['example']],
  })
  filter?: string[][];

  @ApiProperty({
    enum: ['and', 'or'],
    default: 'and',
  })
  filter_condition?: 'and' | 'or' = 'and';

  @ApiProperty()
  search_by?: string[];

  @ApiProperty()
  search?: string;

  @ApiProperty()
  sort_by?: string;

  @ApiProperty({
    enum: ['DESC', 'ASC'],
    default: 'ASC',
  })
  sort?: 'DESC' | 'ASC';

  @ApiProperty()
  filter_date_start_by?: string;

  @ApiProperty()
  start_date?: Date;

  @ApiProperty()
  filter_date_end_by?: string;

  @ApiProperty()
  end_date?: Date;

  @ApiProperty()
  page?: number;

  @ApiProperty()
  per_page?: number;

  @ApiProperty()
  group_by?: string[];

  @ApiProperty({
    type: () => String,
    isArray: true,
  })
  group_sort_by?: string;

  @ApiProperty({
    enum: ['MAX', 'MIN'],
    default: 'MAX',
  })
  group_sort?: 'MAX' | 'MIN';
}

export interface IOptionCustomQuery {
  table_alias?: string;
  preload?: string[];
  user_id_alias?: string;

  [Key: string]: any;
}

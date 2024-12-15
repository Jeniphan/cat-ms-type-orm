import { IsArray, IsDateString, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDoubleArrayOfType } from '@validators/base.validater';

export class IResponseAdvanceFilter<T> {
  total: number;
  total_page: number;
  data: T[];
}

export class IAdvanceFilter {
  @IsOptional()
  @ApiProperty({
    type: () => String,
    isArray: true,
  })
  @IsString({ each: true })
  @IsArray()
  @Type(() => String)
  filter_by?: string[];

  @ApiProperty({
    isArray: true,
    example: [['example']],
  })
  @IsDoubleArrayOfType('string')
  @IsArray()
  @IsOptional()
  filter?: string[][];

  @ApiProperty({
    enum: ['and', 'or'],
    default: 'and',
  })
  @IsIn(['or', 'and'])
  @IsString()
  @IsOptional()
  filter_condition?: 'and' | 'or' = 'and';

  @IsOptional()
  @ApiProperty({
    type: () => String,
    isArray: true,
  })
  @IsString({ each: true })
  @IsArray()
  @Type(() => String)
  filter_nested_by?: string[];

  @ApiProperty({
    isArray: true,
    example: [['example']],
  })
  @IsDoubleArrayOfType('string')
  @IsArray()
  @IsOptional()
  filter_nested?: string[][];

  @ApiProperty({
    enum: ['and', 'or'],
    default: 'and',
  })
  @IsIn(['or', 'and'])
  @IsString()
  @IsOptional()
  filter_nested_condition: 'and' | 'or' = 'and';

  @ApiProperty()
  @IsArray()
  @IsOptional()
  search_by?: string[];

  @ApiProperty()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  sort_by?: string;

  @ApiProperty({
    enum: ['DESC', 'ASC'],
    default: 'ASC',
  })
  @IsString()
  @IsIn(['DESC', 'ASC'])
  @IsOptional()
  sort?: 'DESC' | 'ASC';

  @ApiProperty()
  @IsString()
  @IsOptional()
  filter_date_start_by?: string;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  start_date?: Date;

  @ApiProperty()
  @IsString()
  @IsOptional()
  filter_date_end_by?: string;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  end_date?: Date;

  @ApiProperty()
  @IsString()
  @IsOptional()
  group_by?: string

  @ApiProperty({
    enum: ['DESC', 'ASC'],
    default: 'ASC',
  })
  @IsString()
  @IsIn(['DESC', 'ASC'])
  @IsOptional()
  group_sort?: 'DESC' | 'ASC' = 'ASC';

  @ApiProperty()
  @IsString()
  @IsOptional()
  group_sort_by?: string

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @IsOptional()
  per_page?: number;
}

export interface IOptionCustomQuery {
  table_alias?: string;
  preload?: string[];
  user_id_alias?: string;
  parent_table?: string;
  nested_table?: string;
  app_id?: boolean;
  with_parent_app_id?: boolean;

  [Key: string]: any;
}

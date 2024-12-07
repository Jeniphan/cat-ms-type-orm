import {
  IsArray,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDoubleArrayOfType } from '../validator/base.validator';

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
  filter?: string[][];

  @ApiProperty({
    enum: ['and', 'or'],
    default: 'and',
  })
  @IsIn(['or', 'and'])
  @IsString()
  @IsOptional()
  filter_condition?: 'and' | 'or' = 'and';

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

  [Key: string]: any;
}

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

export class IResponseAdvanceFilter<T> {
  total: number;
  total_page: number;
  data: T[];
}

export class IAdvanceFilter {
  @IsOptional()
  @ApiProperty()
  @IsArray()
  filter_by?: string[];

  @ApiProperty()
  @IsArray()
  @IsOptional()
  filter?: string[][];

  @ApiProperty()
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

  @ApiProperty()
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

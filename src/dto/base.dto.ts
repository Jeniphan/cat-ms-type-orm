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
    enum: ['and', 'or'],
    default: 'and',
  })
  filter_condition: 'and' | 'or' = 'and';

  @ApiProperty({
    isArray: true,
    example: [['example']],
  })
  filter?: string[][];

  @ApiProperty({
    type: () => String,
    isArray: true,
  })
  filter_nested_by?: string[];

  @ApiProperty({
    enum: ['and', 'or'],
  })
  filter_nested_condition: 'and' | 'or' = 'and';

  @ApiProperty({
    isArray: true,
    example: [['example']],
  })
  filter_nested?: string[][];

  @ApiProperty({
    isArray: true,
    type: () => String,
  })
  filter_nested_parent_by?: string[];

  @ApiProperty({
    enum: ['and', 'or'],
  })
  filter_nested_parent_condition: 'and' | 'or' = 'and';

  @ApiProperty({
    isArray: true,
    example: [['example']],
  })
  filter_nested_parent?: string[][];

  @ApiProperty({
    isArray: true,
    type: () => String,
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
  start_and_end_condition: 'and' | 'or' = 'and';

  @ApiProperty({
    type: () => String,
    isArray: true,
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
    type: () => String,
    isArray: true,
  })
  selection_group?: string[];

  @ApiProperty({
    type: () => String,
    isArray: true,
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

  @ApiProperty({
    type: () => String,
    isArray: true,
  })
  preload?: string[];

  @ApiProperty({
    type: () => String,
    isArray: true,
  })
  filter_m2m_by?: string[];
  /** รูปแบบเดียวกับ filter_nested_by แต่สำหรับ many-to-many เช่น 'tags.id' หมายถึง relation property tags และคอลัมน์ id ของตาราง tag/join */

  @ApiProperty({
    isArray: true,
    example: [['example']],
  })
  filter_m2m?: (string | number)[][];
  /** เป็น array of arrays โดยตำแหน่งของ array ตรงกับ filter_m2m_by และยกตัวอย่าง เช่น [["id1","id2"], ["..."]] */

  @ApiProperty({
    enum: ['and', 'or'],
  })
  filter_m2m_condition?: 'and' | 'or';
  /** ค่านี้ใช้กำหนดเงื่อนไขการรวม (and/or) และระบุว่าค่าเริ่มต้นใน runtime ถ้าไม่ระบุจะถือเป็น 'or' แต่ห้ามใส่ default ใน interface — ให้เป็นแค่ type เท่านั้น */

  @ApiProperty()
  filter_m2m_join_alias?: string;
  /** เป็น optional alias สำหรับ join table หรือ relation alias ใน SQL และยกตัวอย่างการใช้ (ช่วยกรณีใช้ option.table_alias) */
}

export interface IOptionCustomQuery {
  table_alias: string;
  preload?: string[];
  [Key: string]: any;
}

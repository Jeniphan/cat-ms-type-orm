import {
  Brackets,
  DataSource,
  EntityManager,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { ENTITY_MANAGER_KEY } from './transaction.interceptor';
import { FastifyRequest } from 'fastify';
import { IAdvanceFilter, IOptionCustomQuery } from '@dto/base.dto';
import { UUIDV4 } from '@helper/uuid.helper';

/**
 * BaseService provides common database query utilities for services.
 * Includes methods for repository access, advanced filtering, and query customization.
 */
export class BaseService {
  /**
   * @param dataSource - TypeORM DataSource instance.
   * @param request - FastifyRequest object, used for headers and transaction context.
   */

  constructor(
    private dataSource: DataSource,
    private request: FastifyRequest,
  ) {}

  /**
   * Retrieves the application ID from the request headers, defaults to '1' if not present.
   */
  get AppId() {
    return (this.request.headers['app_id'] as string) ?? '1';
  }

  /**
   * Gets the repository for a given entity class, using the current transaction if available.
   * @param entityCls - The entity class.
   */
  protected getRepository<T>(entityCls: new () => T): Repository<T> {
    const entityManager: EntityManager =
      this.request[ENTITY_MANAGER_KEY] ?? this.dataSource.manager;
    return entityManager.getRepository(entityCls);
  }

  /**
   * Creates a SelectQueryBuilder for the given repository, with optional table alias and preloads.
   * @param repository - The entity class.
   * @param option - Custom query options (alias, preload, etc).
   */
  protected CustomQuery<T>(
    repository: new () => T,
    option?: IOptionCustomQuery,
  ): SelectQueryBuilder<T> {
    let q = null;
    if (option && option.table_alias && option.table_alias !== '') {
      q = this.getRepository(repository).createQueryBuilder(option.table_alias);
    } else {
      q = this.getRepository(repository).createQueryBuilder();
    }
    if (
      option &&
      option.preload &&
      option.preload.length > 0 &&
      option.preload
    ) {
      option.preload.forEach((preload) => {
        q = q.leftJoinAndSelect(
          option.table_alias ? `${option.table_alias}.${preload}` : preload,
          preload,
        );
      });
    }
    return q;
  }

  /**
   * Creates a SelectQueryBuilder with an app_id filter.
   * @param repository - The entity class.
   * @param option - Custom query options.
   */
  protected CustomQueryWithAppId<T>(
    repository: new () => T,
    option?: IOptionCustomQuery,
  ): SelectQueryBuilder<T> {
    const tableDotAppId = option?.table_alias
      ? `${option.table_alias}.app_id`
      : 'app_id';
    return this.CustomQuery(repository, option).where(
      `${tableDotAppId} = :appId`,
      { appId: (this.request.headers['app_id'] as string) ?? '1' },
    );
  }

  /**
   * Applies advanced filtering, searching, sorting, grouping, and pagination to a query.
   * @param query - Advanced query parameters.
   * @param repository - The entity class.
   * @param option - Custom query options.
   * @returns An object containing the filtered data and total count.
   */
  async AdvanceFilter<T>(
    query: IAdvanceFilter,
    repository: new () => T,
    option?: IOptionCustomQuery,
  ): Promise<{
    data: T[];
    total: number;
  }> {
    let q = this.CustomQuery<T>(repository, option);

    if (option && option.app_id) {
      q = this.CustomQueryWithAppId(repository, option);
    }

    let total = 0;
    // Filter (supports exclusion with '!' prefix in filter values)
    if (
      query.filter_by &&
      query.filter_by.length > 0 &&
      query.filter &&
      query.filter.length > 0
    ) {
      const buildExpr = (col: string) => {
        if (col.includes('.')) {
          const [jsonColumn, jsonField] = col.split('.');
          return `JSON_UNQUOTE(JSON_EXTRACT(${
            option?.table_alias
              ? `${option.table_alias}.${jsonColumn}`
              : jsonColumn
          }, '$.${jsonField}'))`;
        }
        return `${option?.table_alias ? `${option.table_alias}.${col}` : col}`;
      };

      if (query.filter_condition === 'and') {
        q = q.andWhere(
          new Brackets((qb) => {
            query.filter_by.forEach((filter_by, index) => {
              const rawValues = Array.isArray(query.filter[index])
                ? query.filter[index]
                : [query.filter[index]];

              const includeVals = rawValues.filter(
                (v) => !(typeof v === 'string' && v.startsWith('!')),
              );
              const excludeVals = rawValues
                .filter((v) => typeof v === 'string' && v.startsWith('!'))
                .map((v: string) => v.substring(1));

              if (includeVals.length === 0 && excludeVals.length === 0) return;

              const uuid = UUIDV4().split('-')[0];
              const keyBase = `${uuid}_${index}`;
              const keyIn = `${keyBase}_in`;
              const keyNotIn = `${keyBase}_notin`;
              const expr = buildExpr(filter_by);

              if (includeVals.length > 0) {
                qb = qb.andWhere(`${expr} IN (:...${keyIn})`, {
                  [keyIn]: includeVals,
                });
              }
              if (excludeVals.length > 0) {
                qb = qb.andWhere(`${expr} NOT IN (:...${keyNotIn})`, {
                  [keyNotIn]: excludeVals,
                });
              }
            });
          }),
        );
      } else {
        // Condition 'or'
        q = q.andWhere(
          new Brackets((qb) => {
            query.filter_by.forEach((filter_by, index) => {
              const rawValues = Array.isArray(query.filter[index])
                ? query.filter[index]
                : [query.filter[index]];

              const includeVals = rawValues.filter(
                (v) => !(typeof v === 'string' && v.startsWith('!')),
              );
              const excludeVals = rawValues
                .filter((v) => typeof v === 'string' && v.startsWith('!'))
                .map((v: string) => v.substring(1));

              if (includeVals.length === 0 && excludeVals.length === 0) return;

              const uuid = UUIDV4().split('-')[0];
              const keyBase = `${uuid}_${index}`;
              const keyIn = `${keyBase}_in`;
              const keyNotIn = `${keyBase}_notin`;
              const expr = buildExpr(filter_by);

              qb = qb.orWhere(
                new Brackets((subQb) => {
                  if (includeVals.length > 0) {
                    subQb = subQb.andWhere(`${expr} IN (:...${keyIn})`, {
                      [keyIn]: includeVals,
                    });
                  }
                  if (excludeVals.length > 0) {
                    subQb = subQb.andWhere(`${expr} NOT IN (:...${keyNotIn})`, {
                      [keyNotIn]: excludeVals,
                    });
                  }
                }),
              );
            });
          }),
        );
      }
    }

    // Filter nested
    if (
      query.filter_nested &&
      query.filter_nested.length > 0 &&
      query.filter_nested_by &&
      query.filter_nested_by.length > 0
    ) {
      // Ensure joins for all nested tables
      const joinedTables = new Set<string>();
      query.filter_nested_by.forEach((nestedBy) => {
        const [table] = nestedBy.split('.');
        if (!joinedTables.has(table)) {
          q = q.leftJoinAndSelect(
            option?.table_alias ? `${option.table_alias}.${table}` : table,
            table,
            `${option.table_alias}.id = ${table}.${option.table_alias}_id`,
          );
          joinedTables.add(table);
        }
      });

      q = q.andWhere(
        new Brackets((qb) => {
          if (query.filter_nested_condition === 'and') {
            query.filter_nested_by.forEach((nestedBy, idx) => {
              const [table, column] = nestedBy.split('.');
              const uuid = UUIDV4().split('-')[0];
              const key = `nested_${uuid}_${idx}`;
              qb = qb.andWhere(`${table}.${column} IN (:...${key})`, {
                [key]: query.filter_nested[idx],
              });
            });
          } else {
            query.filter_nested_by.forEach((nestedBy, idx) => {
              const [table, column] = nestedBy.split('.');
              const uuid = UUIDV4().split('-')[0];
              const key = `nested_${uuid}_${idx}`;
              qb = qb.orWhere(`${table}.${column} IN (:...${key})`, {
                [key]: query.filter_nested[idx],
              });
            });
          }
        }),
      );
    }

    //Search
    if (
      query.search &&
      query.search !== '' &&
      query.search_by &&
      query.search_by.length > 0
    ) {
      q = q.andWhere(
        new Brackets((qb) => {
          query.search_by.map((search_by) => {
            if (search_by.includes('.')) {
              const [jsonColumn, jsonField] = search_by.split('.');
              qb = qb.orWhere(
                `JSON_UNQUOTE(JSON_EXTRACT(${
                  option?.table_alias
                    ? `${option.table_alias}.${jsonColumn}`
                    : jsonColumn
                }, '$.${jsonField}')) like :search`,
                {
                  search: `%${query.search}%`,
                },
              );
            } else {
              qb = qb.orWhere(
                `${
                  option?.table_alias
                    ? `${option.table_alias}.${search_by}`
                    : search_by
                } like :search`,
                {
                  search: `%${query.search}%`,
                },
              );
            }
          });
        }),
      );
    }

    //Start And End
    if ((query.start && query.start_by) || (query.end && query.end_by)) {
      q = q.andWhere(
        new Brackets((qb) => {
          if (query.start_and_end_condition === 'and') {
            //Start
            if (query.start && query.start_by) {
              if (query.start_by.includes('.')) {
                const [jsonColumn, jsonField] = query.start_by.split('.');
                qb = qb.andWhere(
                  `JSON_UNQUOTE(JSON_EXTRACT(${
                    option?.table_alias
                      ? `${option.table_alias}.${jsonColumn}`
                      : jsonColumn
                  }, '$.${jsonField}')) >= :start_date`,
                  {
                    start_date: query.start,
                  },
                );
              } else {
                qb = qb.andWhere(
                  `${
                    option?.table_alias
                      ? `${option.table_alias}.${query.start_by}`
                      : query.start_by
                  } >= :start_date`,
                  {
                    start_date: query.start,
                  },
                );
              }
            }

            //End
            if (query.end && query.end_by) {
              if (query.end_by.includes('.')) {
                const [jsonColumn, jsonField] = query.end_by.split('.');
                qb = qb.andWhere(
                  `JSON_UNQUOTE(JSON_EXTRACT(${
                    option?.table_alias
                      ? `${option.table_alias}.${jsonColumn}`
                      : jsonColumn
                  }, '$.${jsonField}')) >= :end_date`,
                  {
                    end_date: query.end,
                  },
                );
              } else {
                qb = qb.andWhere(
                  `${
                    option?.table_alias
                      ? `${option.table_alias}.${query.end_by}`
                      : query.end_by
                  } <= :end_date`,
                  {
                    end_date: query.end,
                  },
                );
              }
            }
          } else {
            //Start
            if (query.start && query.start_by) {
              if (query.start_by.includes('.')) {
                const [jsonColumn, jsonField] = query.start_by.split('.');
                qb = qb.orWhere(
                  `JSON_UNQUOTE(JSON_EXTRACT(${
                    option?.table_alias
                      ? `${option.table_alias}.${jsonColumn}`
                      : jsonColumn
                  }, '$.${jsonField}')) >= :start_date`,
                  {
                    start_date: query.start,
                  },
                );
              } else {
                qb = qb.orWhere(
                  `${
                    option?.table_alias
                      ? `${option.table_alias}.${query.start_by}`
                      : query.start_by
                  } >= :start_date`,
                  {
                    start_date: query.end,
                  },
                );
              }
            }

            //End
            if (query.end && query.end_by) {
              if (query.end_by.includes('.')) {
                const [jsonColumn, jsonField] = query.end_by.split('.');
                qb = qb.orWhere(
                  `JSON_UNQUOTE(JSON_EXTRACT(${
                    option?.table_alias
                      ? `${option.table_alias}.${jsonColumn}`
                      : jsonColumn
                  }, '$.${jsonField}')) >= :end_date`,
                  {
                    end_date: query.end,
                  },
                );
              } else {
                qb = qb.orWhere(
                  `${
                    option?.table_alias
                      ? `${option.table_alias}.${query.end_by}`
                      : query.end_by
                  } <= :end_date`,
                  {
                    end_date: query.end,
                  },
                );
              }
            }
          }
          return qb;
        }),
      );
    }

    //Sort
    if (query.sort && query.sort_by && query.sort_by.length > 0) {
      for (let i = 0; i < query.sort_by.length; i++) {
        if (query.sort_by[i].includes('.')) {
          const [jsonColumn, jsonField] = query.sort_by[i].split('.');
          const uuid = UUIDV4().split('-')[0];
          q = q.addSelect(
            `JSON_UNQUOTE(JSON_EXTRACT(${
              option?.table_alias
                ? `${option.table_alias}.${jsonColumn}`
                : jsonColumn
            }, '$.${jsonField}'))`,
            uuid,
          );
          q = q.orderBy(uuid, query.sort[i].toUpperCase() as 'DESC' | 'ASC');
        } else {
          q = q.orderBy(
            `${
              option?.table_alias
                ? `${option.table_alias}.${query.sort_by[i]}`
                : query.sort_by
            }`,
            query.sort[i].toUpperCase() as 'DESC' | 'ASC',
          );
        }
      }
    }

    //Group
    if (query.group_by && query.group_sort && query.group_sort_by) {
      let onTable = '';
      const groupSelects = [];
      const groupBys = [];

      query.group_by.forEach((group_by, index) => {
        let groupExpression = '';
        let selectExpression = '';
        let mainTableExpression = '';
        let aliasName = '';

        if (group_by.includes('.')) {
          // Handle JSON column grouping
          const [jsonColumn, jsonField] = group_by.split('.');
          aliasName = `${jsonColumn}_${jsonField}`;
          groupExpression = `subQuery.${aliasName}`;
          selectExpression = `JSON_UNQUOTE(JSON_EXTRACT(sub.${jsonColumn}, '$.${jsonField}')) as ${aliasName}`;
          mainTableExpression = `JSON_UNQUOTE(JSON_EXTRACT(${
            option?.table_alias
              ? `${option.table_alias}.${jsonColumn}`
              : jsonColumn
          }, '$.${jsonField}'))`;
        } else {
          // Handle regular column grouping - use sub_ prefix for alias
          aliasName = `sub_${group_by}`;
          groupExpression = `subQuery.${aliasName}`;
          selectExpression = `sub.${group_by} as ${aliasName}`;
          mainTableExpression = option?.table_alias
            ? `${option.table_alias}.${group_by}`
            : group_by;
        }

        groupSelects.push(selectExpression);

        // For groupBy in subquery, use the original expression with sub alias
        if (group_by.includes('.')) {
          const [jsonColumn, jsonField] = group_by.split('.');
          groupBys.push(
            `JSON_UNQUOTE(JSON_EXTRACT(sub.${jsonColumn}, '$.${jsonField}'))`,
          );
        } else {
          groupBys.push(`sub.${group_by}`);
        }

        if (index !== 0) {
          onTable =
            onTable + ` AND ${groupExpression} = ${mainTableExpression}`;
        } else {
          onTable = `${groupExpression} = ${mainTableExpression}`;
        }
      });

      // Handle group_sort_by for JSON columns
      let groupSortExpression = '';
      let mainSortExpression = '';
      let groupSortSelect = '';

      if (query.group_sort_by.includes('.')) {
        const [jsonColumn, jsonField] = query.group_sort_by.split('.');
        groupSortExpression = `JSON_UNQUOTE(JSON_EXTRACT(sub.${jsonColumn}, '$.${jsonField}'))`;
        mainSortExpression = `JSON_UNQUOTE(JSON_EXTRACT(${
          option?.table_alias
            ? `${option.table_alias}.${jsonColumn}`
            : jsonColumn
        }, '$.${jsonField}'))`;
        groupSortSelect = `JSON_UNQUOTE(JSON_EXTRACT(sub.${jsonColumn}, '$.${jsonField}')) as ${jsonColumn}_${jsonField}_sort`;
      } else {
        groupSortExpression = `sub.${query.group_sort_by}`;
        mainSortExpression = option?.table_alias
          ? `${option.table_alias}.${query.group_sort_by}`
          : query.group_sort_by;
        groupSortSelect = `sub.${query.group_sort_by}`;
      }

      // Add group_sort column to select if not already included
      if (!groupSelects.some((sel) => sel.includes(query.group_sort_by))) {
        groupSelects.push(groupSortSelect);
      }

      q = q.innerJoinAndSelect(
        (qb) => {
          let subQuery = qb.select(groupSelects).from(repository, 'sub');

          // Apply app_id filter to subquery if needed
          if (option && option.app_id) {
            subQuery = subQuery.where('sub.app_id = :appId', {
              appId: (this.request.headers['app_id'] as string) ?? '1',
            });
          }

          if (query.group_sort === 'max') {
            subQuery = subQuery.addSelect(
              `MAX(${groupSortExpression})`,
              'group_sort_value',
            );
          } else {
            subQuery = subQuery.addSelect(
              `MIN(${groupSortExpression})`,
              'group_sort_value',
            );
          }

          if (groupBys.length > 0) {
            for (const groupByExpr of groupBys) {
              subQuery = subQuery.addGroupBy(groupByExpr);
            }
          }
          return subQuery;
        },
        'subQuery',
        onTable + ` AND subQuery.group_sort_value = ${mainSortExpression}`,
      );
    }

    total = (await q.getMany()).length;

    //Pagination
    if (
      query.page &&
      query.page !== 0 &&
      query.per_page &&
      query.per_page !== 0
    ) {
      // if (query.page <= 1) query.page = 0;
      q = q.skip((query.page - 1) * query.per_page).take(query.per_page);
    }
    return {
      data: await q.getMany(),
      total,
    };
  }

  /**
   * Creates a SelectQueryBuilder with an inner join to a parent table, filtered by app_id.
   * @param repository - The entity class.
   * @param option - Custom query options (must include parent_table).
   */
  protected CustomQueryParentWithAppId<T>(
    repository: new () => T,
    option?: IOptionCustomQuery,
  ) {
    // const tableDotAppId = option?.table_alias
    return this.CustomQuery(repository, option).innerJoinAndSelect(
      `${option.table_alias}.${option.parent_table}`,
      `${option.parent_table}`,
      `${option.parent_table}.app_id = :app_id`,
      { app_id: this.AppId },
    );
  }
}

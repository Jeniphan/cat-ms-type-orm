import { Brackets, DataSource, EntityManager, Repository, SelectQueryBuilder } from 'typeorm';
import { ENTITY_MANAGER_KEY } from './transaction.interceptor';
import { FastifyRequest } from 'fastify';
import { IAdvanceFilter, IOptionCustomQuery } from '@dto/base.dto';

export class BaseRepository {
  constructor(
    private dataSource: DataSource,
    private request: FastifyRequest,
  ) {}

  get AppId() {
    return (this.request.headers['app_id'] as string) ?? '1';
  }

  protected getRepository<T>(entityCls: new () => T): Repository<T> {
    const entityManager: EntityManager =
      this.request[ENTITY_MANAGER_KEY] ?? this.dataSource.manager;
    return entityManager.getRepository(entityCls);
  }

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

  protected async AdvanceFilter<T>(
    query: IAdvanceFilter,
    repository: new () => T,
    option?: IOptionCustomQuery,
  ): Promise<{
    data: T[];
    total: number;
  }> {
    let q = this.CustomQuery<T>(repository, {...option, table_alias: 't1'});

    if (option && option.app_id) {
      q = this.CustomQueryWithAppId(repository, {...option, table_alias: 't1'});
    } else if (option && option.with_parent_app_id && option.parent_table) {
      q = this.CustomQueryParentWithAppId(repository, {...option, table_alias: 't1'});
    }

    //Join Table Nested
    if (option.nested_table) {
      q = q.leftJoinAndSelect(
        `${option.table_alias}.${option.nested_table}s`,
        option.nested_table,
      );
    }

    let total = 0;
    // filter
    if (
      query.filter_by &&
      query.filter_by.length > 0 &&
      query.filter &&
      query.filter.length > 0
    ) {
      //condition 'and'
      if (query.filter_condition === 'and') {
        q = q.andWhere(
          new Brackets((qb) => {
            query.filter_by.map((filter_by, index) => {
              qb = qb.where(
                `t1.${filter_by} in (:...filter)`,
                {
                  filter: query.filter[index],
                },
              );
            });
          }),
        );
      } else {
        // Condition 'or'
        q = q.andWhere(
          new Brackets((qb) => {
            query.filter_by.map((filter_by, index) => {
              qb = qb.orWhere(
                `t1.${filter_by} in (:...filter)`,
                {
                  filter: query.filter[index],
                },
              );
            });
          }),
        );
      }
    }

    //filter nested
    if (
      query.filter_nested_by &&
      query.filter_nested_by.length > 0 &&
      query.filter_nested &&
      query.filter_nested.length > 0
    ) {
      if (query.filter_nested_condition === 'and') {
        q = q.andWhere(
          new Brackets((qb) => {
            query.filter_nested_by.map((filter_nested_by, index) => {
              qb = qb.where(
                `${
                  option?.nested_table
                    ? `${option.nested_table}.${filter_nested_by}`
                    : filter_nested_by
                } IN (:...filter)`,
                {
                  filter: query.filter_nested[index],
                },
              );
            });
          }),
        );
      } else {
        // Condition 'or'
        q = q.andWhere(
          new Brackets((qb) => {
            query.filter_nested_by.map((filter_nested_by, index) => {
              qb = qb.orWhere(
                `${
                  option?.nested_table
                    ? `${option.nested_table}.${filter_nested_by}`
                    : filter_nested_by
                } in (:...filter)`,
                {
                  filter: query.filter_nested[index],
                },
              );
            });
          }),
        );
      }
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
            qb = qb.orWhere(
              `t1.${search_by} like :search`,
              {
                search: `%${query.search}%`,
              },
            );
          });
        }),
      );
    }

    //Start
    if (
      query.filter_date_start_by &&
      query.filter_date_start_by !== '' &&
      query.start_date
    ) {
      q = q.andWhere(
        `t1.${query.filter_date_start_by} >= :start_date`,
        {
          start_date: query.start_date,
        },
      );
    }

    //End
    if (
      query.filter_date_end_by &&
      query.filter_date_end_by !== '' &&
      query.end_date
    ) {
      q = q.where(
        `t1.${query.filter_date_end_by} <= :end_date`,
        {
          end_date: query.end_date,
        },
      );
    }

    //Sort
    if (query.sort && query.sort_by && query.sort_by !== '') {
      q = q.orderBy(
        `t1.${query.sort_by}`,
        query.sort,
      );
    }

    //Group by
    if(query.group_by && query.group_sort_by && query.group_sort && option.table_alias) {
      if(query.group_sort === 'DESC') {
      q = q.from(subQuery => {
        return subQuery.select(`${query.group_by} MAX(${query.group_sort_by}) as order`).groupBy(query.group_by)
      }, "t2")

      } else {
        q = q.from(subQuery => {
          return subQuery.select(`${query.group_by} MIN(${query.group_sort_by}) as order`).groupBy(query.group_by)
        }, "t2")
      }

      q = q.innerJoinAndSelect(
        repository,
        't1',
        `'t1'.${query.group_by} = t2.${query.group_by} AND 't1'.${query.group_sort_by} = t2.order`)

    }

    total = (await q.getMany()).length;

    //Pagination
    if (
      query.page &&
      query.page !== 0 &&
      query.per_page &&
      query.per_page !== 0
    ) {
      if (query.page <= 1) query.page = 0;
      q = q.skip(query.page * query.per_page).take(query.per_page);
    }
    return {
      data: await q.getMany(),
      total,
    };
  }
}

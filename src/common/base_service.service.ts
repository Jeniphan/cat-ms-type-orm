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

  protected async AdvanceFilter<T>(
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
            query.filter_by.forEach((filter_by, index) => {
              const key = 'filter_' + index;
              qb = qb.andWhere(
                `${
                  option?.table_alias
                    ? `${option.table_alias}.${filter_by}`
                    : filter_by
                } in (:...${key})`,
                {
                  [key]: query.filter[index],
                },
              );
            });
          }),
        );
      } else {
        // Condition 'or'
        q = q.andWhere(
          new Brackets((qb) => {
            query.filter_by.forEach((filter_by, index) => {
              const key = 'filter_' + index;
              qb = qb.orWhere(
                `${
                  option?.table_alias
                    ? `${option.table_alias}.${filter_by}`
                    : filter_by
                } in (:...${key})`,
                {
                  [key]: query.filter[index],
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
              `${
                option?.table_alias
                  ? `${option.table_alias}.${search_by}`
                  : search_by
              } like :search`,
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
        `${
          option?.table_alias
            ? `${option.table_alias}.${query.filter_date_start_by}`
            : query.filter_date_start_by
        } >= :start_date`,
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
        `${
          option?.table_alias
            ? `${option.table_alias}.${query.filter_date_end_by}`
            : query.filter_date_end_by
        } <= :end_date`,
        {
          end_date: query.end_date,
        },
      );
    }

    //Sort
    if (query.sort && query.sort_by && query.sort_by !== '') {
      q = q.orderBy(
        `${
          option?.table_alias
            ? `${option.table_alias}.${query.sort_by}`
            : query.sort_by
        }`,
        query.sort,
      );
    }

    //Group
    if (query.group_by && query.group_sort && query.group_sort_by) {
      let onTable = '';
      query.group_by.forEach((group_by, index) => {
        if (index !== 0) {
          onTable = onTable + ` AND ${group_by} = ${group_by}`;
        } else {
          onTable = `${group_by} = ${group_by}`;
        }
      });

      q = q.innerJoinAndSelect(
        (qb) => {
          qb = qb
            .select(query.group_by.map((select) => `sub.${select}`))
            .from(repository, 'sub');

          if (query.group_sort === 'MAX') {
            qb = qb.addSelect(
              `MAX(sub.${query.group_sort_by})`,
              'group_sort_value',
            );
          } else {
            qb = qb.addSelect(
              `MIN(sub.${query.group_sort_by})`,
              'group_sort_value',
            );
          }

          if (query.group_by.length > 0) {
            for (const group of query.group_by) {
              qb = qb.addGroupBy(`sub.${group}`);
            }
          }
          return qb;
        },
        // StockEntity,
        'subQuery',
        onTable + ` AND group_sort_value = ${query.group_sort_by}`,
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
      if (query.page <= 1) query.page = 0;
      q = q.skip(query.page * query.per_page).take(query.per_page);
    }
    return {
      data: await q.getMany(),
      total,
    };
  }
}

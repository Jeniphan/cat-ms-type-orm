import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { IAdvanceFilter, IOptionCustomQuery } from '@dto/base.dto';

export class BaseService {
  CustomQuery<T>(
    repository: Repository<T>,
    option?: IOptionCustomQuery,
  ): SelectQueryBuilder<T> {
    let q = null;
    if (option && option.table_alias && option.table_alias !== '') {
      q = repository.createQueryBuilder(option.table_alias);
    } else {
      q = repository.createQueryBuilder();
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

  CustomQueryWithUserId<T>(
    userId: number,
    repository: Repository<T>,
    option?: IOptionCustomQuery,
  ): SelectQueryBuilder<T> {
    const tableDotUserId = option?.table_alias
      ? `${option.table_alias}.user_id`
      : 'user_id';
    return this.CustomQuery<T>(repository, option).where(
      `${tableDotUserId} = :user_id`,
      {
        user_id: userId,
      },
    );
  }

  async AdvanceFilter<T>(
    query: IAdvanceFilter,
    repository: Repository<T>,
    option?: IOptionCustomQuery,
  ): Promise<{
    data: T[];
    total: number;
  }> {
    let q = this.CustomQuery<T>(repository, option);
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
                `${
                  option?.table_alias
                    ? `${option.table_alias}.${filter_by}`
                    : filter_by
                } in (:...filter)`,
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
                `${
                  option?.table_alias
                    ? `${option.table_alias}.${filter_by}`
                    : filter_by
                } in (:...filter)`,
                {
                  filter: query.filter[index],
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
            console.log('debug');
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

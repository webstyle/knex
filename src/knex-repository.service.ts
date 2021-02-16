import { Inject, Injectable } from "@nestjs/common";
import Knex = require("knex");
import { KNEX_CONNECTION } from "./constants";

export interface IBaseQuery<T> {
    getById(id: string, columns?: string[]): Promise<T>;
  
    updateById(id: string, value: T): Promise<T[]>;
  
    insert(value: T, returning?: string[]): Promise<T>;
  
    insertWithTransaction(
      trx: Knex.Transaction,
      value: T,
      returning?: string[],
    ): Promise<T[]>;
  
    updateByIdWithTransaction(
      trx: Knex.Transaction,
      id: string,
      value: T,
    ): Promise<T[]>;
  
    getByIdWithTransaction(
      trx: Knex.Transaction,
      id: string,
      columns?: string[],
    ): Promise<T>;
  }
  

@Injectable()
export class KnexRepository<T> implements IBaseQuery<T> {
    @Inject(KNEX_CONNECTION) private readonly knex;

    constructor(private _tableName: string) {}

  
    get tableName(): string {
      return this._tableName;
    }
  
  
    find(columns = ['*']) {
      return this.knex.select(columns).from(this._tableName);
    }
  
    getById(id: string, columns = ['*']): Promise<T> {
      return this.knex
        .select(columns)
        .from(this._tableName)
        .where('id', id)
        .first();
    }
  
    findByCriteria(condition: Partial<T>, columns = ['*']): Promise<T[]> {
      return this.knex
        .select(columns)
        .from(this._tableName)
        .where(condition);
    }
  
    updateById(id: string, value: T, returning = ['*']): Promise<T[]> {
      return this.knex
        .instance(this._tableName)
        .update(value)
        .where('id', id)
        .returning(returning);
    }
  
    updateByColumn(
      column = 'id',
      id: string,
      value: T,
      returning = ['*'],
    ): Promise<T[]> {
      return this.knex
        .instance(this._tableName)
        .update(value)
        .where(column, id)
        .returning(returning);
    }
  
    async insert(value: T, returning = ['*']): Promise<T> {
      const [data] = await this.knex
        .insert({ ...value })
        .into(this._tableName)
        .returning(returning);
      return data;
    }
  
    insertWithTransaction(trx: Knex.Transaction, value: T, returning = ['*']) {
      return trx
        .insert({ ...value })
        .into(this._tableName)
        .returning(returning);
    }
  
    updateByIdWithTransaction(
      trx: Knex.Transaction,
      id: string,
      value: T,
      returning = ['*'],
    ) {
      return trx
        .update(value)
        .from(this._tableName)
        .where('id', id)
        .returning(returning);
    }
  
    getByIdWithTransaction(
      trx: Knex.Transaction,
      id: string,
      columns = ['*'],
    ): Promise<T> {
      return trx.select(columns).from(this._tableName).where('id', id).first();
    }
  
  }
  
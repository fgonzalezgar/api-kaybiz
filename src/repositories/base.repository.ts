import { Model, ModelStatic, FindOptions, WhereOptions, UpdateOptions, DestroyOptions, CreateOptions } from 'sequelize';

export class BaseRepository<M extends Model> {
  constructor(protected model: ModelStatic<M>) {}

  async create(
    data: any,
    options?: CreateOptions
  ): Promise<M> {
    return this.model.create(data, options);
  }

  async findById(
    id: string,
    options?: Omit<FindOptions, 'where'>
  ): Promise<M | null> {
    return this.model.findByPk(id, options);
  }

  async findOne(
    where: WhereOptions,
    options?: Omit<FindOptions, 'where'>
  ): Promise<M | null> {
    return this.model.findOne({
      where,
      ...options,
    });
  }

  async findAll(
    where: WhereOptions,
    options?: Omit<FindOptions, 'where'>
  ): Promise<M[]> {
    return this.model.findAll({
      where,
      ...options,
    });
  }

  async update(
    where: WhereOptions,
    data: any,
    options?: Omit<UpdateOptions, 'where'>
  ): Promise<number> {
    const [affectedCount] = await this.model.update(data, {
      where,
      ...options,
    });
    return affectedCount;
  }

  async delete(
    where: WhereOptions,
    options?: Omit<DestroyOptions, 'where'>
  ): Promise<number> {
    return this.model.destroy({
      where,
      ...options,
    });
  }
}

import type { Schema } from 'mongoose';

const paginate = (schema: Schema) => {
  schema.statics.paginate = async function (options, filter) {
    let sort = '';
    if (options.sortBy) {
      const sortingCriteria: string[] = [];
      options.sortBy.split(',').forEach((sortOption: string) => {
        const [key, order] = sortOption.split(':');
        sortingCriteria.push((order === 'desc' ? '-' : '') + key);
      });
      sort = sortingCriteria.join(' ');
    } else {
      sort = 'createdAt';
    }

    if (filter.search) {
      const [key, value] = filter.search.split(':');
      filter[key] = { $regex: value.trim(), $options: 'i' };
      delete filter.search;
    }

    const limit = options.limit && Number.parseInt(options.limit, 10) > 0 ? Number.parseInt(options.limit, 10) : 10;
    const page = options.page && Number.parseInt(options.page, 10) > 0 ? Number.parseInt(options.page, 10) : 1;
    const skip = (page - 1) * limit;

    const countPromise = this.countDocuments(filter).exec();
    let docsPromise = this.find(filter).sort(sort).skip(skip).limit(limit);

    if (options.populate) {
      options.populate.split(',').forEach((populateOption: any) => {
        docsPromise = docsPromise.populate(
          populateOption
            .split('.')
            .reverse()
            .reduce((a: string, b: string) => ({ path: b, populate: a })),
        );
      });
    }

    docsPromise = docsPromise.exec();

    return Promise.all([countPromise, docsPromise]).then((values) => {
      const [totalResults, results] = values;
      const totalPages = Math.ceil(totalResults / limit);
      const result = {
        results,
        page,
        limit,
        totalPages,
        totalResults,
      };
      return Promise.resolve(result);
    });
  };
};

export default paginate;

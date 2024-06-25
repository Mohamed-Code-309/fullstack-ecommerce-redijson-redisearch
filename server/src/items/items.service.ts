import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { AggregateGroupByReducers, AggregateSteps, RedisClientType, SchemaFieldTypes } from 'redis';
const data = require('./db');

@Injectable()
export class ItemsService implements OnModuleInit {

  constructor(
    @Inject('REDIS_CONNECTION') private readonly redis: RedisClientType,
  ) { }
  //------------------------------------------------------------------------------------------------
  onModuleInit() {
    this.intilizeRedisDB()
  }

  async findAll(queryParams: any) {
    const { query, colors, minPrice, maxPrice, sort } = queryParams;
    let searchQuery = '';
    let searchOptions = { LIMIT: { from: 0, size: 30 } };

    if (query) {
      const cleaned = query
        .replaceAll(/[^a-zA-Z0-9 ]/g, '')
        .trim()
        .split(' ')
        .map((word) => (word ? `${word}*` : '')) //fuzzy search => FT.SEARCH "idx:products" '@name:(back*)'
        .join(' ');

      searchQuery += `@name:${cleaned} `;
    }

    if (colors) {
      const selectedColors = colors.replaceAll(',', '|');
      searchQuery += `@color:{${selectedColors}} `;
    }

    if (minPrice && maxPrice) {
      searchQuery += `@price:[${minPrice} ${maxPrice}] `;
    }

    if (sort) {
      switch (sort) {
        case 'priceDesc':
          Object.assign(searchOptions, { SORTBY: { BY: "price", DIRECTION: "DESC" } });
          break;
        case 'priceAsc':
          Object.assign(searchOptions, { SORTBY: { BY: "price", DIRECTION: "ASC" } });
          break;
        default:
          Object.assign(searchOptions, {});
      }
    }
    try {
      const searchResults = await this.redis.ft.search("idx:products", searchQuery, searchOptions); //cleaned
      const { total, documents } = searchResults;
      console.log(total, documents.length);
      return { products: documents.map(m => m.value) }
    } catch (error) {
      console.log(error);
    }
  }

  async group() {
    const grouping = await this.redis.ft.AGGREGATE("idx:products", '*', {
      STEPS: [
        {
          type: AggregateSteps.GROUPBY,
          properties: ['@category'],
          REDUCE: { type: AggregateGroupByReducers.COUNT, AS: "count" },
        },
      ]
    })
    return grouping;
  }

  findOne(id: number) {
    return `This action returns a #${id} item`;
  }

  remove(id: number) {
    return `This action removes a #${id} item`;
  }
  //-------------------------------------------------------------------------------------------------------------------
  private async intilizeRedisDB() {
    for (const product of data) {
      this.redis.json.set(`product#${product.id}`, '$', product);
    }
    //create the index if exis
    const indexes = await this.redis.ft._list();
    const IndexExist = indexes.find((index) => index === "idx:products");
    if (IndexExist) return;
    //create the index
    return this.redis.ft.create(
      "idx:products",
      {
        "$.name": { type: SchemaFieldTypes.TEXT, AS: "name" },
        "$.color": { type: SchemaFieldTypes.TAG, AS: "color" },
        "$.price": { type: SchemaFieldTypes.NUMERIC, AS: "price" },
        "$.category": { type: SchemaFieldTypes.TAG, AS: "category" }, //for grouping
      },
      {
        ON: "JSON",
        PREFIX: 'product#'
      }
    )
  }
}

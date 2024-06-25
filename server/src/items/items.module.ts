import { Module } from '@nestjs/common';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { createClient } from 'redis';

@Module({
  controllers: [ItemsController],
  providers: [
    ItemsService,
    {
      provide: 'REDIS_CONNECTION',
      useFactory: async (): Promise<any> => {
        try {
          const client = createClient({
            socket: {
              host: process.env.REDIS_HOST,
              port: Number(process.env.REDIS_PORT)
            }
          });
          await client.connect();
          return client;
        } catch (e) {
          throw e;
        }
      }
    },
  
  ],
})
export class ItemsModule {}

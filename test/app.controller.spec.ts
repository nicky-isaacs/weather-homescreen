import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { PrismaService } from "../src/prisma.service";
import { AppModule } from "../src/app.module";

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService,PrismaService],
      imports: [AppModule]
    }).compile();
  });

  describe('getHello', () => {
    it('should return "Hello World!"', async () => {
      const appController = app.get(AppController);
      expect(await appController.getUsers()).toEqual({
        data: 'good fucking data right here',
      });
    });
  });
});

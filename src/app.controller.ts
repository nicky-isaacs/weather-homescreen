import { Controller, Get, Header, StreamableFile } from '@nestjs/common';
import { AppService } from './app.service';
import { Readable } from 'stream';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/image_data.tif')
  @Header('Content-Type', 'image/tif')
  async getGIFData() {
    const body = await this.appService.getTIFData();

    return new StreamableFile(new Readable().wrap(body));
  }

  @Get()
  getHello() {
    return this.appService.getHello();
  }
}

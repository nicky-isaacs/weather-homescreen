import { Controller, Get, Header, Res, StreamableFile } from '@nestjs/common';
import { AppService } from './app.service';
import { Readable } from 'stream';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/gif_data.gif')
  @Header('Content-Type', 'image/gif')
  async getGIFData() {
    const body = await this.appService.getGIFData();

    return new StreamableFile(new Readable().wrap(body));
  }

  @Get()
  getHello() {
    return this.appService.getHello();
  }
}

import {
  Controller,
  Get,
  Header,
  Req,
  Request,
  StreamableFile,
} from '@nestjs/common';

import { AppService } from './app.service';
import { Readable } from 'stream';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/image_data.jpg')
  @Header('Content-Type', 'image/jpg')
  async getJPGData() {
    return new StreamableFile(await this.appService.getJPGData());
  }

  @Get('/error_data.png')
  @Header('Content-Type', 'image/png')
  async getErrorData(@Req() request: Request) {
    console.log('headers', JSON.stringify(request.headers));
    const body = this.appService.getErrorData();

    return new StreamableFile(new Readable().wrap(body));
  }

  @Get()
  getHello() {
    return this.appService.getHello();
  }
}

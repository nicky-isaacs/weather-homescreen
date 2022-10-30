import {
  Controller,
  Get,
  Header,
  Req,
  StreamableFile,
  Request,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Readable } from 'stream';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/image_data.tif')
  @Header('Content-Type', 'image/tif')
  async getGIFData(@Req() request: Request) {
    console.log('headers', JSON.stringify(request.headers));
    const body = await this.appService.getTIFData();

    return new StreamableFile(new Readable().wrap(body));
  }

  @Get('/error_data.jpg')
  @Header('Content-Type', 'image/jpg')
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

import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { createReadStream } from 'fs';
@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {}

  async getTIFData(): Promise<NodeJS.ReadableStream> {
    const response: AxiosResponse<NodeJS.ReadableStream> = await firstValueFrom(
      this.httpService.get<NodeJS.ReadableStream>(
        'https://cdn.star.nesdis.noaa.gov/GOES16/ABI/FD/GEOCOLOR/GOES16-ABI-FD-GEOCOLOR-10848x10848.tif',
        { responseType: 'stream' },
      ),
    );
    return response.data;
  }

  getErrorData(): NodeJS.ReadableStream {
    return createReadStream(__dirname + '/public/error.jpg');
  }

  getHello() {
    return {
      data: 'good fucking data right here',
    };
  }
}

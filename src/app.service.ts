import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { createReadStream } from 'fs';
import { DateTime, Duration } from 'luxon';
import { LRUCache } from 'lru-cache';
import * as sharp from 'sharp';

@Injectable()
export class AppService {
  private readonly cacheDuration = Duration.fromDurationLike({ minutes: 5 });
  private readonly imageCache: LRUCache<string, Buffer>;
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly httpService: HttpService) {
    this.imageCache = new LRUCache({
      ttl: this.cacheDuration.toMillis(),
      ttlAutopurge: false,
      max: 10,
      fetchMethod: async () => {
        const [{ data }] = await this.calculateCurrentValidMinute();
        return this.iphone12Transform(await this.stream2buffer(data));
      },
    });

    // warm the imageCache
    this.getJPGData().then(
      () => this.logger.log('imageCache warmed'),
      (err) => this.logger.error('Failed to warm imageCache', err),
    );
  }

  async getJPGData() {
    const { year, ordinal: day, hour, minute } = DateTime.now();
    const key = [year, day, hour, Math.max(59, Math.ceil(minute / 5) * 5)].join(
      '-',
    );
    return this.imageCache.fetch(key);
  }

  getErrorData(): NodeJS.ReadableStream {
    return createReadStream(__dirname + '/../public/error.png');
  }

  getHello() {
    return {
      data: 'good data right here',
    };
  }

  // 3040x2880
  private buildUrlForTime(time: DateTime) {
    const { year, ordinal: day, hour, minute } = time;
    const timeKey = `${year}${day}${hour}${minute}`;
    return `https://cdn.star.nesdis.noaa.gov/GOES18/ABI/SECTOR/wus/GEOCOLOR/${timeKey}_GOES18-ABI-wus-GEOCOLOR-4000x4000.jpg`;
  }

  /**
   * Crops the image to be used in an iphone 12 screen
   */
  private iphone12Transform(buffer: Buffer) {
    return sharp(buffer)
      .extract({ left: 400, top: 0, width: 2500, height: 2600 })
      .resize(1170, 2532)
      .toBuffer();
  }

  private async calculateCurrentValidMinute(
    startingAt: DateTime = DateTime.now(),
  ): Promise<[AxiosResponse<NodeJS.ReadableStream>, DateTime]> {
    const res = await this.executeGet(this.buildUrlForTime(startingAt));
    if (startingAt.plus({ minute: 60 }) < DateTime.now()) {
      throw new Error(`Unable to find valid time. Checked to ${startingAt}`);
    } else if (res.status === 200) {
      return [res, startingAt];
    } else if (
      // 404 indicates that this minute does not contain data, try again
      res.status === 404
    ) {
      return this.calculateCurrentValidMinute(startingAt.minus({ minute: 1 }));
    }
  }

  private async executeGet(
    url: string,
  ): Promise<AxiosResponse<NodeJS.ReadableStream>> {
    return firstValueFrom(
      this.httpService.get<NodeJS.ReadableStream>(url, {
        responseType: 'stream',
        validateStatus: (s) => s === 200 || s === 404,
      }),
    );
  }

  private async stream2buffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    // convert the stream to a buffer
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk, 'utf8'));
    }
    return Buffer.concat(chunks);
  }
}

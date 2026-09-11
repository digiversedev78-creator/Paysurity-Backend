import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class DatabaseProviderProvider {
  constructor(@Inject('DATABASE') private db: any) {}
}

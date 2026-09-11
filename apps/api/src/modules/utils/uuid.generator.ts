import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UuidGenerator {
  generateV4(): string {
    return uuidv4();
  }
}

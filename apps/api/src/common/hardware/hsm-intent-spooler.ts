import { Injectable } from '@nestjs/common';

@Injectable()
export class HSMIntentSpooler {
    async queueIntentSpool(params: any): Promise<void> {
        return;
    }
}

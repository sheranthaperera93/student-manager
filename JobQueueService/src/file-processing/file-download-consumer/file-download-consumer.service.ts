import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConsumerService } from 'src/kafka/consumer/consumer.service';

@Injectable()
export class FileDownloadConsumerService implements OnModuleInit {
    constructor(private readonly consumer: ConsumerService) {}
    
      async onModuleInit() {
        // this.consumer.consume(
        //   'job-queue-group',
        //   { topics: ['user-download'] },
        //   {
        //     eachMessage: async ({ topic, partition, message }) => {
        //       console.log({
        //         source: 'job-queue-group',
        //         message: message.value?.toString(),
        //         partition: partition.toString(),
        //         topic: topic.toString(),
        //       });
        //     },
        //   },
        // );
      }
}

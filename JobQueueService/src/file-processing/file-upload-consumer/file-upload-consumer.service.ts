import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConsumerService } from 'src/kafka/consumer/consumer.service';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as xlsx from 'xlsx';

@Injectable()
export class FileUploadConsumerService implements OnModuleInit {
  groupId: string = 'job-queue-group';

  constructor(private readonly consumer: ConsumerService) {}

  async onModuleInit() {
    this.consumer.consume(
      this.groupId,
      { topics: ['user-upload'] },
      {
        eachMessage: async ({ topic, partition, message }) => {
          console.log({
            source: this.groupId,
            message: message.value?.toString(),
            partition: partition.toString(),
            topic: topic.toString(),
          });
          this.handleFileUpload(message.value?.toString()!);
        },
      },
    );
  }

  handleFileUpload = async (message: string) => {
    const fileName = JSON.parse(message)?.fileName;
    try {
      const response = await axios.get(
        `http://localhost:3002/api/users/upload/${fileName}`,
        { responseType: 'arraybuffer' },
      );
      const uploadDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = path.join(__dirname, 'uploads', fileName);
      fs.writeFileSync(filePath, response.data);
      console.log(`File saved to ${filePath}`);
      const records = this.extractExcelContent(filePath);
      fs.unlinkSync(filePath);
      console.log(JSON.stringify(records));
    } catch (error) {
      console.error('Error fetching the file:', error);
    }
  };

  extractExcelContent(
    filePath: string,
  ): Array<{ name: string; email: string; dateOfBirth: string }> {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    const records = jsonData.slice(0).map((row: any) => {
      const dateOfBirth = this.convertExcelDate(row[2]);
      return {
        name: row[0],
        email: row[1],
        dateOfBirth,
      };
    });

    return records;
  }

  convertExcelDate(excelDate: number): string {
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }
}

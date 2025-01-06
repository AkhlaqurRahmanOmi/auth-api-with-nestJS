import { Injectable } from '@nestjs/common';
import {PrismaService} from '../../../../prisma/prisma.service';

@Injectable()
export class CandidateService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  postData(data: any): any {
    return data;
  }
  async createCandidate(data: any){
    return this.prisma.employee.create({data: data})
  }
}

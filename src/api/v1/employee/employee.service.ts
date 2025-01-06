import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service'; // Ensure this is correctly imported based on your structure

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) {}
  getHello(): string {
    return 'Hello World!';
  }
  postData(data: any): any {
    return data;
  }
  async createEmployee(data: any) {
    return this.prisma.employee.create({ data: data });
  }
}

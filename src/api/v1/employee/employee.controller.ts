import { Body, Controller, Get, Post } from '@nestjs/common';
import { EmployeeService } from './employee.service';

@Controller('api/v1/employees') // Set the base route for the employee endpoints
export class EmployeeController {
  constructor(private employeeService: EmployeeService) {}

  // GET endpoint to test the service
  @Get()
  getHello(): string {
    return this.employeeService.getHello();
  }

  // POST endpoint to create an employee
  @Post()
  createEmployee(@Body() data) {
    return this.employeeService.createEmployee(data);
  }
}

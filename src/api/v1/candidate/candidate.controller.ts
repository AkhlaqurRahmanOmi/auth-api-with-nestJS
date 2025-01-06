import { Body, Controller, Post,Get } from '@nestjs/common';
import { CandidateService } from './candidate.service';

@Controller('api/v1/candidates')
export class CandidateController {
  constructor(private  candidateService: CandidateService) {}

  @Get()
  getHello(): string {
    return this.candidateService.getHello()
  }

  @Post()
  createCandidate(@Body() data){
    return this.candidateService.createCandidate(data);
  }
}

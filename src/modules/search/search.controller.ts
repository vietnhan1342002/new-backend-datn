import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { Public } from '../user-auth/guard/public.guard';
import { Medication } from '../medications/schemas/medication.schema';

@Public()
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) { }

  @Get('doctors')
  async searchDoctors(
    @Query('query') query: string,
    @Query('limit') limit = 10,
    @Query('page') page = 1,
  ) {
    return this.searchService.searchDoctors(query || '', +page, +limit);
  }

  @Get('users')
  async searchUsers(
    @Query('query') query: string,
    @Query('limit') limit = 10,
    @Query('page') page = 1,
  ) {
    return this.searchService.searchUsers(query, +page, +limit);
  }

  @Get('specialties')
  async searchSpecialties(
    @Query('query') query: string,
    @Query('limit') limit = 10,
    @Query('page') page = 1,
  ) {
    return this.searchService.searchSpecialties(query, +page, +limit);
  }

  @Get('appointments')
  async searchAppointments(
    @Query('query') query: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.searchService.searchAppointments(query, +page, +limit);
  }

  @Get('medications')
  async searchMedications(@Query('name') name: string): Promise<Medication[]> {
    return this.searchService.searchMedication(name);
  }

}

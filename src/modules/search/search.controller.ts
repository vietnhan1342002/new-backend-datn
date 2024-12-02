import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { CreateSearchDto } from './dto/create-search.dto';
import { UpdateSearchDto } from './dto/update-search.dto';
import { Public } from '../user-auth/guard/public.guard';

@Public()
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) { }

  @Get('search-doctors')
  async search(
    @Query('query') query: string,
    // @Query('limit') limit = 10, // Mặc định là 10
    // @Query('page') page = 1, // Mặc định là trang 1
  ) {
    return this.searchService.searchDoctors(query,);
  }


}

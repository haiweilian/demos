import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DynamicModulesService } from './dynamic-modules.service';
import { CreateDynamicModuleDto } from './dto/create-dynamic-module.dto';
import { UpdateDynamicModuleDto } from './dto/update-dynamic-module.dto';

@Controller('dynamic-modules')
export class DynamicModulesController {
  constructor(private readonly dynamicModulesService: DynamicModulesService) {}

  @Post()
  create(@Body() createDynamicModuleDto: CreateDynamicModuleDto) {
    return this.dynamicModulesService.create(createDynamicModuleDto);
  }

  @Get()
  findAll() {
    return this.dynamicModulesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dynamicModulesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDynamicModuleDto: UpdateDynamicModuleDto,
  ) {
    return this.dynamicModulesService.update(+id, updateDynamicModuleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dynamicModulesService.remove(+id);
  }
}

import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { AffiliatesPayoutsService } from './affiliates-payouts.service';

@Controller('affiliates/payouts')
export class AffiliatesPayoutsController {
  constructor(private readonly affiliatesPayoutsService: AffiliatesPayoutsService) {}

  @Post()
  create(@Body() createAffiliatePayoutDto: any) {
    return (this.affiliatesPayoutsService as any).create(createAffiliatePayoutDto);
  }

  @Get()
  findAll() {
    return (this.affiliatesPayoutsService as any).findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return (this.affiliatesPayoutsService as any).findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAffiliatePayoutDto: any) {
    return (this.affiliatesPayoutsService as any).update(+id, updateAffiliatePayoutDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return (this.affiliatesPayoutsService as any).remove(+id);
  }
}



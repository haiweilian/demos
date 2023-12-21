import 'reflect-metadata'
import { FakeFactory } from './core'
import { Module, Controller, Get, Injectable } from './common'

// Service
@Injectable()
export class CatsService {
  private readonly cats: string[] = ['Lucy', 'Ketty'];

  hello(): string{
    return this.cats.join(',') + ' meow'
  }
}

// Controller
@Controller('/cats')
class CatsController{
  constructor(private catsService: CatsService) {}

  @Get('/hello')
  hello(){
    return this.catsService.hello()
  }
}

// Module
@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}

// Start
async function bootstrap() {
  const app = await FakeFactory.create(CatsModule);
  await app.listen(3000);
}
bootstrap();

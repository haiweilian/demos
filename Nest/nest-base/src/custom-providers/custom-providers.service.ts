import { Inject, Injectable } from '@nestjs/common';
import { ConfigValue, ConfigFactory, ConfigExisting } from './token';

@Injectable()
export class CustomProvidersService {
  constructor(
    // 基于非类的提供者标记
    @Inject('configValue') readonly configValue: object,
    @Inject('configFactory') readonly configFactory: object,
    @Inject('configExisting') readonly configExisting: object,
    // 基于类的提供者标记
    readonly configValue2: ConfigValue,
    readonly configFactory2: ConfigFactory,
    readonly configExisting2: ConfigExisting,
  ) {}

  config() {
    return {
      configValue: this.configValue,
      configFactory: this.configFactory,
      configExisting: this.configExisting,
      configValue2: this.configValue2,
      configFactory2: this.configFactory2,
      configExisting2: this.configExisting2,
    };
  }
}

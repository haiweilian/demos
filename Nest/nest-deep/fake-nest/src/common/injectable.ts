import { FAKE_INJECTABLE_WATERMARK } from './const'

export function Injectable(){
  return (target: any) => {
    return Reflect.defineMetadata(FAKE_INJECTABLE_WATERMARK, true, target)
  }
}

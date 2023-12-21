import { FAKE_BASE_PATH } from './const'

export function Controller(path: string) {
  return (target: any) => {
    Reflect.defineMetadata(FAKE_BASE_PATH, path, target)
  }
}

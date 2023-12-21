import { FAKE_PATH, FAKE_METHOD } from './const'

function Request(method: string) {
  return (path: string) => {
    return (target: any, propertyKey: string) => {
      Reflect.defineMetadata(FAKE_PATH, path, target, propertyKey)
      Reflect.defineMetadata(FAKE_METHOD, method, target, propertyKey)
    }
  }
}

export const Get = Request('Get')
export const Post = Request('Post')

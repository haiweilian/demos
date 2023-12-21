export function Module(metadata: Record<string, any[]>) {
  return (target: any) => {
    for(const key in metadata) {
      Reflect.defineMetadata(key, metadata[key], target)
    }
  }
}

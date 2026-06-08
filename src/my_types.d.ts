declare module '*.fbx' {
  const src: string;
  export default src;
}

declare module '*.glb' {
  const src: string;
  export default src;
}

declare module "*.glsl?raw" {
  const value: string;
  export default value;
}

declare module '*.exr' {
  const src: string;
  export default src;
}

declare module '*.hdr' {
  const src: string;
  export default src;
}

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
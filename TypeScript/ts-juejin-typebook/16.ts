type NumInfer<Str extends string> = Str extends `${infer S extends number}` ? S : Str;

type NumInferRes = NumInfer<"123">;

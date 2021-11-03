let v = 0;

function a(v) {
  const v2 = 100;
  v += v2;
}

function b() {
  a(v);
}

b();

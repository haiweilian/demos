x = 10

def outer():
  x = 20

  def inner():
    x = 30
    print("inner x:", x)

  inner()
  print("outer x:", x)

outer()
print("global x:", x)

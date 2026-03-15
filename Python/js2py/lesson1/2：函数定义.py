def process_data(data, callback=None):
  result = []
  for item in data:
    if callback:
      processed = callback(item)
    else:
      processed = item * 2
    result.append(processed)
  return result

numbers = [1, 2, 3, 4, 5]
result = process_data(numbers, lambda x: x ** 2)
print(result)

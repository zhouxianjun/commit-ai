/**
 * 一个简单的行迭代器，避免一次性 split 大字符串
 */
export async function* lineIterator(content: string): AsyncGenerator<string> {
  let start = 0;
  while (start < content.length) {
    const end = content.indexOf('\n', start);
    if (end === -1) {
      yield content.slice(start);
      break;
    }
    yield content.slice(start, end);
    start = end + 1;
  }
}

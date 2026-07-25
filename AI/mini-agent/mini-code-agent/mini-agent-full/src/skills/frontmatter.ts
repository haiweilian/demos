// src/skills/frontmatter.ts

export interface ParsedFile {
  frontmatter: Record<string, string | string[]>;
  body: string;
}

/**
 * 极简 frontmatter 解析器。只支持本章用到的两种值：
 * 标量字符串、字符串数组（["a","b"]）。需要嵌套结构时再换成真正的 YAML 库。
 */
export function parseFrontmatter(content: string): ParsedFile {
  if (!content.startsWith("---")) return { frontmatter: {}, body: content };

  const end = content.indexOf("\n---", 3); // 第二个 --- 是 frontmatter 的结束
  if (end === -1) return { frontmatter: {}, body: content };

  const raw = content.slice(3, end).trim();
  const body = content.slice(end + 4).replace(/^\n+/, "");

  const frontmatter: Record<string, string | string[]> = {};
  for (const line of raw.split("\n")) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const valueRaw = line.slice(colon + 1).trim();
    const unquote = (s: string) => s.trim().replace(/^["']|["']$/g, "");
    if (valueRaw.startsWith("[") && valueRaw.endsWith("]")) {
      // 字符串数组：allowed-tools: ["ReadFile", "Search"]
      frontmatter[key] = valueRaw
        .slice(1, -1)
        .split(",")
        .map(unquote)
        .filter((s) => s.length > 0);
    } else {
      frontmatter[key] = unquote(valueRaw); // 标量
    }
  }
  return { frontmatter, body };
}

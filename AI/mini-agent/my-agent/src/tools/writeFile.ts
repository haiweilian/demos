// src/tools/writeFile.ts
// 对应 Claude Code: src/tools/FileWriteTool/FileWriteTool.ts

import * as fs from "fs/promises";
import * as path from "path";
import type { Tool, ToolResult } from "../types.js";

export const WriteFileTool: Tool = {
  name: "WriteFile",
  description:
    "Write content to a file at the specified path. " +
    "Creates the file if it doesn't exist, or overwrites if it does. " +
    "Automatically creates parent directories as needed.",
  inputSchema: {
    type: "object",
    properties: {
      file_path: {
        type: "string",
        description:
          "The path to write the file to. Can be absolute or relative to cwd.",
      },
      content: {
        type: "string",
        description: "The content to write to the file.",
      },
    },
    required: ["file_path", "content"],
  },
  isReadOnly: false,

  async execute(
    args: Record<string, unknown>,
    cwd: string,
  ): Promise<ToolResult> {
    const filePath = args.file_path as string;
    const content = args.content as string;

    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(cwd, filePath);

    try {
      // 检查文件是否已存在
      let isNew = true;
      let oldContent = "";
      try {
        oldContent = await fs.readFile(resolvedPath, "utf-8");
        isNew = false;
      } catch {
        // 文件不存在，这是新建
      }

      // 自动创建父目录
      await fs.mkdir(path.dirname(resolvedPath), { recursive: true });

      // 写入文件
      await fs.writeFile(resolvedPath, content, "utf-8");

      // 构建结果信息
      if (isNew) {
        const lineCount = content.split("\n").length;
        return {
          content: `Created new file: ${resolvedPath} (${lineCount} lines)`,
          isError: false,
        };
      } else {
        // 简单的 diff 统计
        const oldLines = oldContent.split("\n").length;
        const newLines = content.split("\n").length;
        return {
          content:
            `Updated file: ${resolvedPath}\n` +
            `Lines: ${oldLines} → ${newLines} (${newLines >= oldLines ? "+" : ""}${newLines - oldLines})`,
          isError: false,
        };
      }
    } catch (err) {
      const error = err as Error;
      return {
        content: `Error writing file: ${error.message}`,
        isError: true,
      };
    }
  },
};

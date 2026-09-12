// src/tools/readFile.ts
// 对应 Claude Code: src/tools/FileReadTool/FileReadTool.ts

import * as fs from "fs/promises";
import * as path from "path";
import type { Tool, ToolResult } from "../types.js";

export const ReadFileTool: Tool = {
  name: "ReadFile",
  description:
    "Read the contents of a file at the specified path. " +
    "Use this when you need to examine existing files. " +
    "The output includes line numbers for reference.",
  inputSchema: {
    type: "object",
    properties: {
      file_path: {
        type: "string",
        description:
          "The path to the file to read. Can be absolute or relative to cwd.",
      },
      offset: {
        type: "number",
        description:
          "Line number to start reading from (0-indexed). Defaults to 0.",
      },
      limit: {
        type: "number",
        description:
          "Maximum number of lines to read. Defaults to 2000.",
      },
    },
    required: ["file_path"],
  },
  isReadOnly: true,

  async execute(
    args: Record<string, unknown>,
    cwd: string,
  ): Promise<ToolResult> {
    const filePath = args.file_path as string;
    const offset = (args.offset as number) ?? 0;
    const limit = (args.limit as number) ?? 2000;

    // 解析路径：支持绝对路径和相对路径
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(cwd, filePath);

    try {
      // 检查文件是否存在
      const stat = await fs.stat(resolvedPath);

      if (stat.isDirectory()) {
        // 如果是目录，列出内容（类似 Claude Code 的行为）
        const entries = await fs.readdir(resolvedPath);
        const listing = entries
          .slice(0, 100)
          .map((e) => `  ${e}`)
          .join("\n");
        return {
          content: `Directory: ${resolvedPath}\n${listing}` +
            (entries.length > 100
              ? `\n  ... and ${entries.length - 100} more`
              : ""),
          isError: false,
        };
      }

      // 读取文件内容
      const raw = await fs.readFile(resolvedPath, "utf-8");
      const lines = raw.split("\n");
      const totalLines = lines.length;

      // 应用 offset 和 limit
      const selectedLines = lines.slice(offset, offset + limit);

      // 添加行号（对应 Claude Code 的 addLineNumbers 函数）
      const numbered = selectedLines
        .map((line, i) => `${offset + i + 1}\t${line}`)
        .join("\n");

      let result = numbered;

      // 如果文件被截断，添加提示
      if (offset + limit < totalLines) {
        result += `\n\n--- File truncated. Showing lines ${offset + 1}-${offset + selectedLines.length} of ${totalLines} total. ---`;
      }

      return { content: result, isError: false };
    } catch (err) {
      const error = err as NodeJS.ErrnoException;
      if (error.code === "ENOENT") {
        return {
          content: `Error: File not found: ${resolvedPath}\n` +
            `Note: The current working directory is ${cwd}`,
          isError: true,
        };
      }
      return {
        content: `Error reading file: ${error.message}`,
        isError: true,
      };
    }
  },
};

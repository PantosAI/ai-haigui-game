const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const path = require("path");

// Load env files explicitly so server works regardless of CWD.
// 1) server/.env (intended for backend)
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config({ path: path.resolve(__dirname, ".env.local") });
// 2) project root .env / .env.local (sometimes used by frontend tooling)
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const app = express();
const serverStartAt = Date.now();

// CORS: default cors() allows all origins
app.use(cors());
app.options("*", cors());

const rootPackage = (() => {
  try {
    // /server/index.js -> /package.json
    return require("../package.json");
  } catch {
    return {};
  }
})();
const serverPackage = (() => {
  try {
    return require("./package.json");
  } catch {
    return {};
  }
})();

// Parse JSON request bodies
app.use(express.json());

app.get("/", (req, res) => {
  const name = rootPackage?.name ?? serverPackage?.name ?? "unknown-project";
  const version = rootPackage?.version ?? serverPackage?.version ?? "unknown-version";

  res.json({
    name,
    version,
    server: {
      status: "running",
      uptimeSeconds: Math.floor(process.uptime()),
      startedAt: new Date(serverStartAt).toISOString(),
    },
  });
});

app.get("/api/test", (req, res) => {
  console.log(
    "📢 收到前端的测试请求了！时间：",
    new Date().toLocaleString(),
    "| ip：",
    req.ip,
    "| ua：",
    req.get("user-agent") ?? ""
  );
  res.json({ message: "Server is Live!" });
});

function normalizeAIAnswer(raw) {
  // Strict check: only allow exact outputs after trimming.
  const s = String(raw ?? "").trim();
  if (s === "是" || s === "不是" || s === "无关") return s;
  return "无关";
}

app.post("/api/chat", async (req, res) => {
  try {
    const { question, story } = req.body ?? {};
    const ts = new Date().toLocaleString();
    const logTitle = story?.title && typeof story.title === "string" ? story.title : "";
    const questionLog =
      typeof question === "string" && question.trim() ? question.trim() : "(空)";
    console.log(
      `[${ts}] 用户提问: ${questionLog} | 故事标题: ${logTitle || "(未知)"}`,
    );

    if (typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        error: { code: "BAD_REQUEST", message: "Invalid request: missing `question`." },
      });
    }

    if (!story || typeof story !== "object") {
      return res.status(400).json({
        error: { code: "BAD_REQUEST", message: "Invalid request: missing `story`." },
      });
    }

    // 标题/内容（给 Prompt 使用）
    const title = typeof story.title === "string" ? story.title : "";
    const surface = typeof story.surface === "string" ? story.surface : "";
    const bottom = typeof story.bottom === "string" ? story.bottom : "";

    if (!title || !surface || !bottom) {
      return res
        .status(400)
        .json({
          error: {
            code: "BAD_REQUEST",
            message: "Invalid request: `story` must include `title`, `surface`, `bottom`.",
          },
        });
    }

    // 从环境变量读取 DeepSeek 配置
    const API_KEY =
      process.env.DEEPSEEK_API_KEY ?? process.env.VITE_DEEPSEEK_API_KEY;
    if (!API_KEY) {
      // Avoid leaking secrets: only print presence flags.
      console.error("SERVER_MISCONFIGURED_ENV", {
        DEEPSEEK_API_KEY: Boolean(process.env.DEEPSEEK_API_KEY),
        VITE_DEEPSEEK_API_KEY: Boolean(process.env.VITE_DEEPSEEK_API_KEY),
      });
      return res.status(500).json({
        error: {
          code: "SERVER_MISCONFIGURED",
          message:
            "Server misconfigured: missing DEEPSEEK_API_KEY (or VITE_DEEPSEEK_API_KEY).",
        },
      });
    }

    const BASE_URL =
      process.env.DEEPSEEK_BASE_URL ??
      process.env.VITE_DEEPSEEK_BASE_URL ??
      "https://api.deepseek.com";

    // 给 AI 的指令（Prompt）
    const prompt = `
# Role
你是“海归汤”游戏的专业裁判。你只根据“故事真相”判断玩家问题的真假或相关性。

# Rules
1. 只能输出以下三个词之一：是 / 不是 / 无关。
2. 输出必须是单独的一行：只能包含这三个词之一，不要任何多余文字、标点、引号或空格，也不要换行以外的内容。
3. 严禁剧透：不得复述或暴露故事真相细节、人物关系、过程要点或任何可识别的线索。
4. 严禁解释原因：不要复述推理过程、依据、规则或聊天内容。
5. 无法确定为“是”或“不是”，或问题与故事事实无关时，输出“无关”。

# Examples
示例一
故事标题：无关示例
故事表面：无关
故事真相：无关
玩家提问：今天天气好吗
裁判回答：无关

示例二
故事标题：凶手示例A
故事表面：略
故事真相：凶手是女人
玩家提问：凶手是女人吗
裁判回答：是

示例三
故事标题：凶手示例B
故事表面：略
故事真相：凶手不是女人
玩家提问：凶手是女人吗
裁判回答：不是

当前故事标题：${title}
当前故事表面：${surface}
当前故事真相：${bottom}
玩家提问：${question}
裁判回答：
`.trim();

    const url = `${BASE_URL.replace(/\/+$/, "")}/chat/completions`;

    let response;
    try {
      // 这里单独 try-catch：避免 DeepSeek 异常导致 Node 进程崩溃
      response = await axios.post(
        url,
        {
          model: "deepseek-chat",
          messages: [{ role: "system", content: prompt }],
          temperature: 0.2,
          max_tokens: 8,
        },
        {
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${API_KEY}`,
          },
          timeout: 15000, // 15s 超时，避免前端长时间等待
        },
      );
    } catch (err) {
      const status = err?.response?.status ?? 502;
      const deepseekMessage =
        err?.response?.data?.message ??
        err?.response?.data?.error?.message ??
        err?.message ??
        "DeepSeek 请求失败";

      return res.status(502).json({
        error: {
          code: "DEEPSEEK_ERROR",
          message: "DeepSeek 服务异常，请稍后重试。",
          status,
          details: String(deepseekMessage),
        },
      });
    }

    const data = response?.data;
    const content =
      data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.delta?.content ?? "";

    return res.json({ answer: normalizeAIAnswer(String(content)) });
  } catch (err) {
    return res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "AI请求失败，请稍后再试。",
      },
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});


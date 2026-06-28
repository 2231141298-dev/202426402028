import { runScoreSkill } from './skills.js';

const DEFAULT_BASE_URL = 'https://maas-api.cn-huabei-1.xf-yun.com/v2';
const DEFAULT_MODEL = 'xopqwen36v35b';

function sendJson(response, status, data) {
  response.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(data));
}

function buildPrompt({ profile, question, localAnswer, skillResult }) {
  return [
    '你是嵌入成绩查询网页的学业成绩分析 Agent。',
    '你的工作方式是：先调用后端 Skill 得到确定数据，再用自然语言给学生解释。',
    '不要编造不存在的课程、奖项、政策或个人隐私。',
    '回答要用中文，语气自然，结论明确，尽量控制在 120 字以内。',
    '如果用户问开放闲聊，要自然引导回成绩分析、排名对比、优势短板、提升计划。',
    '',
    `已调用 Skill：${skillResult.name}`,
    `Skill 结构化结果：${JSON.stringify(skillResult.data)}`,
    `学生成绩摘要：${JSON.stringify(profile)}`,
    `本地兜底分析：${localAnswer}`,
    `用户问题：${question}`
  ].join('\n');
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return sendJson(response, 405, { error: 'Method not allowed' });
  }

  const apiKey = process.env.XFYUN_API_KEY;
  const baseUrl = process.env.XFYUN_BASE_URL || DEFAULT_BASE_URL;
  const model = process.env.XFYUN_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    return sendJson(response, 500, { error: 'Missing XFYUN_API_KEY' });
  }

  try {
    const { question = '', profile, localAnswer = '' } = request.body || {};
    const cleanQuestion = String(question).trim().slice(0, 160);

    if (!cleanQuestion || !profile) {
      return sendJson(response, 400, { error: 'Missing question or profile' });
    }

    const skillResult = runScoreSkill(cleanQuestion, profile);

    const upstream = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: '你是严谨、简洁、可解释的学业成绩分析助手。'
          },
          {
            role: 'user',
            content: buildPrompt({
              profile,
              question: cleanQuestion,
              localAnswer,
              skillResult
            })
          }
        ],
        temperature: 0.25,
        max_tokens: 180
      })
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return sendJson(response, upstream.status, {
        error: data.error?.message || data.message || 'Upstream request failed',
        skill: skillResult.name,
        skillData: skillResult.data
      });
    }

    const answer = data.choices?.[0]?.message?.content?.trim();
    if (!answer) {
      return sendJson(response, 502, { error: 'Empty model response' });
    }

    return sendJson(response, 200, {
      answer,
      skill: skillResult.name,
      skillData: skillResult.data
    });
  } catch (error) {
    return sendJson(response, 500, { error: error.message || 'Agent request failed' });
  }
}

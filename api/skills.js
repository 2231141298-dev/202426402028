function hasAny(text, words) {
  return words.some((word) => text.includes(word));
}

function summarySkill(profile) {
  return {
    name: '成绩总结 Skill',
    data: {
      summary: `${profile.name}综合成绩${profile.totalScore}分，排名第${profile.rank}/${profile.total}，处于${profile.level}。`,
      aboveAverage: Number((profile.totalScore - profile.avgTotal).toFixed(2)),
      strongerPart: profile.strongerPart,
      weakerPart: profile.weakerPart
    }
  };
}

function classCompareSkill(profile) {
  return {
    name: '班级对比 Skill',
    data: {
      rank: profile.rank,
      total: profile.total,
      beatPercent: profile.beatPercent,
      avgTotal: profile.avgTotal,
      topScore: profile.topScore,
      nextGap: profile.nextGap,
      top10Gap: profile.top10Gap,
      top20Gap: profile.top20Gap,
      majorRank: profile.majorRank,
      conductRank: profile.conductRank
    }
  };
}

function growthPlanSkill(profile) {
  return {
    name: '提升计划 Skill',
    data: {
      priority: profile.weakerPart,
      keep: profile.strongerPart,
      weeklyGoal: `本周复盘${profile.weakerPart}相关内容，找出2个最容易补分的小项。`,
      monthlyGoal: '本月争取综合分提升1到2分。',
      rankGoal: profile.rank <= 10 ? '稳定前10并冲击更高名次。' : `优先缩小与前10的${profile.top10Gap}分差距。`
    }
  };
}

function trendSkill(profile) {
  const trend = profile.termChange > 1
    ? '进步'
    : profile.termChange < -1
      ? '退步'
      : '稳定';

  return {
    name: '学期趋势 Skill',
    data: {
      firstTerm: profile.firstTerm,
      secondTerm: profile.secondTerm,
      termChange: profile.termChange,
      trend
    }
  };
}

function explainSkill(profile) {
  return {
    name: '分析依据 Skill',
    data: {
      usedFields: ['综合成绩', '总排名', '班级均分', '专业成绩', '综测成绩', '上下学期变化'],
      rules: [
        '按排名比例判断班级位置',
        '比较个人综合分与班级均分',
        '比较专业成绩排名和综测成绩排名',
        '根据上下学期分差判断趋势'
      ],
      limitation: '只基于当前页面传入的成绩摘要，不推断页面外信息。'
    }
  };
}

export function runScoreSkill(question, profile) {
  const text = question.toLowerCase().replace(/\s+/g, '');

  if (hasAny(text, ['前十', '前10', '前二十', '前20', '排名', '第几', '名次', '均分', '平均', '最高', '最低'])) {
    return classCompareSkill(profile);
  }

  if (hasAny(text, ['计划', '提升', '建议', '怎么做', '怎么提升', '努力方向', '短板', '弱项', '专业', '综测'])) {
    return growthPlanSkill(profile);
  }

  if (hasAny(text, ['退步', '进步', '趋势', '大一上', '大一下', '上学期', '下学期'])) {
    return trendSkill(profile);
  }

  if (hasAny(text, ['依据', '为什么', '怎么分析', '原理', '规则', '解释'])) {
    return explainSkill(profile);
  }

  return summarySkill(profile);
}

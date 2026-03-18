export type Difficulty = 'easy' | 'medium' | 'hard'

export type Story = {
  id: string
  title: string
  difficulty: Difficulty
  surface: string
  bottom: string
}

export type DifficultyCN = '简单' | '中等' | '困难'

export type StoryInput = {
  id: string
  title: string
  content: string // 汤面
  answer: string // 汤底
  difficulty: DifficultyCN
}

// 供外部使用的新版数据结构（你要求的导出格式）
export const STORIES: StoryInput[] = [
  {
    id: 'elevator',
    title: '电梯',
    difficulty: '简单',
    content: '一个男人乘电梯来到四楼，刚走出电梯就立刻自杀了。',
    answer:
      '他去的并不是普通的四楼。那家医院的四楼被院方“谐音”成了“死楼”，主要就是停放遗体的太平间区域。男人按下四楼按钮后，看见亲人的遗体确认死亡真相，精神崩溃后自杀。',
  },
  {
    id: 'seaweed',
    title: '水草',
    difficulty: '简单',
    content: '男人每天都去同一家酒吧，点一杯“水草”。某天他喝完后冲出酒吧自杀了。',
    answer:
      '他其实是在点英语“威士忌”（whisky）。因为口音把 whisky 说成了“水草”，酒保听错后一直给他威士忌。男人本来被医生要求戒酒、只能喝无酒精的“药饮”，因此当威士忌反复触发病情后，他在确认自己被误喂酒精导致命运走到尽头时选择自杀。',
  },
  {
    id: 'penguin-meat',
    title: '企鹅肉',
    difficulty: '中等',
    content: '一个人在暴风雪后吃了一口“企鹅肉”汤，立刻冲出餐厅自杀了。',
    answer:
      '他当年曾在极地/荒野遇险，朋友为了救他活下去，把自己的肉切下来熬汤，谎称那是“企鹅肉”。多年后他终于在正常餐厅吃到真正的企鹅肉，味道和体感完全不同，他意识到当年的“救命汤”其实是人肉，无法承受真相于是自杀。',
  },
  {
    id: 'strawberry-cake',
    title: '草莓蛋糕',
    difficulty: '中等',
    content: '生日会上，一个人吃了一口“草莓蛋糕”后立刻报警，随后当场自杀了。',
    answer:
      '蛋糕并不是普通食物。多年前他曾目睹同款“草莓蛋糕”被用来投毒害死过人；当他再次吃到同样的口味与配方（他能从细节确认），他立刻意识到有人在复刻当年的谋杀。真相揭露后他无力再继续活下去，于是报警并自杀。',
  },
  {
    id: 'turtle-meat',
    title: '海龟肉',
    difficulty: '困难',
    content: '一个人吃了一口海龟汤，立刻冲出餐厅自杀了。',
    answer:
      '他曾在海难中漂流，和同伴活活熬到了最后。为了让他活下去，同伴谎称“这是海龟汤”，把同伴自己的肉熬成肉汤给他。后来他在餐厅真正吃到海龟肉，才发现味道完全不同；确认当年吃的其实是同伴的肉后，他无法承受背叛与代价，最终自杀。',
  },
]

const difficultyCnToEn: Record<DifficultyCN, Difficulty> = {
  简单: 'easy',
  中等: 'medium',
  困难: 'hard',
}

// 保持旧导出不变，避免现有前端/后端（仍读取 `stories/surface/bottom`）在运行时出错。
export const stories: Story[] = STORIES.map((s) => ({
  id: s.id,
  title: s.title,
  difficulty: difficultyCnToEn[s.difficulty],
  surface: s.content,
  bottom: s.answer,
}))


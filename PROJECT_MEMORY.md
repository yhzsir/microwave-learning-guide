# 项目记忆：microwave-learning-guide（微波技术基础在线学习指南）

> 本文件记录项目背景、历史改动与协作约定，供后续继续开发时快速恢复上下文。

## 基本信息
- 仓库：`C:\Users\Ben Yue\microwave-learning-guide`，GitHub `yhzsir/microwave-learning-guide`
- Pages 站点：`https://yhzsir.github.io/microwave-learning-guide/`
- 内容创作需遵循 `AUTHORING.md` 标准；保持中文讲解 + 中英术语对照的写作风格。

## 背景
原站点按传统微波教材 6 章 + 2 专题组织。用户在 CityUHK 选修 EE5425《Fundamentals of
Radio Frequency (RF) Circuit Engineering》（共 7 个模块），要求网站内容与该课程大纲对齐。

## 已完成的结构性改动

1. **新增章节**：ch09（射频放大器设计）、ch10（稳定性与振荡器设计）、ch11（射频测量
   技术），覆盖 EE5425 模块 5/6/7。
2. **补充内容**：ch02 增加电长度(ELL)与双枝节匹配，对应模块 3。
3. **选学/非考点标记**：以下内容不在 EE5425 大纲内，已标记为"选学 / EE5425不考"：
   - ch03（规则金属波导，整章）
   - ch04（同轴线/带状线/微带线等，整章）
   - ch06 §6.6（功率分配器件，仅该节）
   - ch07、ch08（专题证明题，整章）
   
   标记方式（统一视觉风格，虚线边框 + 徽章）：
   - 侧边栏导航：`.nav-link--optional` + `nav-badge-optional`
   - 右侧页内目录（TOC）：`.toc-link--optional`
   - 正文标题：`.h-badge-optional`
   - 首页章节卡片：`.card--optional` + `.chip--optional`

4. **首页卡片是手写的，不自动联动**：`content/index.md` 的章节卡片列表独立维护，
   不会随 `tools/build.ps1` 的章节配置自动更新。**今后新增/调整章节时必须记得同步
   手动修改首页卡片**，这是曾经漏掉过的一个坑。

5. **五个速查/参考页面**（`exam.md` 考点总纲、`formulas.md` 公式速查、`quiz.md`
   综合自测题、`roadmap.md` 学习路线图、`resources.md` 课件资源）开头统一加了
   "EE5425 适用范围提示"框，说明选学章节与新增 9-11 章的定位。

6. **ch09-11 内容已并入三个速查页面**：
   - `formulas.md` 新增"十二～十四"三个章节（放大器增益公式、K-Δ/μ 稳定性判据、
     VNA 误差模型与 Y 因子噪声公式），并更新了"快速自检"对照表。
   - `exam.md` 新增第 9/10/11 章完整考点矩阵表格，并在自测清单中加入对应打勾项。
   - `quiz.md` 新增"第 9～11 章 自测"一节，9 道精选题（选择/填空/计算）及详解。

7. **app.js 翻页器数据同步**：`assets/js/app.js` 内独立维护的章节列表（用于"上一章/
   下一章"翻页逻辑）需要和 `tools/build.ps1` 的章节配置保持同步，曾因漏掉 ch09-11
   导致翻页 bug，已修复。

## 构建与发布流程

```powershell
cd "C:\Users\Ben Yue\microwave-learning-guide"
powershell -ExecutionPolicy Bypass -File tools\build.ps1
# 确认输出显示："11 章 + 6 页 + 1 工具 + N 条索引"，无报错
git add -A
git commit -m "..."
git push
```

GitHub Pages 通常 1-2 分钟后生效。

## 提交历史（供追溯）

`430b87c` → `4e1d5b8` → `d53a536` → `46f3109` → `d5aff3f` → `e16bbdd`

大致对应：
1. 按 EE5425 大纲扩展，新增三章 + 补充 ELL/双枝节 + 非考点标注
2. 选学内容边框/徽章明显化 + 修复 app.js 翻页 bug
3. 标记第 4/7/8 章为选学
4. 首页补充第 9-11 章卡片，标记选学章节
5. 五个速查页面补充 EE5425 适用范围提示
6. 将第 9-11 章核心公式/考点/自测题并入三个统一速查页面

## 当前状态 / 下一步

- 目前无遗留阻塞项，所有已提出需求均已完成并推送。
- 后续若用户提出新内容扩展、章节调整或结构性改动，优先检查是否需要同步：
  - 首页卡片（`content/index.md`）
  - `tools/build.ps1` 的章节配置（含 `optional` 标记）
  - `assets/js/app.js` 的翻页器章节列表
  - 五个速查/参考页面的范围提示与内容矩阵

#!/usr/bin/env node
/**
 * Automated rules audit for Circuit Planner.
 * Parses JS/TS AST via ts-morph and classifies rule-related logic.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fg from 'fast-glob'
import { Project, SyntaxKind, Node } from 'ts-morph'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SRC_GLOB = 'src/**/*.{ts,tsx,js,jsx}'

const CATEGORIES = [
  'Class Structure',
  'Floor Location',
  'Station',
  'Equipment',
  'Exercise Selection',
  'Category Balance',
  'Load / Fatigue',
  'Transition / Setup',
  'Overrides / Warnings',
  'Planner Algorithm Logic',
  'UI Validation',
]

const CATEGORY_SIGNALS = {
  'Class Structure': [
    /stationcount/i,
    /classroundcount/i,
    /roundcount/i,
    /repeat_window/i,
    /repeatwindow/i,
    /getclassroundcount/i,
    /slotsToGenerate/i,
    /requested_station_count/i,
    /class_round/i,
    /requires_4_rounds/i,
    /threeRoundClass/i,
    /fourRound/i,
  ],
  'Floor Location': [
    /\b[SGO]\d+\b/,
    /locationcode/i,
    /location_code/i,
    /locationassignment/i,
    /assignlocation/i,
    /expandlocationcodes/i,
    /station_locations/i,
    /activeLocation/i,
    /MOVABLE_ALLOWED/i,
    /MOVABLE_FORBIDDEN/i,
    /ALLOWED_LOCATIONS/i,
    /ADJACENT_BENCH/i,
    /outdoor|strength|gym floor/i,
    /zone-panel/i,
    /db-conflict/i,
    /blocks-s[23]/i,
    /g4-blocks-g3/i,
    /S1\+S2/i,
    /isKnownLocation/i,
    /ALL_LOCATION_CODES/i,
  ],
  Station: [
    /station_number/i,
    /stationNumber/i,
    /station_template/i,
    /stationtemplate/i,
    /station_name/i,
    /stationName/i,
    /stationCount/i,
    /# of stations/i,
    /clearedSlot/i,
    /lockedRows/i,
    /renumberCircuit/i,
    /clearCircuitRow/i,
  ],
  Equipment: [
    /EQUIPMENT_TYPES/i,
    /EQUIPMENT_CAPACITY/i,
    /equipment_required/i,
    /equipmentRequired/i,
    /classifyEquipment/i,
    /getEquipmentType/i,
    /weight_bench/i,
    /weight bench/i,
    /leg_sled/i,
    /leg sled/i,
    /ski_erg/i,
    /rebounder/i,
    /trx/i,
    /cable_dual/i,
    /benchStationCount/i,
    /equipmentCounts/i,
    /equipmentAllowedLocations/i,
  ],
  'Exercise Selection': [
    /selectStations/i,
    /station_family/i,
    /stationFamily/i,
    /duplicateFamily/i,
    /familyCounts/i,
    /pickFromPool/i,
    /pickForCategory/i,
    /eligibleSwap/i,
    /getEligibleSwapTemplates/i,
    /swapCandidates/i,
    /filterActiveTemplates/i,
    /usedTemplateIds/i,
    /lockedTemplates/i,
  ],
  'Category Balance': [
    /planner_category/i,
    /plannerCategory/i,
    /PLANNER_CATEGORIES/i,
    /categoryTargets/i,
    /categoryCounts/i,
    /categoryBalance/i,
    /category-progress/i,
    /availableCategories/i,
    /unavailableCategories/i,
    /calculateCategoryTargets/i,
    /buildCategoryBalance/i,
    /no eligible stations remaining for/i,
  ],
  'Load / Fatigue': [
    /heavy_low_back/i,
    /heavy_shoulder/i,
    /twisting_loaded/i,
    /heavyLowBack/i,
    /heavyShoulder/i,
    /twistingLoaded/i,
    /HEAVY_LIMIT/i,
    /MAX_HEAVY/i,
    /heavy limit/i,
    /fatigue/i,
  ],
  'Transition / Setup': [
    /ASSIGNMENT_PRIORITY/i,
    /assignment priority/i,
    /pickLocationForTemplate/i,
    /ranked/i,
    /placement/i,
    /evaluatePlacement/i,
    /applyAssignment/i,
    /markLocationUsed/i,
    /getPreferredLocations/i,
    /strictness/i,
    /force fill/i,
    /relaxed/i,
  ],
  'Overrides / Warnings': [
    /warning/i,
    /violation/i,
    /warn(ing)?s?/i,
    /manuallyEdited/i,
    /locked/i,
    /rule_violations/i,
    /inferViolationType/i,
    /categorizeWarnings/i,
    /mergeCategorizedWarnings/i,
    /validateCircuit/i,
    /ruleValidator/i,
    /RuleCheck/i,
    /insights/i,
    /recordForcedConstraintWarnings/i,
  ],
  'Planner Algorithm Logic': [
    /generateCircuit/i,
    /circuitGenerator/i,
    /assignLocations/i,
    /stationSelector/i,
    /selectionWarnings/i,
    /templatesForAssignment/i,
    /existingAssignments/i,
    /createSelectionState/i,
    /passesPreferredConstraints/i,
    /wouldIncludeFourRoundStation/i,
    /pickRemainingCandidate/i,
    /runValidation/i,
    /applyValidation/i,
  ],
  'UI Validation': [
    /WarningsPanel/i,
    /insights-panel/i,
    /rule-check/i,
    /category-progress/i,
    /empty-state/i,
    /canSave/i,
    /generated/i,
    /Rule Checks/i,
    /Location Notes/i,
    /Category Balance/i,
    /validateCircuit/i,
    /buildRuleValidationSummary/i,
    /isViolation/i,
    /rule-check-row/i,
  ],
}

const UI_ONLY_FILES = new Set([
  'src/components/Sidebar.jsx',
  'src/components/GenerateControls.jsx',
  'src/components/CircuitTable.jsx',
  'src/components/CircuitMap.jsx',
  'src/components/MoveConfirmModal.jsx',
  'src/components/SwapModal.jsx',
  'src/main.jsx',
])

const DATA_ACCESS_FILES = new Set([
  'src/lib/supabaseClient.js',
  'src/lib/fetchReferenceData.js',
  'src/lib/saveClass.js',
])

function relativePath(absolutePath) {
  return path.relative(ROOT, absolutePath).split(path.sep).join('/')
}

function getSnippet(node, maxLen = 220) {
  const text = node.getText().replace(/\s+/g, ' ').trim()
  if (text.length <= maxLen) return text
  return `${text.slice(0, maxLen - 3)}...`
}

function getEnclosingFunctionName(node) {
  const fn = node.getFirstAncestor((ancestor) => {
    const kind = ancestor.getKind()
    return (
      kind === SyntaxKind.FunctionDeclaration ||
      kind === SyntaxKind.MethodDeclaration ||
      kind === SyntaxKind.ArrowFunction ||
      kind === SyntaxKind.FunctionExpression
    )
  })

  if (!fn) return null

  if (Node.isFunctionDeclaration(fn) || Node.isMethodDeclaration(fn)) {
    return fn.getName() ?? '(anonymous)'
  }

  const variable = fn.getFirstAncestorByKind(SyntaxKind.VariableDeclaration)
  if (variable?.getName()) return variable.getName()

  const property = fn.getFirstAncestorByKind(SyntaxKind.PropertyAssignment)
  if (property && Node.isIdentifier(property.getNameNode())) {
    return property.getNameNode().getText()
  }

  return '(anonymous)'
}

function collectContextText(node) {
  const parts = [node.getText()]

  const fn = node.getFirstAncestor((a) =>
    Node.isFunctionDeclaration(a) ||
    Node.isFunctionExpression(a) ||
    Node.isArrowFunction(a) ||
    Node.isMethodDeclaration(a),
  )
  if (fn) parts.push(fn.getText().slice(0, 800))

  let current = node
  for (let depth = 0; depth < 4 && current; depth += 1) {
    current = current.getParent()
    if (current) parts.push(current.getText().slice(0, 400))
  }

  return parts.join('\n')
}

function scoreCategory(text, filePath) {
  const scores = Object.fromEntries(CATEGORIES.map((c) => [c, 0]))

  for (const [category, patterns] of Object.entries(CATEGORY_SIGNALS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) scores[category] += 1
    }
  }

  if (/components\//.test(filePath)) scores['UI Validation'] += 2
  if (/lib\/ruleValidator/.test(filePath)) scores['Overrides / Warnings'] += 3
  if (/lib\/locationAssignment/.test(filePath)) {
    scores['Floor Location'] += 3
    scores['Transition / Setup'] += 2
  }
  if (/lib\/stationSelector/.test(filePath)) scores['Exercise Selection'] += 2
  if (/lib\/circuitGenerator/.test(filePath)) scores['Planner Algorithm Logic'] += 3
  if (/lib\/rounds/.test(filePath)) scores['Class Structure'] += 3
  if (/lib\/warningCategories/.test(filePath)) scores['Overrides / Warnings'] += 2
  if (/lib\/manualEdits/.test(filePath)) scores['Exercise Selection'] += 1

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const [topCategory, topScore] = ranked[0]

  if (topScore === 0) {
    return { category: 'Planner Algorithm Logic', score: 0 }
  }
  return { category: topCategory, score: topScore }
}

function isTrivialGuard(node) {
  const snippet = getSnippet(node, 100).replace(/\s+/g, ' ')
  return (
    /^if\s*\(\s*!?\s*[\w.?]+\s*\)\s*return\b/.test(snippet) ||
    /^if\s*\(\s*!?\s*[\w.?]+\s*\|\|/.test(snippet)
  )
}

function inferRecommendation(category, filePath, nodeKind, snippet) {
  const rel = filePath.replace(/\\/g, '/')

  if (UI_ONLY_FILES.has(rel)) {
    if (
      category === 'UI Validation' ||
      /display|render|className|aria-|onClick|onDrag|modal|table|map-layout/i.test(snippet)
    ) {
      return 'keep in code'
    }
  }

  if (DATA_ACCESS_FILES.has(rel)) {
    if (/supabase|fetch|insert|select\(/i.test(snippet)) {
      return 'keep in code'
    }
  }

  if (category === 'UI Validation' && /components\//.test(rel)) {
    return 'keep in code'
  }

  if (
    /MAX_|LIMIT|ALLOWED_|FORBIDDEN|ADJACENT_|EQUIPMENT_CAPACITY|ASSIGNMENT_PRIORITY|PLANNER_CATEGORIES|MOVABLE_/.test(
      snippet,
    )
  ) {
    return 'move to rules engine'
  }

  if (
    category === 'Floor Location' ||
    category === 'Equipment' ||
    category === 'Load / Fatigue' ||
    category === 'Category Balance'
  ) {
    if (/lib\//.test(rel)) return 'move to rules engine'
  }

  if (category === 'Overrides / Warnings' && /lib\/ruleValidator/.test(rel)) {
    return 'move to rules engine'
  }

  if (category === 'Class Structure' && /getClassRoundCount|requires_4_rounds/.test(snippet)) {
    return 'move to rules engine'
  }

  if (category === 'Planner Algorithm Logic' && /lib\//.test(rel)) {
    return 'hybrid — keep orchestration in code, externalize thresholds'
  }

  if (category === 'Exercise Selection' && /lib\/stationSelector/.test(rel)) {
    return 'hybrid — keep orchestration in code, externalize thresholds'
  }

  if (category === 'Transition / Setup' && /lib\/locationAssignment/.test(rel)) {
    return 'move to rules engine'
  }

  if (nodeKind === 'VariableDeclaration' && /lib\//.test(rel)) {
    return 'move to rules engine'
  }

  if (/App\.jsx$/.test(rel)) {
    return 'hybrid — keep orchestration in code, externalize thresholds'
  }

  return 'keep in code'
}

function isRuleRelevant(text, filePath) {
  const allPatterns = Object.values(CATEGORY_SIGNALS).flat()
  if (allPatterns.some((p) => p.test(text))) return true

  if (/lib\/(circuitGenerator|stationSelector|locationAssignment|ruleValidator|rounds|warningCategories|manualEdits|violationTypes)/.test(filePath)) {
    return true
  }

  if (/components\/(WarningsPanel|CircuitMap)/.test(filePath)) {
    return true
  }

  return false
}

function addFinding(findings, seen, payload) {
  const key = `${payload.file}:${payload.line}:${payload.nodeKind}:${payload.snippet.slice(0, 80)}`
  if (seen.has(key)) return
  seen.add(key)
  findings.push(payload)
}

function auditSourceFile(sourceFile, findings, seen) {
  const filePath = relativePath(sourceFile.getFilePath())

  const visitConditional = (node, nodeKind) => {
    const context = collectContextText(node)
    if (!isRuleRelevant(context, filePath)) return

    const { category, score } = scoreCategory(context, filePath)
    const isLib = /src\/lib\//.test(filePath)

    if (!isLib && isTrivialGuard(node) && score < 2) return

    const snippet = getSnippet(node)
    const recommendation = inferRecommendation(category, filePath, nodeKind, snippet)

    addFinding(findings, seen, {
      file: filePath,
      line: node.getStartLineNumber(),
      nodeKind,
      functionName: getEnclosingFunctionName(node),
      category,
      recommendation,
      snippet,
    })
  }

  for (const node of sourceFile.getDescendants()) {
    if (Node.isIfStatement(node)) {
      visitConditional(node, 'IfStatement')
    } else if (Node.isConditionalExpression(node)) {
      visitConditional(node, 'ConditionalExpression')
    } else if (Node.isSwitchStatement(node)) {
      visitConditional(node, 'SwitchStatement')
    } else if (Node.isCaseClause(node)) {
      visitConditional(node, 'CaseClause')
    } else if (Node.isForStatement(node)) {
      visitConditional(node, 'ForStatement')
    } else if (Node.isForOfStatement(node) || Node.isForInStatement(node)) {
      visitConditional(node, Node.isForOfStatement(node) ? 'ForOfStatement' : 'ForInStatement')
    } else if (Node.isWhileStatement(node)) {
      visitConditional(node, 'WhileStatement')
    } else if (Node.isDoStatement(node)) {
      visitConditional(node, 'DoStatement')
    }
  }

  sourceFile.getDescendantsOfKind(SyntaxKind.VariableDeclaration).forEach((node) => {
    const name = node.getName()
    const initializer = node.getInitializer()
    if (!initializer) return

    const nameText = typeof name === 'string' ? name : name.getText()
    const isRuleConstant =
      /^(MAX_|MIN_)|LIMIT$|_CAPACITY$|_PRIORITY$|_PAIRS$|_CATEGORIES$|_ALLOWED$|_FORBIDDEN$|_TYPES$/.test(
        nameText,
      )

    const isRuleObject =
      Node.isObjectLiteralExpression(initializer) ||
      Node.isArrayLiteralExpression(initializer)

    if (!isRuleConstant && !isRuleObject) return

    const context = `${nameText}\n${initializer.getText()}`
    if (!isRuleRelevant(context, filePath)) return

    const { category } = scoreCategory(context, filePath)
    const snippet = getSnippet(node)
    const recommendation = inferRecommendation(category, filePath, 'VariableDeclaration', snippet)

    addFinding(findings, seen, {
      file: filePath,
      line: node.getStartLineNumber(),
      nodeKind: 'VariableDeclaration',
      functionName: getEnclosingFunctionName(node),
      category,
      recommendation,
      snippet,
    })
  })

  sourceFile.getFunctions().forEach((fn) => {
    const name = fn.getName() ?? ''
    const ruleFunction =
      /validate|check|select|assign|pick|generate|classify|warn|constraint|balance|location|equipment|round|category|family|heavy|bench|conflict|placement|priority/i.test(
        name,
      )

    if (!ruleFunction) return
    if (!/src\/lib\//.test(filePath)) return

    const context = fn.getText()
    if (!isRuleRelevant(context, filePath)) return

    const { category } = scoreCategory(context, filePath)
    const snippet = getSnippet(fn, 180)
    const recommendation = inferRecommendation(category, filePath, 'FunctionDeclaration', snippet)

    addFinding(findings, seen, {
      file: filePath,
      line: fn.getStartLineNumber(),
      nodeKind: 'FunctionDeclaration',
      functionName: name || '(anonymous)',
      category,
      recommendation,
      snippet,
    })
  })
}

function buildSummary(findings) {
  const byCategory = Object.fromEntries(CATEGORIES.map((c) => [c, 0]))
  const byRecommendation = {}

  for (const finding of findings) {
    byCategory[finding.category] = (byCategory[finding.category] ?? 0) + 1
    byRecommendation[finding.recommendation] =
      (byRecommendation[finding.recommendation] ?? 0) + 1
  }

  return {
    generatedAt: new Date().toISOString(),
    totalFindings: findings.length,
    filesScanned: new Set(findings.map((f) => f.file)).size,
    byCategory,
    byRecommendation,
  }
}

function renderMarkdown(findings, summary) {
  const lines = [
    '# Circuit Planner — Rules Audit',
    '',
    `Generated: ${summary.generatedAt}`,
    '',
    '## Summary',
    '',
    `- **Total findings:** ${summary.totalFindings}`,
    `- **Files with rule logic:** ${summary.filesScanned}`,
    '',
    '### By category',
    '',
    ...CATEGORIES.map((c) => `- ${c}: ${summary.byCategory[c] ?? 0}`),
    '',
    '### By recommendation',
    '',
    ...Object.entries(summary.byRecommendation).map(
      ([rec, count]) => `- ${rec}: ${count}`,
    ),
    '',
    '## Findings',
    '',
  ]

  const grouped = Object.fromEntries(CATEGORIES.map((c) => [c, []]))
  for (const finding of findings) {
    grouped[finding.category].push(finding)
  }

  for (const category of CATEGORIES) {
    const items = grouped[category]
    if (items.length === 0) continue

    lines.push(`### ${category}`, '')

    for (const item of items.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)) {
      lines.push(
        `#### \`${item.file}:${item.line}\` (${item.nodeKind})`,
        '',
        `- **Function:** \`${item.functionName ?? '—'}\``,
        `- **Recommendation:** ${item.recommendation}`,
        '',
        '```javascript',
        item.snippet,
        '```',
        '',
      )
    }
  }

  return lines.join('\n')
}

async function main() {
  const files = await fg(SRC_GLOB, {
    cwd: ROOT,
    absolute: true,
    onlyFiles: true,
  })

  const project = new Project({
    compilerOptions: {
      allowJs: true,
      jsx: 2,
      target: 99,
      module: 99,
    },
    skipAddingFilesFromTsConfig: true,
  })

  project.addSourceFilesAtPaths(files)

  const findings = []
  const seen = new Set()

  for (const sourceFile of project.getSourceFiles()) {
    auditSourceFile(sourceFile, findings, seen)
  }

  findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)

  const summary = buildSummary(findings)
  const output = {
    summary,
    findings,
  }

  const jsonPath = path.join(ROOT, 'rule-audit.json')
  const mdPath = path.join(ROOT, 'rule-audit.md')

  fs.writeFileSync(jsonPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8')
  fs.writeFileSync(mdPath, renderMarkdown(findings, summary), 'utf8')

  console.log(`Scanned ${files.length} files`)
  console.log(`Found ${findings.length} rule-related items`)
  console.log(`Wrote ${relativePath(jsonPath)}`)
  console.log(`Wrote ${relativePath(mdPath)}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

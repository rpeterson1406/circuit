# Circuit Planner — Rules Audit

Generated: 2026-06-22T20:39:33.902Z

## Summary

- **Total findings:** 412
- **Files with rule logic:** 19

### By category

- Class Structure: 34
- Floor Location: 118
- Station: 15
- Equipment: 75
- Exercise Selection: 31
- Category Balance: 13
- Load / Fatigue: 26
- Transition / Setup: 0
- Overrides / Warnings: 68
- Planner Algorithm Logic: 7
- UI Validation: 25

### By recommendation

- hybrid — keep orchestration in code, externalize thresholds: 47
- keep in code: 92
- move to rules engine: 273

## Findings

### Class Structure

#### `src/App.jsx:173` (IfStatement)

- **Function:** `handleGenerate`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
if (!referenceData) return
```

#### `src/App.jsx:207` (IfStatement)

- **Function:** `handleSwapSelect`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
if (!swapRowId) return
```

#### `src/App.jsx:210` (IfStatement)

- **Function:** `handleSwapSelect`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
if (!row) { setSwapRowId(null) return }
```

#### `src/App.jsx:217` (ConditionalExpression)

- **Function:** `handleSwapSelect`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
entry.id === swapRowId ? applySwapTemplate(entry, template, { roundCountMap, classRoundCount, }) : entry
```

#### `src/App.jsx:290` (IfStatement)

- **Function:** `handleSave`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
if (!referenceData || !canSave) return
```

#### `src/App.jsx:323` (ConditionalExpression)

- **Function:** `App`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
swapRow && referenceData ? getEligibleSwapTemplates({ row: swapRow, circuit, stationTemplates: referenceData.stationTemplates, equipmentAllowedLocations: referenceData.equipmentAllowedLocations, }) : []
```

#### `src/components/GenerateControls.jsx:105` (ConditionalExpression)

- **Function:** `GenerateControls`
- **Recommendation:** keep in code

```javascript
generating ? 'Generating…' : 'Generate Circuit'
```

#### `src/lib/circuitGenerator.js:116` (IfStatement)

- **Function:** `generateCircuit`
- **Recommendation:** keep in code

```javascript
if (existingRow?.locked && existingRow.templateId) { const template = templateById.get(existingRow.templateId) circuit.push({ ...existingRow, roundCount: template ? getTemplateRoundCount(template, roundCountMap, class...
```

#### `src/lib/circuitGenerator.js:120` (ConditionalExpression)

- **Function:** `generateCircuit`
- **Recommendation:** keep in code

```javascript
template ? getTemplateRoundCount(template, roundCountMap, classRoundCount) : existingRow.roundCount
```

#### `src/lib/circuitGenerator.js:128` (IfStatement)

- **Function:** `generateCircuit`
- **Recommendation:** keep in code

```javascript
if (existingRow && !existingRow.templateId) { circuit.push(buildEmptyRow(index + 1, existingRow)) continue }
```

#### `src/lib/circuitGenerator.js:134` (IfStatement)

- **Function:** `generateCircuit`
- **Recommendation:** keep in code

```javascript
if (!template) { circuit.push(buildEmptyRow(index + 1, existingRow)) continue }
```

#### `src/lib/circuitGenerator.js:152` (IfStatement)

- **Function:** `generateCircuit`
- **Recommendation:** keep in code

```javascript
if (!template) { circuit.push(buildEmptyRow(circuit.length + 1)) continue }
```

#### `src/lib/rounds.js:3` (FunctionDeclaration)

- **Function:** `getClassRoundCount`
- **Recommendation:** move to rules engine

```javascript
export function getClassRoundCount(stationCount) { return Number(stationCount) <= 12 ? 4 : 3 }
```

#### `src/lib/rounds.js:4` (ConditionalExpression)

- **Function:** `getClassRoundCount`
- **Recommendation:** keep in code

```javascript
Number(stationCount) <= 12 ? 4 : 3
```

#### `src/lib/rounds.js:7` (FunctionDeclaration)

- **Function:** `buildRoundCountMap`
- **Recommendation:** keep in code

```javascript
export function buildRoundCountMap(stationRounds = []) { const map = new Map() for (const row of stationRounds) { const templateId = row.station_template_id if (!templateId) con...
```

#### `src/lib/rounds.js:10` (ForOfStatement)

- **Function:** `buildRoundCountMap`
- **Recommendation:** keep in code

```javascript
for (const row of stationRounds) { const templateId = row.station_template_id if (!templateId) continue map.set(templateId, (map.get(templateId) ?? 0) + 1) }
```

#### `src/lib/rounds.js:12` (IfStatement)

- **Function:** `buildRoundCountMap`
- **Recommendation:** keep in code

```javascript
if (!templateId) continue
```

#### `src/lib/rounds.js:19` (FunctionDeclaration)

- **Function:** `getTemplateRoundCount`
- **Recommendation:** keep in code

```javascript
export function getTemplateRoundCount(template, roundCountMap, classRoundCount) { const roundsFromDb = roundCountMap.get(template?.id) if (roundsFromDb != null && roundsFromDb >...
```

#### `src/lib/rounds.js:21` (IfStatement)

- **Function:** `getTemplateRoundCount`
- **Recommendation:** keep in code

```javascript
if (roundsFromDb != null && roundsFromDb > 0) { return roundsFromDb }
```

#### `src/lib/rounds.js:25` (IfStatement)

- **Function:** `getTemplateRoundCount`
- **Recommendation:** move to rules engine

```javascript
if (isTruthy(template?.requires_4_rounds)) { return 4 }
```

#### `src/lib/ruleValidator.js:28` (FunctionDeclaration)

- **Function:** `isThreeRoundClass`
- **Recommendation:** keep in code

```javascript
function isThreeRoundClass(classRoundCount) { return Number(classRoundCount) === 3 }
```

#### `src/lib/ruleValidator.js:86` (FunctionDeclaration)

- **Function:** `checkFourRoundStationsInThreeRoundClass`
- **Recommendation:** keep in code

```javascript
function checkFourRoundStationsInThreeRoundClass(circuit, stationTemplates, classRoundCount) { if (!isThreeRoundClass(classRoundCount)) return [] const templateById = getTemplat...
```

#### `src/lib/saveClass.js:56` (ConditionalExpression)

- **Function:** `saveClass`
- **Recommendation:** keep in code

```javascript
notes?.trim() ? notes.trim() : null
```

#### `src/lib/saveClass.js:118` (IfStatement)

- **Function:** `saveClass`
- **Recommendation:** keep in code

```javascript
if (usageError) { throw new Error(usageError.message) }
```

#### `src/lib/stationSelector.js:151` (FunctionDeclaration)

- **Function:** `wouldIncludeFourRoundStation`
- **Recommendation:** move to rules engine

```javascript
function wouldIncludeFourRoundStation(template, classRoundCount) { return classRoundCount === 3 && isTruthy(template.requires_4_rounds) }
```

#### `src/lib/stationSelector.js:159` (FunctionDeclaration)

- **Function:** `passesPreferredConstraints`
- **Recommendation:** keep in code

```javascript
function passesPreferredConstraints(template, state, classRoundCount) { return ( passesEquipmentAndHeavyConstraints(template, state) && !wouldDuplicateFamily(template, state) &&...
```

#### `src/lib/stationSelector.js:251` (IfStatement)

- **Function:** `fillCategoryTargets`
- **Recommendation:** keep in code

```javascript
if (needing.length === 0) break
```

#### `src/lib/stationSelector.js:271` (IfStatement)

- **Function:** `fillCategoryTargets`
- **Recommendation:** keep in code

```javascript
if (!picked) break
```

#### `src/lib/stationSelector.js:273` (IfStatement)

- **Function:** `fillCategoryTargets`
- **Recommendation:** keep in code

```javascript
if (!passesPreferredConstraints(picked, state, classRoundCount)) { recordForcedConstraintWarnings(picked, state, classRoundCount, warnings) }
```

#### `src/lib/stationSelector.js:303` (WhileStatement)

- **Function:** `fillRemainingSlots`
- **Recommendation:** keep in code

```javascript
while (state.selected.length < stationCount && pool.length > 0) { let picked = null for (const strictness of strictnessLevels) { picked = pickRemainingCandidate(pool, state, classRoundCount, strictness) if (picked) br...
```

#### `src/lib/stationSelector.js:306` (ForOfStatement)

- **Function:** `fillRemainingSlots`
- **Recommendation:** keep in code

```javascript
for (const strictness of strictnessLevels) { picked = pickRemainingCandidate(pool, state, classRoundCount, strictness) if (picked) break }
```

#### `src/lib/stationSelector.js:308` (IfStatement)

- **Function:** `fillRemainingSlots`
- **Recommendation:** keep in code

```javascript
if (picked) break
```

#### `src/lib/stationSelector.js:311` (IfStatement)

- **Function:** `fillRemainingSlots`
- **Recommendation:** keep in code

```javascript
if (!picked) break
```

#### `src/lib/stationSelector.js:313` (IfStatement)

- **Function:** `fillRemainingSlots`
- **Recommendation:** keep in code

```javascript
if (!passesPreferredConstraints(picked, state, classRoundCount)) { recordForcedConstraintWarnings(picked, state, classRoundCount, warnings) }
```

### Floor Location

#### `src/App.jsx:251` (ConditionalExpression)

- **Function:** `nextCircuit`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
entry.id === row.id ? applyMoveToLocation(entry, toLocationCode) : entry
```

#### `src/components/CircuitMap.jsx:5` (VariableDeclaration)

- **Function:** `—`
- **Recommendation:** keep in code

```javascript
OUTDOOR_LOCATIONS = ['O1', 'O2', 'O3', 'O4']
```

#### `src/components/CircuitMap.jsx:7` (VariableDeclaration)

- **Function:** `—`
- **Recommendation:** keep in code

```javascript
STRENGTH_LAYOUT = [ { code: 'S2', area: 'top' }, { code: 'S4', area: 'top' }, { code: 'S5', area: 'top' }, { code: 'S6', area: 'top' }, { code: 'S3', area: 'left' }, { code: 'S1', area: 'left' }, { code: 'S9', area: '...
```

#### `src/components/CircuitMap.jsx:32` (ForOfStatement)

- **Function:** `buildAssignmentMap`
- **Recommendation:** keep in code

```javascript
for (const assignment of assignments) { const locationCode = assignment.location_code ?? assignment.location if (!locationCode) continue for (const code of expandLocationCodes(locationCode)) { map.set(code, { ...assig...
```

#### `src/components/CircuitMap.jsx:34` (IfStatement)

- **Function:** `buildAssignmentMap`
- **Recommendation:** keep in code

```javascript
if (!locationCode) continue
```

#### `src/components/CircuitMap.jsx:36` (ForOfStatement)

- **Function:** `buildAssignmentMap`
- **Recommendation:** keep in code

```javascript
for (const code of expandLocationCodes(locationCode)) { map.set(code, { ...assignment, location_code: code, }) }
```

#### `src/components/CircuitMap.jsx:52` (IfStatement)

- **Function:** `isLocationActive`
- **Recommendation:** keep in code

```javascript
if (!locations || locations.length === 0) return true
```

#### `src/lib/circuitGenerator.js:6` (FunctionDeclaration)

- **Function:** `getAvailableLocations`
- **Recommendation:** move to rules engine

```javascript
function getAvailableLocations(stationLocations) { const fromDb = stationLocations .map((row) => row.location_code) .filter((code) => isKnownLocation(code)) if (fromDb.length > ...
```

#### `src/lib/circuitGenerator.js:11` (IfStatement)

- **Function:** `getAvailableLocations`
- **Recommendation:** move to rules engine

```javascript
if (fromDb.length > 0) { return ALL_LOCATION_CODES.filter((code) => fromDb.includes(code)) }
```

#### `src/lib/fetchReferenceData.js:33` (IfStatement)

- **Function:** `fetchReferenceData`
- **Recommendation:** move to rules engine

```javascript
if (errors.length > 0) { throw new Error(errors[0].message) }
```

#### `src/lib/locationAssignment.js:29` (VariableDeclaration)

- **Function:** `—`
- **Recommendation:** move to rules engine

```javascript
ADJACENT_BENCH_PAIRS = [ ['S4', 'S5'], ['S7', 'S8'], ['S8', 'S9'], ['G1', 'G2'], ['G2', 'G3'], ['G6', 'G7'], ]
```

#### `src/lib/locationAssignment.js:49` (VariableDeclaration)

- **Function:** `—`
- **Recommendation:** move to rules engine

```javascript
MAX_WEIGHT_BENCH_STATIONS = 2
```

#### `src/lib/locationAssignment.js:50` (VariableDeclaration)

- **Function:** `—`
- **Recommendation:** move to rules engine

```javascript
MAX_LEG_SLED_STATIONS = 1
```

#### `src/lib/locationAssignment.js:64` (FunctionDeclaration)

- **Function:** `getEquipmentClassificationText`
- **Recommendation:** move to rules engine

```javascript
function getEquipmentClassificationText(template) { const equipmentRequired = normalizeText(template?.equipment_required) if (equipmentRequired) return equipmentRequired return ...
```

#### `src/lib/locationAssignment.js:116` (FunctionDeclaration)

- **Function:** `classifyEquipment`
- **Recommendation:** move to rules engine

```javascript
export function classifyEquipment(template) { return getEquipmentType(template) }
```

#### `src/lib/locationAssignment.js:147` (FunctionDeclaration)

- **Function:** `getAllowedLocationsForEquipmentType`
- **Recommendation:** move to rules engine

```javascript
function getAllowedLocationsForEquipmentType(equipmentType, activeLocationCodes = ALL_LOCATION_CODES) { const typeLocations = ALLOWED_LOCATIONS_BY_TYPE[equipmentType] ?? MOVABLE...
```

#### `src/lib/locationAssignment.js:150` (ConditionalExpression)

- **Function:** `getAllowedLocationsForEquipmentType`
- **Recommendation:** move to rules engine

```javascript
equipmentType === EQUIPMENT_TYPES.MOVABLE ? typeLocations.filter((code) => !MOVABLE_FORBIDDEN.includes(code)) : typeLocations
```

#### `src/lib/locationAssignment.js:157` (FunctionDeclaration)

- **Function:** `buildDbEquipmentMap`
- **Recommendation:** move to rules engine

```javascript
function buildDbEquipmentMap(equipmentAllowedLocations) { const map = new Map() for (const row of equipmentAllowedLocations) { if (!row.equipment_id || !row.location_code) conti...
```

#### `src/lib/locationAssignment.js:159` (ForOfStatement)

- **Function:** `buildDbEquipmentMap`
- **Recommendation:** move to rules engine

```javascript
for (const row of equipmentAllowedLocations) { if (!row.equipment_id || !row.location_code) continue if (!map.has(row.equipment_id)) { map.set(row.equipment_id, new Set()) } map.get(row.equipment_id).add(row.location_...
```

#### `src/lib/locationAssignment.js:160` (IfStatement)

- **Function:** `buildDbEquipmentMap`
- **Recommendation:** move to rules engine

```javascript
if (!row.equipment_id || !row.location_code) continue
```

#### `src/lib/locationAssignment.js:161` (IfStatement)

- **Function:** `buildDbEquipmentMap`
- **Recommendation:** move to rules engine

```javascript
if (!map.has(row.equipment_id)) { map.set(row.equipment_id, new Set()) }
```

#### `src/lib/locationAssignment.js:169` (FunctionDeclaration)

- **Function:** `buildDbConflictSet`
- **Recommendation:** move to rules engine

```javascript
function buildDbConflictSet(locationConflicts = []) { const set = new Set() for (const row of locationConflicts) { const a = row.location_code const b = row.conflict_with_locati...
```

#### `src/lib/locationAssignment.js:171` (ForOfStatement)

- **Function:** `buildDbConflictSet`
- **Recommendation:** move to rules engine

```javascript
for (const row of locationConflicts) { const a = row.location_code const b = row.conflict_with_location_code if (!a || !b) continue set.add(`${a}|${b}`) set.add(`${b}|${a}`) }
```

#### `src/lib/locationAssignment.js:174` (IfStatement)

- **Function:** `buildDbConflictSet`
- **Recommendation:** move to rules engine

```javascript
if (!a || !b) continue
```

#### `src/lib/locationAssignment.js:181` (FunctionDeclaration)

- **Function:** `intersectLocations`
- **Recommendation:** move to rules engine

```javascript
function intersectLocations(primary, secondary) { const secondarySet = new Set(secondary) return primary.filter((code) => secondarySet.has(code)) }
```

#### `src/lib/locationAssignment.js:186` (FunctionDeclaration)

- **Function:** `getAllowedLocationsForTemplate`
- **Recommendation:** move to rules engine

```javascript
export function getAllowedLocationsForTemplate( template, equipmentAllowedLocations, activeLocationCodes = ALL_LOCATION_CODES, ) { const equipmentType = getEquipmentType(templat...
```

#### `src/lib/locationAssignment.js:194` (IfStatement)

- **Function:** `getAllowedLocationsForTemplate`
- **Recommendation:** move to rules engine

```javascript
if (template?.equipment_id) { const dbMap = buildDbEquipmentMap(equipmentAllowedLocations) const dbLocations = dbMap.get(template.equipment_id) if (dbLocations?.size) { typeLocations = intersectLocations( typeLocation...
```

#### `src/lib/locationAssignment.js:197` (IfStatement)

- **Function:** `getAllowedLocationsForTemplate`
- **Recommendation:** move to rules engine

```javascript
if (dbLocations?.size) { typeLocations = intersectLocations( typeLocations, [...dbLocations].filter((code) => isKnownLocation(code)), ) }
```

#### `src/lib/locationAssignment.js:208` (FunctionDeclaration)

- **Function:** `getAdjacentLocations`
- **Recommendation:** move to rules engine

```javascript
function getAdjacentLocations(locationCode) { const adjacent = new Set() for (const [a, b] of ADJACENT_BENCH_PAIRS) { if (a === locationCode) adjacent.add(b) if (b === locationC...
```

#### `src/lib/locationAssignment.js:210` (ForOfStatement)

- **Function:** `getAdjacentLocations`
- **Recommendation:** move to rules engine

```javascript
for (const [a, b] of ADJACENT_BENCH_PAIRS) { if (a === locationCode) adjacent.add(b) if (b === locationCode) adjacent.add(a) }
```

#### `src/lib/locationAssignment.js:211` (IfStatement)

- **Function:** `getAdjacentLocations`
- **Recommendation:** move to rules engine

```javascript
if (a === locationCode) adjacent.add(b)
```

#### `src/lib/locationAssignment.js:212` (IfStatement)

- **Function:** `getAdjacentLocations`
- **Recommendation:** move to rules engine

```javascript
if (b === locationCode) adjacent.add(a)
```

#### `src/lib/locationAssignment.js:217` (FunctionDeclaration)

- **Function:** `hasAdjacentBenchLocation`
- **Recommendation:** move to rules engine

```javascript
function hasAdjacentBenchLocation(locationCode, benchLocations) { const adjacent = getAdjacentLocations(locationCode) return [...adjacent].some((code) => benchLocations.has(code...
```

#### `src/lib/locationAssignment.js:232` (FunctionDeclaration)

- **Function:** `markLocationUsed`
- **Recommendation:** move to rules engine

```javascript
function markLocationUsed(state, locationCode) { if (!locationCode || locationCode === '—') return if (locationCode === 'S1+S2') { state.usedLocations.add('S1') state.usedLocati...
```

#### `src/lib/locationAssignment.js:233` (IfStatement)

- **Function:** `markLocationUsed`
- **Recommendation:** move to rules engine

```javascript
if (!locationCode || locationCode === '—') return
```

#### `src/lib/locationAssignment.js:234` (IfStatement)

- **Function:** `markLocationUsed`
- **Recommendation:** move to rules engine

```javascript
if (locationCode === 'S1+S2') { state.usedLocations.add('S1') state.usedLocations.add('S2') state.dualCableReserved = true return }
```

#### `src/lib/locationAssignment.js:243` (FunctionDeclaration)

- **Function:** `applyAssignment`
- **Recommendation:** move to rules engine

```javascript
function applyAssignment(state, template, locationCode, equipmentAllowedLocations) { if (!locationCode || locationCode === '—') return const equipmentType = getEquipmentType(tem...
```

#### `src/lib/locationAssignment.js:244` (IfStatement)

- **Function:** `applyAssignment`
- **Recommendation:** move to rules engine

```javascript
if (!locationCode || locationCode === '—') return
```

#### `src/lib/locationAssignment.js:249` (IfStatement)

- **Function:** `applyAssignment`
- **Recommendation:** move to rules engine

```javascript
if (equipmentType === EQUIPMENT_TYPES.WEIGHT_BENCH) { state.benchStationCount += 1 if (locationCode !== 'S1+S2') { state.benchLocations.add(locationCode) } }
```

#### `src/lib/locationAssignment.js:251` (IfStatement)

- **Function:** `applyAssignment`
- **Recommendation:** move to rules engine

```javascript
if (locationCode !== 'S1+S2') { state.benchLocations.add(locationCode) }
```

#### `src/lib/locationAssignment.js:255` (IfStatement)

- **Function:** `applyAssignment`
- **Recommendation:** move to rules engine

```javascript
if (equipmentType === EQUIPMENT_TYPES.LEG_SLED) { state.legSledCount += 1 }
```

#### `src/lib/locationAssignment.js:260` (FunctionDeclaration)

- **Function:** `getPreferredLocations`
- **Recommendation:** move to rules engine

```javascript
function getPreferredLocations(template, equipmentType, state, equipmentAllowedLocations, activeLocationCodes) { if ( equipmentType === EQUIPMENT_TYPES.WEIGHT_BENCH && state.ben...
```

#### `src/lib/locationAssignment.js:261` (IfStatement)

- **Function:** `getPreferredLocations`
- **Recommendation:** move to rules engine

```javascript
if ( equipmentType === EQUIPMENT_TYPES.WEIGHT_BENCH && state.benchStationCount >= MAX_WEIGHT_BENCH_STATIONS ) { return getAllowedLocationsForTemplate( { ...template, equipment_required: 'Common movable' }, equipmentAl...
```

#### `src/lib/locationAssignment.js:279` (FunctionDeclaration)

- **Function:** `evaluatePlacementViolations`
- **Recommendation:** move to rules engine

```javascript
function evaluatePlacementViolations( locationCode, template, equipmentType, state, equipmentAllowedLocations, activeLocationCodes, dbConflictSet, ) { const violations = [] cons...
```

#### `src/lib/locationAssignment.js:288` (VariableDeclaration)

- **Function:** `evaluatePlacementViolations`
- **Recommendation:** move to rules engine

```javascript
violations = []
```

#### `src/lib/locationAssignment.js:292` (ConditionalExpression)

- **Function:** `evaluatePlacementViolations`
- **Recommendation:** move to rules engine

```javascript
locationCode === 'S1+S2' ? ['S1', 'S2'] : [locationCode]
```

#### `src/lib/locationAssignment.js:294` (IfStatement)

- **Function:** `evaluatePlacementViolations`
- **Recommendation:** move to rules engine

```javascript
if (locationCode === 'S1+S2') { if (!classifiedAllowed.includes('S1') || !classifiedAllowed.includes('S2')) { violations.push('equipment-location') } } else if (!classifiedAllowed.includes(locationCode)) { violations....
```

#### `src/lib/locationAssignment.js:295` (IfStatement)

- **Function:** `evaluatePlacementViolations`
- **Recommendation:** move to rules engine

```javascript
if (!classifiedAllowed.includes('S1') || !classifiedAllowed.includes('S2')) { violations.push('equipment-location') }
```

#### `src/lib/locationAssignment.js:298` (IfStatement)

- **Function:** `evaluatePlacementViolations`
- **Recommendation:** move to rules engine

```javascript
if (!classifiedAllowed.includes(locationCode)) { violations.push('equipment-location') }
```

#### `src/lib/locationAssignment.js:302` (ForOfStatement)

- **Function:** `evaluatePlacementViolations`
- **Recommendation:** move to rules engine

```javascript
for (const code of codesToCheck) { if (equipmentType === EQUIPMENT_TYPES.MOVABLE && MOVABLE_FORBIDDEN.includes(code)) { violations.push('movable-forbidden') } }
```

#### `src/lib/locationAssignment.js:303` (IfStatement)

- **Function:** `evaluatePlacementViolations`
- **Recommendation:** move to rules engine

```javascript
if (equipmentType === EQUIPMENT_TYPES.MOVABLE && MOVABLE_FORBIDDEN.includes(code)) { violations.push('movable-forbidden') }
```

#### `src/lib/locationAssignment.js:308` (IfStatement)

- **Function:** `evaluatePlacementViolations`
- **Recommendation:** move to rules engine

```javascript
if (locationCode === 'S2' && state.usedLocations.has('S3')) { violations.push('s3-blocks-s2') }
```

#### `src/lib/locationAssignment.js:311` (IfStatement)

- **Function:** `evaluatePlacementViolations`
- **Recommendation:** move to rules engine

```javascript
if (locationCode === 'S3' && state.usedLocations.has('S2')) { violations.push('s2-blocks-s3') }
```

#### `src/lib/locationAssignment.js:314` (IfStatement)

- **Function:** `evaluatePlacementViolations`
- **Recommendation:** move to rules engine

```javascript
if ( locationCode === 'S3' && (state.dualCableReserved || (state.usedLocations.has('S1') && state.usedLocations.has('S2'))) ) { violations.push('s1-s2-block-s3') }
```

#### `src/lib/locationAssignment.js:320` (IfStatement)

- **Function:** `evaluatePlacementViolations`
- **Recommendation:** move to rules engine

```javascript
if (locationCode === 'G3' && state.usedLocations.has('G4')) { violations.push('g4-blocks-g3') }
```

#### `src/lib/locationAssignment.js:324` (ForOfStatement)

- **Function:** `evaluatePlacementViolations`
- **Recommendation:** move to rules engine

```javascript
for (const code of codesToCheck) { for (const used of state.usedLocations) { if (dbConflictSet.has(`${code}|${used}`)) { violations.push('db-conflict') } } }
```

#### `src/lib/locationAssignment.js:325` (ForOfStatement)

- **Function:** `evaluatePlacementViolations`
- **Recommendation:** move to rules engine

```javascript
for (const used of state.usedLocations) { if (dbConflictSet.has(`${code}|${used}`)) { violations.push('db-conflict') } }
```

#### `src/lib/locationAssignment.js:326` (IfStatement)

- **Function:** `evaluatePlacementViolations`
- **Recommendation:** move to rules engine

```javascript
if (dbConflictSet.has(`${code}|${used}`)) { violations.push('db-conflict') }
```

#### `src/lib/locationAssignment.js:332` (IfStatement)

- **Function:** `evaluatePlacementViolations`
- **Recommendation:** move to rules engine

```javascript
if (equipmentType === EQUIPMENT_TYPES.WEIGHT_BENCH) { if (state.benchStationCount >= MAX_WEIGHT_BENCH_STATIONS) { violations.push('max-weight-bench') } if (hasAdjacentBenchLocation(locationCode, state.benchLocations))...
```

#### `src/lib/locationAssignment.js:333` (IfStatement)

- **Function:** `evaluatePlacementViolations`
- **Recommendation:** move to rules engine

```javascript
if (state.benchStationCount >= MAX_WEIGHT_BENCH_STATIONS) { violations.push('max-weight-bench') }
```

#### `src/lib/locationAssignment.js:336` (IfStatement)

- **Function:** `evaluatePlacementViolations`
- **Recommendation:** move to rules engine

```javascript
if (hasAdjacentBenchLocation(locationCode, state.benchLocations)) { violations.push('adjacent-bench') }
```

#### `src/lib/locationAssignment.js:341` (IfStatement)

- **Function:** `evaluatePlacementViolations`
- **Recommendation:** move to rules engine

```javascript
if (equipmentType === EQUIPMENT_TYPES.LEG_SLED && state.legSledCount >= MAX_LEG_SLED_STATIONS) { violations.push('max-leg-sled') }
```

#### `src/lib/locationAssignment.js:345` (IfStatement)

- **Function:** `evaluatePlacementViolations`
- **Recommendation:** move to rules engine

```javascript
if (locationCode === 'S1+S2') { if (state.usedLocations.has('S1') || state.usedLocations.has('S2')) { violations.push('dual-cable-unavailable') } }
```

#### `src/lib/locationAssignment.js:346` (IfStatement)

- **Function:** `evaluatePlacementViolations`
- **Recommendation:** move to rules engine

```javascript
if (state.usedLocations.has('S1') || state.usedLocations.has('S2')) { violations.push('dual-cable-unavailable') }
```

#### `src/lib/locationAssignment.js:354` (FunctionDeclaration)

- **Function:** `noValidLocationWarning`
- **Recommendation:** move to rules engine

```javascript
export function noValidLocationWarning(template) { return `No valid location found for ${template.station_name ?? 'station'}.` }
```

#### `src/lib/locationAssignment.js:363` (SwitchStatement)

- **Function:** `(anonymous)`
- **Recommendation:** move to rules engine

```javascript
switch (violation) { case 'equipment-location': return `"${name}" is assigned to ${locationCode} but is classified as ${label} equipment, which is not allowed at that location.` case 'movable-forbidden': return `"${na...
```

#### `src/lib/locationAssignment.js:364` (CaseClause)

- **Function:** `(anonymous)`
- **Recommendation:** move to rules engine

```javascript
case 'equipment-location': return `"${name}" is assigned to ${locationCode} but is classified as ${label} equipment, which is not allowed at that location.`
```

#### `src/lib/locationAssignment.js:366` (CaseClause)

- **Function:** `(anonymous)`
- **Recommendation:** move to rules engine

```javascript
case 'movable-forbidden': return `"${name}" is assigned to ${locationCode} but is classified as ${label} equipment, which is not allowed at that location.`
```

#### `src/lib/locationAssignment.js:368` (CaseClause)

- **Function:** `(anonymous)`
- **Recommendation:** move to rules engine

```javascript
case 's3-blocks-s2': return `Location conflict: "${name}" at ${locationCode} — S3 is in use, so S2 cannot be used.`
```

#### `src/lib/locationAssignment.js:370` (CaseClause)

- **Function:** `(anonymous)`
- **Recommendation:** move to rules engine

```javascript
case 's2-blocks-s3': return `Location conflict: "${name}" at ${locationCode} — S2 is in use, so S3 cannot be used.`
```

#### `src/lib/locationAssignment.js:372` (CaseClause)

- **Function:** `(anonymous)`
- **Recommendation:** move to rules engine

```javascript
case 's1-s2-block-s3': return `Location conflict: "${name}" at ${locationCode} — both cable locations are in use, so S3 cannot be used.`
```

#### `src/lib/locationAssignment.js:374` (CaseClause)

- **Function:** `(anonymous)`
- **Recommendation:** move to rules engine

```javascript
case 'g4-blocks-g3': return `Location conflict: "${name}" at ${locationCode} — G4 is in use, so G3 cannot be used.`
```

#### `src/lib/locationAssignment.js:376` (CaseClause)

- **Function:** `(anonymous)`
- **Recommendation:** move to rules engine

```javascript
case 'adjacent-bench': return `Adjacent weight benches: "${name}" at ${locationCode} is next to another weight bench station.`
```

#### `src/lib/locationAssignment.js:378` (CaseClause)

- **Function:** `(anonymous)`
- **Recommendation:** move to rules engine

```javascript
case 'max-weight-bench': return `Weight bench limit: "${name}" exceeds the maximum of ${MAX_WEIGHT_BENCH_STATIONS} weight bench stations.`
```

#### `src/lib/locationAssignment.js:380` (CaseClause)

- **Function:** `(anonymous)`
- **Recommendation:** move to rules engine

```javascript
case 'max-leg-sled': return `Leg sled limit: "${name}" exceeds the maximum of ${MAX_LEG_SLED_STATIONS} leg sled station per class.`
```

#### `src/lib/locationAssignment.js:382` (CaseClause)

- **Function:** `(anonymous)`
- **Recommendation:** move to rules engine

```javascript
case 'dual-cable-unavailable': return `Location assignment: "${name}" requires both cables but S1 and S2 are not both available.`
```

#### `src/lib/locationAssignment.js:384` (CaseClause)

- **Function:** `(anonymous)`
- **Recommendation:** move to rules engine

```javascript
case 'db-conflict': return `Location conflict: "${name}" at ${locationCode} conflicts with another assigned location (database rule).`
```

#### `src/lib/locationAssignment.js:401` (ConditionalExpression)

- **Function:** `rankCandidates`
- **Recommendation:** move to rules engine

```javascript
equipmentType === EQUIPMENT_TYPES.CABLE_DUAL ? ['S1+S2'] : getPreferredLocations(template, equipmentType, state, equipmentAllowedLocations, activeLocationCodes)
```

#### `src/lib/locationAssignment.js:408` (ConditionalExpression)

- **Function:** `rankCandidates`
- **Recommendation:** move to rules engine

```javascript
equipmentType === EQUIPMENT_TYPES.CABLE_DUAL ? ['S1+S2'] : activeLocationCodes.filter((code) => !state.usedLocations.has(code))
```

#### `src/lib/locationAssignment.js:425` (IfStatement)

- **Function:** `(anonymous)`
- **Recommendation:** move to rules engine

```javascript
if (preferred.has(code)) score += 100
```

#### `src/lib/locationAssignment.js:434` (FunctionDeclaration)

- **Function:** `pickLocationForTemplate`
- **Recommendation:** move to rules engine

```javascript
export function pickLocationForTemplate( template, activeLocationCodes, state, equipmentAllowedLocations, locationConflicts = [], ) { const ranked = rankCandidates( template, ac...
```

#### `src/lib/locationAssignment.js:449` (IfStatement)

- **Function:** `pickLocationForTemplate`
- **Recommendation:** move to rules engine

```javascript
if (ranked.length > 0) { return { locationCode: ranked[0].code, warnings: [] } }
```

#### `src/lib/locationAssignment.js:459` (FunctionDeclaration)

- **Function:** `sortTemplatesForAssignment`
- **Recommendation:** move to rules engine

```javascript
export function sortTemplatesForAssignment(templates, equipmentAllowedLocations) { return [...templates].sort((a, b) => { const priorityA = ASSIGNMENT_PRIORITY[getEquipmentType(...
```

#### `src/lib/locationAssignment.js:463` (IfStatement)

- **Function:** `(anonymous)`
- **Recommendation:** move to rules engine

```javascript
if (priorityA !== priorityB) return priorityA - priorityB
```

#### `src/lib/locationAssignment.js:468` (FunctionDeclaration)

- **Function:** `assignLocations`
- **Recommendation:** move to rules engine

```javascript
export function assignLocations({ templates, activeLocationCodes, equipmentAllowedLocations, locationConflicts = [], existingAssignments = [], }) { const state = createEmptyStat...
```

#### `src/lib/locationAssignment.js:476` (VariableDeclaration)

- **Function:** `assignLocations`
- **Recommendation:** move to rules engine

```javascript
warnings = []
```

#### `src/lib/locationAssignment.js:479` (ForOfStatement)

- **Function:** `assignLocations`
- **Recommendation:** move to rules engine

```javascript
for (const assignment of existingAssignments) { if (!assignment.template || !assignment.locationCode || assignment.locationCode === '—') { continue } applyAssignment( state, assignment.template, assignment.locationCod...
```

#### `src/lib/locationAssignment.js:480` (IfStatement)

- **Function:** `assignLocations`
- **Recommendation:** move to rules engine

```javascript
if (!assignment.template || !assignment.locationCode || assignment.locationCode === '—') { continue }
```

#### `src/lib/locationAssignment.js:494` (ForOfStatement)

- **Function:** `assignLocations`
- **Recommendation:** move to rules engine

```javascript
for (const template of sortedTemplates) { if (results.has(template.id)) continue const { locationCode, warnings: placementWarnings } = pickLocationForTemplate( template, activeLocationCodes, state, equipmentAllowedLoc...
```

#### `src/lib/locationAssignment.js:495` (IfStatement)

- **Function:** `assignLocations`
- **Recommendation:** move to rules engine

```javascript
if (results.has(template.id)) continue
```

#### `src/lib/locationAssignment.js:507` (IfStatement)

- **Function:** `assignLocations`
- **Recommendation:** move to rules engine

```javascript
if (locationCode) { applyAssignment(state, template, locationCode, equipmentAllowedLocations) results.set(template.id, locationCode) } else { results.set(template.id, null) }
```

#### `src/lib/locationAssignment.js:518` (FunctionDeclaration)

- **Function:** `validateLocationAssignments`
- **Recommendation:** move to rules engine

```javascript
export function validateLocationAssignments( circuit, stationTemplates, equipmentAllowedLocations, locationConflicts = [], ) { const templateById = new Map(stationTemplates.map(...
```

#### `src/lib/locationAssignment.js:525` (VariableDeclaration)

- **Function:** `validateLocationAssignments`
- **Recommendation:** move to rules engine

```javascript
warnings = []
```

#### `src/lib/locationAssignment.js:531` (ForOfStatement)

- **Function:** `validateLocationAssignments`
- **Recommendation:** move to rules engine

```javascript
for (const row of ordered) { const template = templateById.get(row.templateId) if (!template) continue if (!row.locationCode || row.locationCode === '—') { warnings.push(noValidLocationWarning(template)) continue } co...
```

#### `src/lib/locationAssignment.js:533` (IfStatement)

- **Function:** `validateLocationAssignments`
- **Recommendation:** move to rules engine

```javascript
if (!template) continue
```

#### `src/lib/locationAssignment.js:535` (IfStatement)

- **Function:** `validateLocationAssignments`
- **Recommendation:** move to rules engine

```javascript
if (!row.locationCode || row.locationCode === '—') { warnings.push(noValidLocationWarning(template)) continue }
```

#### `src/lib/locationAssignment.js:557` (FunctionDeclaration)

- **Function:** `expandLocationCodes`
- **Recommendation:** move to rules engine

```javascript
export function expandLocationCodes(locationCode) { if (locationCode === 'S1+S2') return ['S1', 'S2'] if (!locationCode || locationCode === '—') return [] return [locationCode] }
```

#### `src/lib/locationAssignment.js:558` (IfStatement)

- **Function:** `expandLocationCodes`
- **Recommendation:** move to rules engine

```javascript
if (locationCode === 'S1+S2') return ['S1', 'S2']
```

#### `src/lib/locationAssignment.js:559` (IfStatement)

- **Function:** `expandLocationCodes`
- **Recommendation:** move to rules engine

```javascript
if (!locationCode || locationCode === '—') return []
```

#### `src/lib/locations.js:5` (VariableDeclaration)

- **Function:** `—`
- **Recommendation:** move to rules engine

```javascript
ALL_LOCATION_CODES = [ ...STRENGTH_LOCATIONS, ...GYM_LOCATIONS, ...OUTDOOR_LOCATIONS, ]
```

#### `src/lib/locations.js:11` (VariableDeclaration)

- **Function:** `—`
- **Recommendation:** move to rules engine

```javascript
LOCATION_ZONES = [ { id: 'strength', label: 'Strength Floor', codes: STRENGTH_LOCATIONS }, { id: 'gym', label: 'Gym Floor', codes: GYM_LOCATIONS }, { id: 'outdoor', label: 'Outdoor', codes: OUTDOOR_LOCATIONS }, ]
```

#### `src/lib/locations.js:17` (FunctionDeclaration)

- **Function:** `isKnownLocation`
- **Recommendation:** move to rules engine

```javascript
export function isKnownLocation(code) { return ALL_LOCATION_CODES.includes(code) }
```

#### `src/lib/locations.js:21` (FunctionDeclaration)

- **Function:** `getLocationSortIndex`
- **Recommendation:** move to rules engine

```javascript
export function getLocationSortIndex(locationCode) { if (!locationCode || locationCode === '—') return Infinity if (locationCode === 'S1+S2') return ALL_LOCATION_CODES.indexOf('...
```

#### `src/lib/locations.js:22` (IfStatement)

- **Function:** `getLocationSortIndex`
- **Recommendation:** move to rules engine

```javascript
if (!locationCode || locationCode === '—') return Infinity
```

#### `src/lib/locations.js:23` (IfStatement)

- **Function:** `getLocationSortIndex`
- **Recommendation:** move to rules engine

```javascript
if (locationCode === 'S1+S2') return ALL_LOCATION_CODES.indexOf('S1')
```

#### `src/lib/locations.js:26` (ConditionalExpression)

- **Function:** `getLocationSortIndex`
- **Recommendation:** move to rules engine

```javascript
index === -1 ? Infinity : index
```

#### `src/lib/locations.js:29` (FunctionDeclaration)

- **Function:** `sortCircuitRowsByLocation`
- **Recommendation:** move to rules engine

```javascript
export function sortCircuitRowsByLocation(rows) { return [...rows].sort((a, b) => { const locationOrder = getLocationSortIndex(a.locationCode) - getLocationSortIndex(b.locationC...
```

#### `src/lib/locations.js:33` (IfStatement)

- **Function:** `(anonymous)`
- **Recommendation:** move to rules engine

```javascript
if (locationOrder !== 0) return locationOrder
```

#### `src/lib/manualEdits.js:89` (FunctionDeclaration)

- **Function:** `findCircuitRowForMapLocation`
- **Recommendation:** move to rules engine

```javascript
export function findCircuitRowForMapLocation(circuit, locationCode, templateId) { return circuit.find( (row) => row.templateId === templateId && row.locationCode && row.location...
```

#### `src/lib/manualEdits.js:99` (FunctionDeclaration)

- **Function:** `applyMoveToLocation`
- **Recommendation:** move to rules engine

```javascript
export function applyMoveToLocation(row, targetLocationCode) { return { ...row, locationCode: targetLocationCode, manuallyEdited: true, } }
```

#### `src/lib/ruleValidator.js:36` (FunctionDeclaration)

- **Function:** `getActiveLocations`
- **Recommendation:** move to rules engine

```javascript
function getActiveLocations(circuit) { return circuit.flatMap((row) => expandLocationCodes(row.locationCode)) }
```

#### `src/lib/ruleValidator.js:119` (IfStatement)

- **Function:** `checkBuiltInLocationConflicts`
- **Recommendation:** move to rules engine

```javascript
if (used.has('S3') && used.has('S2')) { warnings.push('Location conflict: S3 and S2 cannot both be used.') }
```

#### `src/lib/ruleValidator.js:122` (IfStatement)

- **Function:** `checkBuiltInLocationConflicts`
- **Recommendation:** move to rules engine

```javascript
if (used.has('S3') && used.has('S1') && used.has('S2')) { warnings.push('Location conflict: S3 cannot be used when both S1 and S2 are in use.') }
```

#### `src/lib/ruleValidator.js:125` (IfStatement)

- **Function:** `checkBuiltInLocationConflicts`
- **Recommendation:** move to rules engine

```javascript
if (used.has('G4') && used.has('G3')) { warnings.push('Location conflict: G4 and G3 cannot both be used.') }
```

#### `src/lib/saveClass.js:4` (FunctionDeclaration)

- **Function:** `buildLocationIdMap`
- **Recommendation:** move to rules engine

```javascript
function buildLocationIdMap(stationLocations) { return new Map( stationLocations .filter((location) => location.location_code && location.id) .map((location) => [location.locati...
```

#### `src/lib/saveClass.js:42` (IfStatement)

- **Function:** `saveClass`
- **Recommendation:** move to rules engine

```javascript
if (missingLocations.length > 0) { throw new Error( `Unknown location codes: ${[...new Set(missingLocations)].join(', ')}. Add them to station_locations first.`, ) }
```

#### `src/lib/warningCategories.js:1` (VariableDeclaration)

- **Function:** `—`
- **Recommendation:** move to rules engine

```javascript
MOVABLE_ALLOWED = [ 'S4', 'S5', 'S7', 'S8', 'S9', 'G1', 'G2', 'G3', 'G5', 'G6', 'G7', 'O2', 'O3', 'O4', ]
```

#### `src/lib/warningCategories.js:7` (VariableDeclaration)

- **Function:** `—`
- **Recommendation:** move to rules engine

```javascript
MOVABLE_FORBIDDEN = ['S1', 'S2', 'S3', 'S6', 'G4', 'O1']
```

### Station

#### `src/App.jsx:44` (ConditionalExpression)

- **Function:** `(anonymous)`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
row.templateId ? `${row.templateId}-${index + 1}` : `empty-${index + 1}`
```

#### `src/App.jsx:229` (IfStatement)

- **Function:** `handleRemove`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
if (swapRowId === rowId) { setSwapRowId(null) }
```

#### `src/App.jsx:235` (ConditionalExpression)

- **Function:** `handleRemove`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
row.id === rowId ? clearCircuitRow(row) : row
```

#### `src/components/CircuitMap.jsx:85` (IfStatement)

- **Function:** `handleDragStart`
- **Recommendation:** keep in code

```javascript
if (!canDrag) { event.preventDefault() return }
```

#### `src/components/CircuitMap.jsx:145` (ConditionalExpression)

- **Function:** `StationSlot`
- **Recommendation:** keep in code

```javascript
isUsed ? 'station-card--used' : 'station-card--available'
```

#### `src/components/CircuitMap.jsx:146` (ConditionalExpression)

- **Function:** `StationSlot`
- **Recommendation:** keep in code

```javascript
!isActive ? 'station-card--inactive' : ''
```

#### `src/components/CircuitMap.jsx:147` (ConditionalExpression)

- **Function:** `StationSlot`
- **Recommendation:** keep in code

```javascript
isSelected ? 'station-card--selected' : ''
```

#### `src/components/CircuitMap.jsx:148` (ConditionalExpression)

- **Function:** `StationSlot`
- **Recommendation:** keep in code

```javascript
assignment?.locked ? 'station-card--locked' : ''
```

#### `src/components/CircuitMap.jsx:149` (ConditionalExpression)

- **Function:** `StationSlot`
- **Recommendation:** keep in code

```javascript
isDropTarget ? 'station-card--drop-target' : ''
```

#### `src/components/CircuitMap.jsx:150` (ConditionalExpression)

- **Function:** `StationSlot`
- **Recommendation:** keep in code

```javascript
canDrag ? 'station-card--draggable' : ''
```

#### `src/components/CircuitMap.jsx:167` (ConditionalExpression)

- **Function:** `StationSlot`
- **Recommendation:** keep in code

```javascript
isUsed ? `${code}: ${assignment.station_name}${canDrag ? '. Drag to move.' : ''}` : `${code}: Available${!isUsed && isActive ? '. Drop zone.' : ''}`
```

#### `src/components/CircuitMap.jsx:168` (ConditionalExpression)

- **Function:** `StationSlot`
- **Recommendation:** keep in code

```javascript
canDrag ? '. Drag to move.' : ''
```

#### `src/components/CircuitMap.jsx:169` (ConditionalExpression)

- **Function:** `StationSlot`
- **Recommendation:** keep in code

```javascript
!isUsed && isActive ? '. Drop zone.' : ''
```

#### `src/components/CircuitMap.jsx:190` (ConditionalExpression)

- **Function:** `StationSlot`
- **Recommendation:** keep in code

```javascript
isUsed ? ( <> <p className="station-name">{assignment.station_name}</p> {assignment.equipment_required && assignment.equipment_required !== '—' && ( <p className="station-equipment">{assignment.equipment_required}</p>...
```

#### `src/lib/saveClass.js:103` (IfStatement)

- **Function:** `usageRows`
- **Recommendation:** keep in code

```javascript
if (!exerciseFamily) return null
```

### Equipment

#### `src/lib/locationAssignment.js:4` (VariableDeclaration)

- **Function:** `—`
- **Recommendation:** move to rules engine

```javascript
EQUIPMENT_TYPES = { CABLE: 'cable', CABLE_DUAL: 'cable_dual', TRX: 'trx', SKI_ERG: 'ski_erg', REBOUNDER: 'rebounder', LEG_SLED: 'leg_sled', WEIGHT_BENCH: 'weight_bench', MOVABLE: 'movable', }
```

#### `src/lib/locationAssignment.js:15` (VariableDeclaration)

- **Function:** `—`
- **Recommendation:** move to rules engine

```javascript
ALLOWED_LOCATIONS_BY_TYPE = { [EQUIPMENT_TYPES.CABLE]: ['S1', 'S2'], [EQUIPMENT_TYPES.CABLE_DUAL]: ['S1', 'S2'], [EQUIPMENT_TYPES.TRX]: ['S3'], [EQUIPMENT_TYPES.SKI_ERG]: ['S6'], [EQUIPMENT_TYPES.REBOUNDER]: ['G4'], [...
```

#### `src/lib/locationAssignment.js:38` (VariableDeclaration)

- **Function:** `—`
- **Recommendation:** move to rules engine

```javascript
ASSIGNMENT_PRIORITY = { [EQUIPMENT_TYPES.CABLE_DUAL]: 1, [EQUIPMENT_TYPES.TRX]: 2, [EQUIPMENT_TYPES.SKI_ERG]: 3, [EQUIPMENT_TYPES.REBOUNDER]: 4, [EQUIPMENT_TYPES.LEG_SLED]: 5, [EQUIPMENT_TYPES.CABLE]: 6, [EQUIPMENT_TY...
```

#### `src/lib/locationAssignment.js:52` (VariableDeclaration)

- **Function:** `—`
- **Recommendation:** move to rules engine

```javascript
EQUIPMENT_CAPACITY = { [EQUIPMENT_TYPES.TRX]: 1, [EQUIPMENT_TYPES.SKI_ERG]: 1, [EQUIPMENT_TYPES.REBOUNDER]: 1, [EQUIPMENT_TYPES.LEG_SLED]: MAX_LEG_SLED_STATIONS, [EQUIPMENT_TYPES.WEIGHT_BENCH]: MAX_WEIGHT_BENCH_STATIO...
```

#### `src/lib/locationAssignment.js:66` (IfStatement)

- **Function:** `getEquipmentClassificationText`
- **Recommendation:** move to rules engine

```javascript
if (equipmentRequired) return equipmentRequired
```

#### `src/lib/locationAssignment.js:70` (FunctionDeclaration)

- **Function:** `getEquipmentTypeLabel`
- **Recommendation:** move to rules engine

```javascript
export function getEquipmentTypeLabel(equipmentType) { switch (equipmentType) { case EQUIPMENT_TYPES.TRX: return 'TRX' case EQUIPMENT_TYPES.CABLE: return 'Cable' case EQUIPMENT_...
```

#### `src/lib/locationAssignment.js:71` (SwitchStatement)

- **Function:** `getEquipmentTypeLabel`
- **Recommendation:** move to rules engine

```javascript
switch (equipmentType) { case EQUIPMENT_TYPES.TRX: return 'TRX' case EQUIPMENT_TYPES.CABLE: return 'Cable' case EQUIPMENT_TYPES.CABLE_DUAL: return 'Cable' case EQUIPMENT_TYPES.SKI_ERG: return 'Ski Erg' case EQUIPMENT_...
```

#### `src/lib/locationAssignment.js:72` (CaseClause)

- **Function:** `getEquipmentTypeLabel`
- **Recommendation:** move to rules engine

```javascript
case EQUIPMENT_TYPES.TRX: return 'TRX'
```

#### `src/lib/locationAssignment.js:74` (CaseClause)

- **Function:** `getEquipmentTypeLabel`
- **Recommendation:** move to rules engine

```javascript
case EQUIPMENT_TYPES.CABLE: return 'Cable'
```

#### `src/lib/locationAssignment.js:76` (CaseClause)

- **Function:** `getEquipmentTypeLabel`
- **Recommendation:** move to rules engine

```javascript
case EQUIPMENT_TYPES.CABLE_DUAL: return 'Cable'
```

#### `src/lib/locationAssignment.js:78` (CaseClause)

- **Function:** `getEquipmentTypeLabel`
- **Recommendation:** move to rules engine

```javascript
case EQUIPMENT_TYPES.SKI_ERG: return 'Ski Erg'
```

#### `src/lib/locationAssignment.js:80` (CaseClause)

- **Function:** `getEquipmentTypeLabel`
- **Recommendation:** move to rules engine

```javascript
case EQUIPMENT_TYPES.REBOUNDER: return 'Rebounder'
```

#### `src/lib/locationAssignment.js:82` (CaseClause)

- **Function:** `getEquipmentTypeLabel`
- **Recommendation:** move to rules engine

```javascript
case EQUIPMENT_TYPES.LEG_SLED: return 'Leg Sled'
```

#### `src/lib/locationAssignment.js:84` (CaseClause)

- **Function:** `getEquipmentTypeLabel`
- **Recommendation:** move to rules engine

```javascript
case EQUIPMENT_TYPES.WEIGHT_BENCH: return 'Weight Bench'
```

#### `src/lib/locationAssignment.js:105` (IfStatement)

- **Function:** `requiresBothCables`
- **Recommendation:** move to rules engine

```javascript
if (equipmentRequired.includes('cable')) { return indicatesBothCables(equipmentRequired) }
```

#### `src/lib/locationAssignment.js:109` (IfStatement)

- **Function:** `requiresBothCables`
- **Recommendation:** move to rules engine

```javascript
if (stationName.includes('cable')) { return indicatesBothCables(stationName) }
```

#### `src/lib/locationAssignment.js:120` (FunctionDeclaration)

- **Function:** `getEquipmentType`
- **Recommendation:** move to rules engine

```javascript
export function getEquipmentType(template) { const text = getEquipmentClassificationText(template) if (/\btrx\b/.test(text)) { return EQUIPMENT_TYPES.TRX } if (text.includes('ca...
```

#### `src/lib/locationAssignment.js:123` (IfStatement)

- **Function:** `getEquipmentType`
- **Recommendation:** move to rules engine

```javascript
if (/\btrx\b/.test(text)) { return EQUIPMENT_TYPES.TRX }
```

#### `src/lib/locationAssignment.js:126` (IfStatement)

- **Function:** `getEquipmentType`
- **Recommendation:** move to rules engine

```javascript
if (text.includes('cable')) { return requiresBothCables(template) ? EQUIPMENT_TYPES.CABLE_DUAL : EQUIPMENT_TYPES.CABLE }
```

#### `src/lib/locationAssignment.js:127` (ConditionalExpression)

- **Function:** `getEquipmentType`
- **Recommendation:** move to rules engine

```javascript
requiresBothCables(template) ? EQUIPMENT_TYPES.CABLE_DUAL : EQUIPMENT_TYPES.CABLE
```

#### `src/lib/locationAssignment.js:131` (IfStatement)

- **Function:** `getEquipmentType`
- **Recommendation:** move to rules engine

```javascript
if (text.includes('ski erg')) { return EQUIPMENT_TYPES.SKI_ERG }
```

#### `src/lib/locationAssignment.js:134` (IfStatement)

- **Function:** `getEquipmentType`
- **Recommendation:** move to rules engine

```javascript
if (text.includes('rebounder')) { return EQUIPMENT_TYPES.REBOUNDER }
```

#### `src/lib/locationAssignment.js:137` (IfStatement)

- **Function:** `getEquipmentType`
- **Recommendation:** move to rules engine

```javascript
if (text.includes('leg sled')) { return EQUIPMENT_TYPES.LEG_SLED }
```

#### `src/lib/locationAssignment.js:140` (IfStatement)

- **Function:** `getEquipmentType`
- **Recommendation:** move to rules engine

```javascript
if (text.includes('bench')) { return EQUIPMENT_TYPES.WEIGHT_BENCH }
```

#### `src/lib/ruleValidator.js:132` (FunctionDeclaration)

- **Function:** `checkAdjacentWeightBenches`
- **Recommendation:** move to rules engine

```javascript
function checkAdjacentWeightBenches(circuit, stationTemplates, equipmentAllowedLocations) { const templateById = getTemplateMap(stationTemplates) const benchLocations = new Set(...
```

#### `src/lib/ruleValidator.js:136` (ForOfStatement)

- **Function:** `checkAdjacentWeightBenches`
- **Recommendation:** move to rules engine

```javascript
for (const row of circuit) { const template = templateById.get(row.templateId) if (!template || !row.locationCode || row.locationCode === '—') continue if (getEquipmentType(template) === EQUIPMENT_TYPES.WEIGHT_BENCH) ...
```

#### `src/lib/ruleValidator.js:138` (IfStatement)

- **Function:** `checkAdjacentWeightBenches`
- **Recommendation:** move to rules engine

```javascript
if (!template || !row.locationCode || row.locationCode === '—') continue
```

#### `src/lib/ruleValidator.js:139` (IfStatement)

- **Function:** `checkAdjacentWeightBenches`
- **Recommendation:** move to rules engine

```javascript
if (getEquipmentType(template) === EQUIPMENT_TYPES.WEIGHT_BENCH) { expandLocationCodes(row.locationCode).forEach((code) => benchLocations.add(code)) }
```

#### `src/lib/ruleValidator.js:145` (ForOfStatement)

- **Function:** `checkAdjacentWeightBenches`
- **Recommendation:** move to rules engine

```javascript
for (const [a, b] of ADJACENT_BENCH_PAIRS) { if (benchLocations.has(a) && benchLocations.has(b)) { warnings.push(`Adjacent weight benches: ${a} and ${b} both have weight bench stations.`) } }
```

#### `src/lib/ruleValidator.js:146` (IfStatement)

- **Function:** `checkAdjacentWeightBenches`
- **Recommendation:** move to rules engine

```javascript
if (benchLocations.has(a) && benchLocations.has(b)) { warnings.push(`Adjacent weight benches: ${a} and ${b} both have weight bench stations.`) }
```

#### `src/lib/ruleValidator.js:154` (FunctionDeclaration)

- **Function:** `checkWeightBenchCount`
- **Recommendation:** move to rules engine

```javascript
function checkWeightBenchCount(circuit, stationTemplates, equipmentAllowedLocations) { const templateById = getTemplateMap(stationTemplates) let count = 0 for (const row of circ...
```

#### `src/lib/ruleValidator.js:158` (ForOfStatement)

- **Function:** `checkWeightBenchCount`
- **Recommendation:** move to rules engine

```javascript
for (const row of circuit) { const template = templateById.get(row.templateId) if (!template) continue if (getEquipmentType(template) === EQUIPMENT_TYPES.WEIGHT_BENCH) { count += 1 } }
```

#### `src/lib/ruleValidator.js:160` (IfStatement)

- **Function:** `checkWeightBenchCount`
- **Recommendation:** move to rules engine

```javascript
if (!template) continue
```

#### `src/lib/ruleValidator.js:161` (IfStatement)

- **Function:** `checkWeightBenchCount`
- **Recommendation:** move to rules engine

```javascript
if (getEquipmentType(template) === EQUIPMENT_TYPES.WEIGHT_BENCH) { count += 1 }
```

#### `src/lib/ruleValidator.js:166` (IfStatement)

- **Function:** `checkWeightBenchCount`
- **Recommendation:** move to rules engine

```javascript
if (count > MAX_WEIGHT_BENCH) { return [`More than ${MAX_WEIGHT_BENCH} weight bench stations (${count} selected).`] }
```

#### `src/lib/ruleValidator.js:172` (FunctionDeclaration)

- **Function:** `checkLegSledCount`
- **Recommendation:** move to rules engine

```javascript
function checkLegSledCount(circuit, stationTemplates, equipmentAllowedLocations) { const templateById = getTemplateMap(stationTemplates) let count = 0 for (const row of circuit)...
```

#### `src/lib/ruleValidator.js:176` (ForOfStatement)

- **Function:** `checkLegSledCount`
- **Recommendation:** move to rules engine

```javascript
for (const row of circuit) { const template = templateById.get(row.templateId) if (!template) continue if (getEquipmentType(template) === EQUIPMENT_TYPES.LEG_SLED) { count += 1 } }
```

#### `src/lib/ruleValidator.js:178` (IfStatement)

- **Function:** `checkLegSledCount`
- **Recommendation:** move to rules engine

```javascript
if (!template) continue
```

#### `src/lib/ruleValidator.js:179` (IfStatement)

- **Function:** `checkLegSledCount`
- **Recommendation:** move to rules engine

```javascript
if (getEquipmentType(template) === EQUIPMENT_TYPES.LEG_SLED) { count += 1 }
```

#### `src/lib/ruleValidator.js:184` (IfStatement)

- **Function:** `checkLegSledCount`
- **Recommendation:** move to rules engine

```javascript
if (count > MAX_LEG_SLED) { return [`More than ${MAX_LEG_SLED} leg sled station (${count} selected).`] }
```

#### `src/lib/ruleValidator.js:247` (IfStatement)

- **Function:** `buildRuleValidationSummary`
- **Recommendation:** move to rules engine

```javascript
if (!row.templateId) continue
```

#### `src/lib/ruleValidator.js:249` (IfStatement)

- **Function:** `buildRuleValidationSummary`
- **Recommendation:** move to rules engine

```javascript
if (!template) continue
```

#### `src/lib/ruleValidator.js:252` (IfStatement)

- **Function:** `buildRuleValidationSummary`
- **Recommendation:** move to rules engine

```javascript
if (equipmentType === EQUIPMENT_TYPES.WEIGHT_BENCH) weightBenches += 1
```

#### `src/lib/ruleValidator.js:253` (IfStatement)

- **Function:** `buildRuleValidationSummary`
- **Recommendation:** move to rules engine

```javascript
if (equipmentType === EQUIPMENT_TYPES.TRX) trxStations += 1
```

#### `src/lib/ruleValidator.js:254` (IfStatement)

- **Function:** `buildRuleValidationSummary`
- **Recommendation:** move to rules engine

```javascript
if (equipmentType === EQUIPMENT_TYPES.LEG_SLED) legSledStations += 1
```

#### `src/lib/ruleValidator.js:255` (IfStatement)

- **Function:** `buildRuleValidationSummary`
- **Recommendation:** move to rules engine

```javascript
if (isTruthy(template.heavy_low_back)) heavyLowBack += 1
```

#### `src/lib/ruleValidator.js:256` (IfStatement)

- **Function:** `buildRuleValidationSummary`
- **Recommendation:** move to rules engine

```javascript
if (isTruthy(template.heavy_shoulder)) heavyShoulder += 1
```

#### `src/lib/ruleValidator.js:257` (IfStatement)

- **Function:** `buildRuleValidationSummary`
- **Recommendation:** move to rules engine

```javascript
if (isTruthy(template.twisting_loaded)) twistingLoaded += 1
```

#### `src/lib/stationSelector.js:28` (ForOfStatement)

- **Function:** `getAvailableCategories`
- **Recommendation:** move to rules engine

```javascript
for (const template of filterActiveTemplates(stationTemplates)) { if ( template.planner_category && PLANNER_CATEGORIES.includes(template.planner_category) ) { categories.add(template.planner_category) } }
```

#### `src/lib/stationSelector.js:64` (ForOfStatement)

- **Function:** `getCategoryCountsFromCircuit`
- **Recommendation:** move to rules engine

```javascript
for (const row of circuit) { if (!row.templateId) continue if (counts[row.plannerCategory] !== undefined) { counts[row.plannerCategory] += 1 } }
```

#### `src/lib/stationSelector.js:86` (FunctionDeclaration)

- **Function:** `createEmptyEquipmentCounts`
- **Recommendation:** move to rules engine

```javascript
function createEmptyEquipmentCounts() { return Object.fromEntries(Object.keys(EQUIPMENT_CAPACITY).map((type) => [type, 0])) }
```

#### `src/lib/stationSelector.js:101` (ForOfStatement)

- **Function:** `createSelectionState`
- **Recommendation:** move to rules engine

```javascript
for (const template of selectedTemplates) { applyTemplateToState(state, template) }
```

#### `src/lib/stationSelector.js:131` (FunctionDeclaration)

- **Function:** `wouldExceedEquipmentCapacity`
- **Recommendation:** move to rules engine

```javascript
function wouldExceedEquipmentCapacity(template, state) { const equipmentType = classifyEquipment(template) const limit = EQUIPMENT_CAPACITY[equipmentType] if (limit === undefine...
```

#### `src/lib/stationSelector.js:134` (IfStatement)

- **Function:** `wouldExceedEquipmentCapacity`
- **Recommendation:** move to rules engine

```javascript
if (limit === undefined) return false
```

#### `src/lib/violationTypes.js:4` (IfStatement)

- **Function:** `inferViolationType`
- **Recommendation:** move to rules engine

```javascript
if (text.includes('duplicate station family')) return 'duplicate_station_family'
```

#### `src/lib/violationTypes.js:5` (IfStatement)

- **Function:** `inferViolationType`
- **Recommendation:** move to rules engine

```javascript
if (text.includes('heavy_low_back')) return 'heavy_low_back_limit'
```

#### `src/lib/violationTypes.js:6` (IfStatement)

- **Function:** `inferViolationType`
- **Recommendation:** move to rules engine

```javascript
if (text.includes('heavy_shoulder')) return 'heavy_shoulder_limit'
```

#### `src/lib/violationTypes.js:7` (IfStatement)

- **Function:** `inferViolationType`
- **Recommendation:** move to rules engine

```javascript
if (text.includes('twisting_loaded')) return 'twisting_loaded_limit'
```

#### `src/lib/violationTypes.js:8` (IfStatement)

- **Function:** `inferViolationType`
- **Recommendation:** move to rules engine

```javascript
if (text.includes('3-round class') || text.includes('4-round station')) { return 'four_round_in_three_round_class' }
```

#### `src/lib/violationTypes.js:11` (IfStatement)

- **Function:** `inferViolationType`
- **Recommendation:** move to rules engine

```javascript
if (text.includes('location conflict')) return 'location_conflict'
```

#### `src/lib/violationTypes.js:12` (IfStatement)

- **Function:** `inferViolationType`
- **Recommendation:** move to rules engine

```javascript
if (text.includes('adjacent weight bench')) return 'adjacent_weight_bench'
```

#### `src/lib/violationTypes.js:13` (IfStatement)

- **Function:** `inferViolationType`
- **Recommendation:** move to rules engine

```javascript
if (text.includes('weight bench stations')) return 'weight_bench_limit'
```

#### `src/lib/violationTypes.js:14` (IfStatement)

- **Function:** `inferViolationType`
- **Recommendation:** move to rules engine

```javascript
if (text.includes('leg sled')) return 'leg_sled_limit'
```

#### `src/lib/violationTypes.js:15` (IfStatement)

- **Function:** `inferViolationType`
- **Recommendation:** move to rules engine

```javascript
if (text.includes('category balance')) return 'category_balance'
```

#### `src/lib/violationTypes.js:16` (IfStatement)

- **Function:** `inferViolationType`
- **Recommendation:** move to rules engine

```javascript
if (text.includes('no valid location found')) return 'no_valid_location'
```

#### `src/lib/violationTypes.js:17` (IfStatement)

- **Function:** `inferViolationType`
- **Recommendation:** move to rules engine

```javascript
if (text.includes('classified as') && text.includes('not allowed at that location')) { return 'equipment_location_mismatch' }
```

#### `src/lib/violationTypes.js:20` (IfStatement)

- **Function:** `inferViolationType`
- **Recommendation:** move to rules engine

```javascript
if (text.includes('circuit incomplete')) return 'circuit_incomplete'
```

#### `src/lib/violationTypes.js:21` (IfStatement)

- **Function:** `inferViolationType`
- **Recommendation:** move to rules engine

```javascript
if (text.includes('selection rules were relaxed')) return 'selection_relaxed'
```

#### `src/lib/violationTypes.js:22` (IfStatement)

- **Function:** `inferViolationType`
- **Recommendation:** move to rules engine

```javascript
if (text.includes('could only select')) return 'insufficient_templates'
```

#### `src/lib/violationTypes.js:23` (IfStatement)

- **Function:** `inferViolationType`
- **Recommendation:** move to rules engine

```javascript
if (text.includes('without exceeding capacity')) return 'equipment_capacity'
```

#### `src/lib/violationTypes.js:24` (IfStatement)

- **Function:** `inferViolationType`
- **Recommendation:** move to rules engine

```javascript
if (text.includes('without exceeding limits for')) return 'heavy_limit'
```

#### `src/lib/violationTypes.js:25` (IfStatement)

- **Function:** `inferViolationType`
- **Recommendation:** move to rules engine

```javascript
if (text.includes('no eligible stations remaining for')) return 'category_shortfall'
```

#### `src/lib/violationTypes.js:26` (IfStatement)

- **Function:** `inferViolationType`
- **Recommendation:** move to rules engine

```javascript
if (text.includes('despite exceeding') || text.includes('despite duplicating')) { return 'forced_constraint' }
```

#### `src/lib/violationTypes.js:29` (IfStatement)

- **Function:** `inferViolationType`
- **Recommendation:** move to rules engine

```javascript
if (text.includes('categories unavailable')) return 'unavailable_category'
```

#### `src/lib/violationTypes.js:30` (IfStatement)

- **Function:** `inferViolationType`
- **Recommendation:** move to rules engine

```javascript
if (text.includes('exceeds') && text.includes('capacity')) return 'equipment_capacity'
```

### Exercise Selection

#### `src/lib/manualEdits.js:28` (IfStatement)

- **Function:** `getEligibleSwapTemplates`
- **Recommendation:** keep in code

```javascript
if (!row.locationCode || row.locationCode === '—') { return [] }
```

#### `src/lib/manualEdits.js:33` (IfStatement)

- **Function:** `getEligibleSwapTemplates`
- **Recommendation:** keep in code

```javascript
if (requiredCodes.length === 0) { return [] }
```

#### `src/lib/manualEdits.js:62` (ConditionalExpression)

- **Function:** `getEligibleSwapTemplates`
- **Recommendation:** keep in code

```javascript
sameCategory.length > 0 ? sameCategory : eligible
```

#### `src/lib/stationSelector.js:8` (VariableDeclaration)

- **Function:** `—`
- **Recommendation:** move to rules engine

```javascript
PLANNER_CATEGORIES = [ 'Lower Body', 'Upper Push', 'Upper Pull', 'Core', 'Cardio / Conditioning', 'Mobility / Balance', 'Power', 'Full Body', ]
```

#### `src/lib/stationSelector.js:19` (VariableDeclaration)

- **Function:** `—`
- **Recommendation:** move to rules engine

```javascript
HEAVY_LIMIT = 2
```

#### `src/lib/stationSelector.js:29` (IfStatement)

- **Function:** `getAvailableCategories`
- **Recommendation:** move to rules engine

```javascript
if ( template.planner_category && PLANNER_CATEGORIES.includes(template.planner_category) ) { categories.add(template.planner_category) }
```

#### `src/lib/stationSelector.js:55` (ConditionalExpression)

- **Function:** `(anonymous)`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
index < extra ? 1 : 0
```

#### `src/lib/stationSelector.js:90` (FunctionDeclaration)

- **Function:** `createSelectionState`
- **Recommendation:** move to rules engine

```javascript
function createSelectionState(selectedTemplates = []) { const state = { selected: [], categoryCounts: Object.fromEntries(PLANNER_CATEGORIES.map((c) => [c, 0])), familyCounts: {}...
```

#### `src/lib/stationSelector.js:91` (VariableDeclaration)

- **Function:** `createSelectionState`
- **Recommendation:** move to rules engine

```javascript
state = { selected: [], categoryCounts: Object.fromEntries(PLANNER_CATEGORIES.map((c) => [c, 0])), familyCounts: {}, heavyLowBack: 0, heavyShoulder: 0, twistingLoaded: 0, equipmentCounts: createEmptyEquipmentCounts(), }
```

#### `src/lib/stationSelector.js:145` (FunctionDeclaration)

- **Function:** `wouldDuplicateFamily`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
function wouldDuplicateFamily(template, state) { const family = template.station_family if (!family) return false return (state.familyCounts[family] ?? 0) > 0 }
```

#### `src/lib/stationSelector.js:147` (IfStatement)

- **Function:** `wouldDuplicateFamily`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
if (!family) return false
```

#### `src/lib/stationSelector.js:155` (FunctionDeclaration)

- **Function:** `passesEquipmentAndHeavyConstraints`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
function passesEquipmentAndHeavyConstraints(template, state) { return !wouldExceedEquipmentCapacity(template, state) && !wouldViolateHeavyLimits(template, state) }
```

#### `src/lib/stationSelector.js:194` (IfStatement)

- **Function:** `recordForcedConstraintWarnings`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
if (wouldDuplicateFamily(template, state)) { warnings.push( `Included "${name}" despite duplicating station family "${template.station_family}" — no valid alternative remained.`, ) }
```

#### `src/lib/stationSelector.js:207` (FunctionDeclaration)

- **Function:** `pickFromPool`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
function pickFromPool(pool, predicate) { const matches = pool.filter(predicate) if (matches.length === 0) return null return matches[Math.floor(Math.random() * matches.length)] }
```

#### `src/lib/stationSelector.js:209` (IfStatement)

- **Function:** `pickFromPool`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
if (matches.length === 0) return null
```

#### `src/lib/stationSelector.js:213` (FunctionDeclaration)

- **Function:** `pickForCategory`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
function pickForCategory(pool, category, state, classRoundCount, strictness) { const inCategory = (template) => template.planner_category === category if (strictness === 'prefer...
```

#### `src/lib/stationSelector.js:216` (IfStatement)

- **Function:** `pickForCategory`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
if (strictness === 'preferred') { return pickFromPool(pool, (template) => inCategory(template) && passesPreferredConstraints(template, state, classRoundCount)) }
```

#### `src/lib/stationSelector.js:220` (IfStatement)

- **Function:** `pickForCategory`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
if (strictness === 'equipment-heavy') { return pickFromPool(pool, (template) => inCategory(template) && passesEquipmentAndHeavyConstraints(template, state)) }
```

#### `src/lib/stationSelector.js:247` (VariableDeclaration)

- **Function:** `fillCategoryTargets`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
strictnessLevels = ['preferred', 'equipment-heavy', 'any']
```

#### `src/lib/stationSelector.js:282` (FunctionDeclaration)

- **Function:** `pickRemainingCandidate`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
function pickRemainingCandidate(pool, state, classRoundCount, strictness) { if (strictness === 'preferred') { return pickFromPool(pool, (template) => passesPreferredConstraints(...
```

#### `src/lib/stationSelector.js:283` (IfStatement)

- **Function:** `pickRemainingCandidate`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
if (strictness === 'preferred') { return pickFromPool(pool, (template) => passesPreferredConstraints(template, state, classRoundCount)) }
```

#### `src/lib/stationSelector.js:287` (IfStatement)

- **Function:** `pickRemainingCandidate`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
if (strictness === 'equipment-heavy') { return pickFromPool(pool, (template) => passesEquipmentAndHeavyConstraints(template, state)) }
```

#### `src/lib/stationSelector.js:301` (VariableDeclaration)

- **Function:** `fillRemainingSlots`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
strictnessLevels = ['preferred', 'equipment-heavy', 'any']
```

#### `src/lib/stationSelector.js:322` (FunctionDeclaration)

- **Function:** `selectStations`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
export function selectStations({ stationCount, classRoundCount, stationTemplates, lockedTemplates = [], }) { const activeTemplates = filterActiveTemplates(stationTemplates) cons...
```

#### `src/lib/stationSelector.js:334` (VariableDeclaration)

- **Function:** `selectStations`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
warnings = []
```

#### `src/lib/stationSelector.js:336` (IfStatement)

- **Function:** `selectStations`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
if (activeTemplates.length === 0) { return { selected: [], warnings: ['No active station templates found in the database.'], categoryTargets, availableCategories, unavailableCategories, } }
```

#### `src/lib/stationSelector.js:346` (IfStatement)

- **Function:** `selectStations`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
if (availableCategories.length === 0) { warnings.push('No station templates are available for any planner category.') }
```

#### `src/lib/stationSelector.js:350` (IfStatement)

- **Function:** `selectStations`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
if (unavailableCategories.length > 0) { warnings.push( `Categories unavailable (no active templates): ${unavailableCategories.join(', ')}.`, ) }
```

#### `src/lib/stationSelector.js:356` (IfStatement)

- **Function:** `selectStations`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
if (activeTemplates.length < stationCount) { warnings.push( `Only ${activeTemplates.length} active station template(s) exist in the database, but ${stationCount} were requested.`, ) }
```

#### `src/lib/stationSelector.js:362` (IfStatement)

- **Function:** `selectStations`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
if (lockedTemplates.length > stationCount) { return { selected: lockedTemplates.slice(0, stationCount), warnings: [ ...warnings, 'More locked stations than the requested station count. Only the first locked stations w...
```

#### `src/lib/stationSelector.js:397` (IfStatement)

- **Function:** `selectStations`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
if (state.selected.length < stationCount) { warnings.push( `Could only select ${state.selected.length} of ${stationCount} requested stations due to limited active templates.`, ) }
```

### Category Balance

#### `src/lib/stationSelector.js:45` (FunctionDeclaration)

- **Function:** `calculateCategoryTargets`
- **Recommendation:** move to rules engine

```javascript
export function calculateCategoryTargets(stationCount, availableCategories = PLANNER_CATEGORIES) { if (availableCategories.length === 0) { return Object.fromEntries(PLANNER_CATE...
```

#### `src/lib/stationSelector.js:46` (IfStatement)

- **Function:** `calculateCategoryTargets`
- **Recommendation:** move to rules engine

```javascript
if (availableCategories.length === 0) { return Object.fromEntries(PLANNER_CATEGORIES.map((category) => [category, 0])) }
```

#### `src/lib/stationSelector.js:61` (FunctionDeclaration)

- **Function:** `getCategoryCountsFromCircuit`
- **Recommendation:** move to rules engine

```javascript
export function getCategoryCountsFromCircuit(circuit) { const counts = Object.fromEntries(PLANNER_CATEGORIES.map((category) => [category, 0])) for (const row of circuit) { if (!...
```

#### `src/lib/stationSelector.js:65` (IfStatement)

- **Function:** `getCategoryCountsFromCircuit`
- **Recommendation:** move to rules engine

```javascript
if (!row.templateId) continue
```

#### `src/lib/stationSelector.js:66` (IfStatement)

- **Function:** `getCategoryCountsFromCircuit`
- **Recommendation:** move to rules engine

```javascript
if (counts[row.plannerCategory] !== undefined) { counts[row.plannerCategory] += 1 }
```

#### `src/lib/stationSelector.js:74` (FunctionDeclaration)

- **Function:** `buildCategoryBalance`
- **Recommendation:** move to rules engine

```javascript
export function buildCategoryBalance(stationCount, circuit, stationTemplates = []) { const availableCategories = getAvailableCategories(stationTemplates) const unavailableCatego...
```

#### `src/lib/stationSelector.js:237` (FunctionDeclaration)

- **Function:** `fillCategoryTargets`
- **Recommendation:** move to rules engine

```javascript
function fillCategoryTargets({ pool, state, stationCount, targets, availableCategories, classRoundCount, warnings, warnedCategories, }) { const strictnessLevels = ['preferred', ...
```

#### `src/lib/stationSelector.js:249` (WhileStatement)

- **Function:** `fillCategoryTargets`
- **Recommendation:** move to rules engine

```javascript
while (state.selected.length < stationCount && pool.length > 0) { const needing = getCategoriesNeedingStations(targets, state, availableCategories) if (needing.length === 0) break let picked = null for (const { catego...
```

#### `src/lib/stationSelector.js:255` (ForOfStatement)

- **Function:** `fillCategoryTargets`
- **Recommendation:** move to rules engine

```javascript
for (const { category } of needing) { for (const strictness of strictnessLevels) { picked = pickForCategory(pool, category, state, classRoundCount, strictness) if (picked) break } if (picked) break if (!warnedCategori...
```

#### `src/lib/stationSelector.js:256` (ForOfStatement)

- **Function:** `fillCategoryTargets`
- **Recommendation:** move to rules engine

```javascript
for (const strictness of strictnessLevels) { picked = pickForCategory(pool, category, state, classRoundCount, strictness) if (picked) break }
```

#### `src/lib/stationSelector.js:258` (IfStatement)

- **Function:** `fillCategoryTargets`
- **Recommendation:** move to rules engine

```javascript
if (picked) break
```

#### `src/lib/stationSelector.js:261` (IfStatement)

- **Function:** `fillCategoryTargets`
- **Recommendation:** move to rules engine

```javascript
if (picked) break
```

#### `src/lib/stationSelector.js:263` (IfStatement)

- **Function:** `fillCategoryTargets`
- **Recommendation:** move to rules engine

```javascript
if (!warnedCategories.has(category)) { warnings.push( `No eligible stations remaining for "${category}" (selected ${state.categoryCounts[category]}, target ${targets[category]}).`, ) warnedCategories.add(category) }
```

### Load / Fatigue

#### `src/lib/ruleValidator.js:59` (FunctionDeclaration)

- **Function:** `checkHeavyLimits`
- **Recommendation:** move to rules engine

```javascript
function checkHeavyLimits(circuit, stationTemplates) { const templateById = getTemplateMap(stationTemplates) let heavyLowBack = 0 let heavyShoulder = 0 let twistingLoaded = 0 fo...
```

#### `src/lib/ruleValidator.js:65` (ForOfStatement)

- **Function:** `checkHeavyLimits`
- **Recommendation:** move to rules engine

```javascript
for (const row of circuit) { const template = templateById.get(row.templateId) if (!template) continue if (isTruthy(template.heavy_low_back)) heavyLowBack += 1 if (isTruthy(template.heavy_shoulder)) heavyShoulder += 1...
```

#### `src/lib/ruleValidator.js:67` (IfStatement)

- **Function:** `checkHeavyLimits`
- **Recommendation:** move to rules engine

```javascript
if (!template) continue
```

#### `src/lib/ruleValidator.js:68` (IfStatement)

- **Function:** `checkHeavyLimits`
- **Recommendation:** move to rules engine

```javascript
if (isTruthy(template.heavy_low_back)) heavyLowBack += 1
```

#### `src/lib/ruleValidator.js:69` (IfStatement)

- **Function:** `checkHeavyLimits`
- **Recommendation:** move to rules engine

```javascript
if (isTruthy(template.heavy_shoulder)) heavyShoulder += 1
```

#### `src/lib/ruleValidator.js:70` (IfStatement)

- **Function:** `checkHeavyLimits`
- **Recommendation:** move to rules engine

```javascript
if (isTruthy(template.twisting_loaded)) twistingLoaded += 1
```

#### `src/lib/ruleValidator.js:74` (IfStatement)

- **Function:** `checkHeavyLimits`
- **Recommendation:** move to rules engine

```javascript
if (heavyLowBack > MAX_HEAVY) { warnings.push(`More than ${MAX_HEAVY} heavy_low_back stations (${heavyLowBack} selected).`) }
```

#### `src/lib/ruleValidator.js:77` (IfStatement)

- **Function:** `checkHeavyLimits`
- **Recommendation:** move to rules engine

```javascript
if (heavyShoulder > MAX_HEAVY) { warnings.push(`More than ${MAX_HEAVY} heavy_shoulder stations (${heavyShoulder} selected).`) }
```

#### `src/lib/ruleValidator.js:80` (IfStatement)

- **Function:** `checkHeavyLimits`
- **Recommendation:** move to rules engine

```javascript
if (twistingLoaded > MAX_HEAVY) { warnings.push(`More than ${MAX_HEAVY} twisting_loaded stations (${twistingLoaded} selected).`) }
```

#### `src/lib/ruleValidator.js:246` (ForOfStatement)

- **Function:** `buildRuleValidationSummary`
- **Recommendation:** move to rules engine

```javascript
for (const row of circuit) { if (!row.templateId) continue const template = templateById.get(row.templateId) if (!template) continue const equipmentType = getEquipmentType(template) if (equipmentType === EQUIPMENT_TYP...
```

#### `src/lib/stationSelector.js:112` (IfStatement)

- **Function:** `applyTemplateToState`
- **Recommendation:** move to rules engine

```javascript
if (category && state.categoryCounts[category] !== undefined) { state.categoryCounts[category] += 1 }
```

#### `src/lib/stationSelector.js:117` (IfStatement)

- **Function:** `applyTemplateToState`
- **Recommendation:** move to rules engine

```javascript
if (family) { state.familyCounts[family] = (state.familyCounts[family] ?? 0) + 1 }
```

#### `src/lib/stationSelector.js:121` (IfStatement)

- **Function:** `applyTemplateToState`
- **Recommendation:** move to rules engine

```javascript
if (isTruthy(template.heavy_low_back)) state.heavyLowBack += 1
```

#### `src/lib/stationSelector.js:122` (IfStatement)

- **Function:** `applyTemplateToState`
- **Recommendation:** move to rules engine

```javascript
if (isTruthy(template.heavy_shoulder)) state.heavyShoulder += 1
```

#### `src/lib/stationSelector.js:123` (IfStatement)

- **Function:** `applyTemplateToState`
- **Recommendation:** move to rules engine

```javascript
if (isTruthy(template.twisting_loaded)) state.twistingLoaded += 1
```

#### `src/lib/stationSelector.js:126` (IfStatement)

- **Function:** `applyTemplateToState`
- **Recommendation:** move to rules engine

```javascript
if (EQUIPMENT_CAPACITY[equipmentType] !== undefined) { state.equipmentCounts[equipmentType] += 1 }
```

#### `src/lib/stationSelector.js:138` (FunctionDeclaration)

- **Function:** `wouldViolateHeavyLimits`
- **Recommendation:** move to rules engine

```javascript
function wouldViolateHeavyLimits(template, state) { if (isTruthy(template.heavy_low_back) && state.heavyLowBack >= HEAVY_LIMIT) return true if (isTruthy(template.heavy_shoulder)...
```

#### `src/lib/stationSelector.js:139` (IfStatement)

- **Function:** `wouldViolateHeavyLimits`
- **Recommendation:** move to rules engine

```javascript
if (isTruthy(template.heavy_low_back) && state.heavyLowBack >= HEAVY_LIMIT) return true
```

#### `src/lib/stationSelector.js:140` (IfStatement)

- **Function:** `wouldViolateHeavyLimits`
- **Recommendation:** move to rules engine

```javascript
if (isTruthy(template.heavy_shoulder) && state.heavyShoulder >= HEAVY_LIMIT) return true
```

#### `src/lib/stationSelector.js:141` (IfStatement)

- **Function:** `wouldViolateHeavyLimits`
- **Recommendation:** move to rules engine

```javascript
if (isTruthy(template.twisting_loaded) && state.twistingLoaded >= HEAVY_LIMIT) return true
```

#### `src/lib/stationSelector.js:167` (FunctionDeclaration)

- **Function:** `recordForcedConstraintWarnings`
- **Recommendation:** move to rules engine

```javascript
function recordForcedConstraintWarnings(template, state, classRoundCount, warnings) { const name = template.station_name ?? 'Station' if (wouldExceedEquipmentCapacity(template, ...
```

#### `src/lib/stationSelector.js:170` (IfStatement)

- **Function:** `recordForcedConstraintWarnings`
- **Recommendation:** move to rules engine

```javascript
if (wouldExceedEquipmentCapacity(template, state)) { warnings.push( `Included "${name}" despite exceeding ${getEquipmentTypeLabel(classifyEquipment(template))} capacity — no valid alternative remained.`, ) }
```

#### `src/lib/stationSelector.js:176` (IfStatement)

- **Function:** `recordForcedConstraintWarnings`
- **Recommendation:** move to rules engine

```javascript
if (isTruthy(template.heavy_low_back) && state.heavyLowBack >= HEAVY_LIMIT) { warnings.push( `Included "${name}" despite exceeding heavy_low_back limit — no valid alternative remained.`, ) }
```

#### `src/lib/stationSelector.js:182` (IfStatement)

- **Function:** `recordForcedConstraintWarnings`
- **Recommendation:** move to rules engine

```javascript
if (isTruthy(template.heavy_shoulder) && state.heavyShoulder >= HEAVY_LIMIT) { warnings.push( `Included "${name}" despite exceeding heavy_shoulder limit — no valid alternative remained.`, ) }
```

#### `src/lib/stationSelector.js:188` (IfStatement)

- **Function:** `recordForcedConstraintWarnings`
- **Recommendation:** move to rules engine

```javascript
if (isTruthy(template.twisting_loaded) && state.twistingLoaded >= HEAVY_LIMIT) { warnings.push( `Included "${name}" despite exceeding twisting_loaded limit — no valid alternative remained.`, ) }
```

#### `src/lib/stationSelector.js:200` (IfStatement)

- **Function:** `recordForcedConstraintWarnings`
- **Recommendation:** move to rules engine

```javascript
if (wouldIncludeFourRoundStation(template, classRoundCount)) { warnings.push( `3-round class includes a 4-round station: "${name}" requires 4 rounds.`, ) }
```

### Overrides / Warnings

#### `src/App.jsx:30` (IfStatement)

- **Function:** `formatClassNameFromDate`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
if (!isoDate) return ''
```

#### `src/App.jsx:141` (IfStatement)

- **Function:** `runValidation`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
if (!referenceData) { return { locationWarnings: [], categoryWarnings: [], otherWarnings: [], } }
```

#### `src/App.jsx:167` (IfStatement)

- **Function:** `updateCircuit`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
if (generated) { setWarnings(applyValidation(nextCircuit)) }
```

#### `src/App.jsx:247` (IfStatement)

- **Function:** `handleMapMoveRequest`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
if (!row) return
```

#### `src/App.jsx:257` (IfStatement)

- **Function:** `handleMapMoveRequest`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
if (generated) { setWarnings(applyValidation(nextCircuit)) }
```

#### `src/App.jsx:274` (IfStatement)

- **Function:** `handleMoveCancel`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
if (!pendingMove) return
```

#### `src/App.jsx:277` (IfStatement)

- **Function:** `handleMoveCancel`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
if (generated) { setWarnings(applyValidation(pendingMove.previousCircuit)) }
```

#### `src/lib/ruleValidator.js:12` (VariableDeclaration)

- **Function:** `—`
- **Recommendation:** move to rules engine

```javascript
MAX_HEAVY = 2
```

#### `src/lib/ruleValidator.js:13` (VariableDeclaration)

- **Function:** `—`
- **Recommendation:** move to rules engine

```javascript
MAX_WEIGHT_BENCH = 2
```

#### `src/lib/ruleValidator.js:14` (VariableDeclaration)

- **Function:** `—`
- **Recommendation:** move to rules engine

```javascript
MAX_LEG_SLED = 1
```

#### `src/lib/ruleValidator.js:16` (FunctionDeclaration)

- **Function:** `buildConflictSet`
- **Recommendation:** move to rules engine

```javascript
function buildConflictSet(conflicts) { const set = new Set() for (const row of conflicts) { const a = row.location_code const b = row.conflict_with_location_code if (!a || !b) c...
```

#### `src/lib/ruleValidator.js:18` (ForOfStatement)

- **Function:** `buildConflictSet`
- **Recommendation:** move to rules engine

```javascript
for (const row of conflicts) { const a = row.location_code const b = row.conflict_with_location_code if (!a || !b) continue set.add(`${a}|${b}`) set.add(`${b}|${a}`) }
```

#### `src/lib/ruleValidator.js:21` (IfStatement)

- **Function:** `buildConflictSet`
- **Recommendation:** move to rules engine

```javascript
if (!a || !b) continue
```

#### `src/lib/ruleValidator.js:40` (FunctionDeclaration)

- **Function:** `checkDuplicateStationFamilies`
- **Recommendation:** move to rules engine

```javascript
function checkDuplicateStationFamilies(circuit, stationTemplates) { const templateById = getTemplateMap(stationTemplates) const familyCounts = {} for (const row of circuit) { if...
```

#### `src/lib/ruleValidator.js:42` (VariableDeclaration)

- **Function:** `checkDuplicateStationFamilies`
- **Recommendation:** move to rules engine

```javascript
familyCounts = {}
```

#### `src/lib/ruleValidator.js:44` (ForOfStatement)

- **Function:** `checkDuplicateStationFamilies`
- **Recommendation:** move to rules engine

```javascript
for (const row of circuit) { if (!row.templateId) continue const family = templateById.get(row.templateId)?.station_family if (!family) continue familyCounts[family] = (familyCounts[family] ?? 0) + 1 }
```

#### `src/lib/ruleValidator.js:45` (IfStatement)

- **Function:** `checkDuplicateStationFamilies`
- **Recommendation:** move to rules engine

```javascript
if (!row.templateId) continue
```

#### `src/lib/ruleValidator.js:47` (IfStatement)

- **Function:** `checkDuplicateStationFamilies`
- **Recommendation:** move to rules engine

```javascript
if (!family) continue
```

#### `src/lib/ruleValidator.js:73` (VariableDeclaration)

- **Function:** `checkHeavyLimits`
- **Recommendation:** move to rules engine

```javascript
warnings = []
```

#### `src/lib/ruleValidator.js:87` (IfStatement)

- **Function:** `checkFourRoundStationsInThreeRoundClass`
- **Recommendation:** move to rules engine

```javascript
if (!isThreeRoundClass(classRoundCount)) return []
```

#### `src/lib/ruleValidator.js:98` (FunctionDeclaration)

- **Function:** `checkDatabaseLocationConflicts`
- **Recommendation:** move to rules engine

```javascript
function checkDatabaseLocationConflicts(circuit, conflictSet) { const warnings = [] const locations = getActiveLocations(circuit) for (let i = 0; i < locations.length; i += 1) {...
```

#### `src/lib/ruleValidator.js:99` (VariableDeclaration)

- **Function:** `checkDatabaseLocationConflicts`
- **Recommendation:** move to rules engine

```javascript
warnings = []
```

#### `src/lib/ruleValidator.js:102` (ForStatement)

- **Function:** `checkDatabaseLocationConflicts`
- **Recommendation:** move to rules engine

```javascript
for (let i = 0; i < locations.length; i += 1) { for (let j = i + 1; j < locations.length; j += 1) { if (conflictSet.has(`${locations[i]}|${locations[j]}`)) { warnings.push( `Location conflict: ${locations[i]} and ${lo...
```

#### `src/lib/ruleValidator.js:103` (ForStatement)

- **Function:** `checkDatabaseLocationConflicts`
- **Recommendation:** move to rules engine

```javascript
for (let j = i + 1; j < locations.length; j += 1) { if (conflictSet.has(`${locations[i]}|${locations[j]}`)) { warnings.push( `Location conflict: ${locations[i]} and ${locations[j]} cannot be used together.`, ) } }
```

#### `src/lib/ruleValidator.js:104` (IfStatement)

- **Function:** `checkDatabaseLocationConflicts`
- **Recommendation:** move to rules engine

```javascript
if (conflictSet.has(`${locations[i]}|${locations[j]}`)) { warnings.push( `Location conflict: ${locations[i]} and ${locations[j]} cannot be used together.`, ) }
```

#### `src/lib/ruleValidator.js:115` (FunctionDeclaration)

- **Function:** `checkBuiltInLocationConflicts`
- **Recommendation:** move to rules engine

```javascript
function checkBuiltInLocationConflicts(circuit) { const used = new Set(getActiveLocations(circuit)) const warnings = [] if (used.has('S3') && used.has('S2')) { warnings.push('Lo...
```

#### `src/lib/ruleValidator.js:117` (VariableDeclaration)

- **Function:** `checkBuiltInLocationConflicts`
- **Recommendation:** move to rules engine

```javascript
warnings = []
```

#### `src/lib/ruleValidator.js:144` (VariableDeclaration)

- **Function:** `checkAdjacentWeightBenches`
- **Recommendation:** move to rules engine

```javascript
warnings = []
```

#### `src/lib/ruleValidator.js:190` (FunctionDeclaration)

- **Function:** `checkUnassignedLocations`
- **Recommendation:** move to rules engine

```javascript
function checkUnassignedLocations(circuit, stationTemplates) { const templateById = getTemplateMap(stationTemplates) return circuit .filter((row) => row.templateId && (!row.loca...
```

#### `src/lib/ruleValidator.js:196` (ConditionalExpression)

- **Function:** `(anonymous)`
- **Recommendation:** move to rules engine

```javascript
template ? noValidLocationWarning(template) : `No valid location found for ${row.stationName}.`
```

#### `src/lib/ruleValidator.js:202` (FunctionDeclaration)

- **Function:** `countAdjacentBenchViolations`
- **Recommendation:** move to rules engine

```javascript
function countAdjacentBenchViolations(circuit, stationTemplates) { const templateById = getTemplateMap(stationTemplates) const benchLocations = new Set() for (const row of circu...
```

#### `src/lib/ruleValidator.js:206` (ForOfStatement)

- **Function:** `countAdjacentBenchViolations`
- **Recommendation:** move to rules engine

```javascript
for (const row of circuit) { const template = templateById.get(row.templateId) if (!template || !row.locationCode || row.locationCode === '—') continue if (getEquipmentType(template) === EQUIPMENT_TYPES.WEIGHT_BENCH) ...
```

#### `src/lib/ruleValidator.js:208` (IfStatement)

- **Function:** `countAdjacentBenchViolations`
- **Recommendation:** move to rules engine

```javascript
if (!template || !row.locationCode || row.locationCode === '—') continue
```

#### `src/lib/ruleValidator.js:209` (IfStatement)

- **Function:** `countAdjacentBenchViolations`
- **Recommendation:** move to rules engine

```javascript
if (getEquipmentType(template) === EQUIPMENT_TYPES.WEIGHT_BENCH) { expandLocationCodes(row.locationCode).forEach((code) => benchLocations.add(code)) }
```

#### `src/lib/ruleValidator.js:215` (ForOfStatement)

- **Function:** `countAdjacentBenchViolations`
- **Recommendation:** move to rules engine

```javascript
for (const [a, b] of ADJACENT_BENCH_PAIRS) { if (benchLocations.has(a) && benchLocations.has(b)) { violations += 1 } }
```

#### `src/lib/ruleValidator.js:216` (IfStatement)

- **Function:** `countAdjacentBenchViolations`
- **Recommendation:** move to rules engine

```javascript
if (benchLocations.has(a) && benchLocations.has(b)) { violations += 1 }
```

#### `src/lib/ruleValidator.js:224` (FunctionDeclaration)

- **Function:** `countLocationConflicts`
- **Recommendation:** move to rules engine

```javascript
function countLocationConflicts(circuit, locationConflicts) { const conflictSet = buildConflictSet(locationConflicts ?? []) return ( checkBuiltInLocationConflicts(circuit).lengt...
```

#### `src/lib/ruleValidator.js:276` (FunctionDeclaration)

- **Function:** `validateCircuit`
- **Recommendation:** move to rules engine

```javascript
export function validateCircuit({ circuit, classRoundCount, stationTemplates, locationConflicts, equipmentAllowedLocations, }) { const conflictSet = buildConflictSet(locationCon...
```

#### `src/lib/ruleValidator.js:285` (VariableDeclaration)

- **Function:** `validateCircuit`
- **Recommendation:** move to rules engine

```javascript
locationWarnings = [ ...validateLocationAssignments( circuit, stationTemplates, equipmentAllowedLocations, locationConflicts, ), ...checkBuiltInLocationConflicts(circuit), ...checkDatabaseLocationConflicts(circuit, co...
```

#### `src/lib/ruleValidator.js:300` (VariableDeclaration)

- **Function:** `validateCircuit`
- **Recommendation:** move to rules engine

```javascript
categoryWarnings = []
```

#### `src/lib/ruleValidator.js:302` (VariableDeclaration)

- **Function:** `validateCircuit`
- **Recommendation:** move to rules engine

```javascript
otherWarnings = [ ...checkDuplicateStationFamilies(circuit, stationTemplates), ...checkHeavyLimits(circuit, stationTemplates), ...checkFourRoundStationsInThreeRoundClass(circuit, stationTemplates, classRoundCount), ]
```

#### `src/lib/ruleValidator.js:308` (VariableDeclaration)

- **Function:** `validateCircuit`
- **Recommendation:** move to rules engine

```javascript
categorized = { locationWarnings: [...new Set(locationWarnings)], categoryWarnings: [...new Set(categoryWarnings)], otherWarnings: [...new Set(otherWarnings)], }
```

#### `src/lib/ruleValidator.js:324` (FunctionDeclaration)

- **Function:** `validateCircuitFlat`
- **Recommendation:** move to rules engine

```javascript
export function validateCircuitFlat(args) { return validateCircuit(args).all }
```

#### `src/lib/saveClass.js:34` (IfStatement)

- **Function:** `saveClass`
- **Recommendation:** keep in code

```javascript
if (stationsToSave.length === 0) { throw new Error('No assigned stations to save. Generate a circuit first.') }
```

#### `src/lib/saveClass.js:61` (IfStatement)

- **Function:** `saveClass`
- **Recommendation:** keep in code

```javascript
if (classPlanError) { throw new Error(classPlanError.message) }
```

#### `src/lib/saveClass.js:79` (IfStatement)

- **Function:** `saveClass`
- **Recommendation:** keep in code

```javascript
if (classStationsError) { throw new Error(classStationsError.message) }
```

#### `src/lib/saveClass.js:89` (IfStatement)

- **Function:** `saveClass`
- **Recommendation:** keep in code

```javascript
if (violationRows.length > 0) { const { error: violationsError } = await supabase .from('rule_violations') .insert(violationRows) if (violationsError) { throw new Error(violationsError.message) } }
```

#### `src/lib/saveClass.js:94` (IfStatement)

- **Function:** `saveClass`
- **Recommendation:** keep in code

```javascript
if (violationsError) { throw new Error(violationsError.message) }
```

#### `src/lib/saveClass.js:113` (IfStatement)

- **Function:** `saveClass`
- **Recommendation:** keep in code

```javascript
if (usageRows.length > 0) { const { error: usageError } = await supabase .from('class_exercise_usage') .insert(usageRows) if (usageError) { throw new Error(usageError.message) } }
```

#### `src/lib/supabaseClient.js:6` (IfStatement)

- **Function:** `—`
- **Recommendation:** keep in code

```javascript
if (!supabaseUrl || !supabaseAnonKey) { console.warn( 'Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local', ) }
```

#### `src/lib/violationTypes.js:35` (FunctionDeclaration)

- **Function:** `warningsToViolations`
- **Recommendation:** keep in code

```javascript
export function warningsToViolations(warnings) { return warnings.map((message) => ({ violation_type: inferViolationType(message), message, })) }
```

#### `src/lib/warningCategories.js:9` (FunctionDeclaration)

- **Function:** `isCategoryBalanceWarning`
- **Recommendation:** keep in code

```javascript
export function isCategoryBalanceWarning(message) { const text = (message ?? '').toLowerCase() return text.includes('no eligible stations remaining for') }
```

#### `src/lib/warningCategories.js:14` (FunctionDeclaration)

- **Function:** `isOtherRuleWarning`
- **Recommendation:** keep in code

```javascript
export function isOtherRuleWarning(message) { const text = (message ?? '').toLowerCase() return ( text.includes('categories unavailable') || text.includes('despite exceeding') |...
```

#### `src/lib/warningCategories.js:27` (FunctionDeclaration)

- **Function:** `isLocationRuleWarning`
- **Recommendation:** keep in code

```javascript
export function isLocationRuleWarning(message) { const text = (message ?? '').toLowerCase() if (isCategoryBalanceWarning(message)) return false return ( text.includes('no valid ...
```

#### `src/lib/warningCategories.js:29` (IfStatement)

- **Function:** `isLocationRuleWarning`
- **Recommendation:** keep in code

```javascript
if (isCategoryBalanceWarning(message)) return false
```

#### `src/lib/warningCategories.js:47` (FunctionDeclaration)

- **Function:** `categorizeWarnings`
- **Recommendation:** keep in code

```javascript
export function categorizeWarnings(warnings) { const locationWarnings = [] const categoryWarnings = [] const otherWarnings = [] for (const message of warnings) { if (isCategoryB...
```

#### `src/lib/warningCategories.js:48` (VariableDeclaration)

- **Function:** `categorizeWarnings`
- **Recommendation:** move to rules engine

```javascript
locationWarnings = []
```

#### `src/lib/warningCategories.js:49` (VariableDeclaration)

- **Function:** `categorizeWarnings`
- **Recommendation:** move to rules engine

```javascript
categoryWarnings = []
```

#### `src/lib/warningCategories.js:50` (VariableDeclaration)

- **Function:** `categorizeWarnings`
- **Recommendation:** move to rules engine

```javascript
otherWarnings = []
```

#### `src/lib/warningCategories.js:52` (ForOfStatement)

- **Function:** `categorizeWarnings`
- **Recommendation:** keep in code

```javascript
for (const message of warnings) { if (isCategoryBalanceWarning(message)) { categoryWarnings.push(message) } else if (isOtherRuleWarning(message)) { otherWarnings.push(message) } else if (isLocationRuleWarning(message)...
```

#### `src/lib/warningCategories.js:53` (IfStatement)

- **Function:** `categorizeWarnings`
- **Recommendation:** keep in code

```javascript
if (isCategoryBalanceWarning(message)) { categoryWarnings.push(message) } else if (isOtherRuleWarning(message)) { otherWarnings.push(message) } else if (isLocationRuleWarning(message)) { locationWarnings.push(message)...
```

#### `src/lib/warningCategories.js:55` (IfStatement)

- **Function:** `categorizeWarnings`
- **Recommendation:** keep in code

```javascript
if (isOtherRuleWarning(message)) { otherWarnings.push(message) } else if (isLocationRuleWarning(message)) { locationWarnings.push(message) } else { otherWarnings.push(message) }
```

#### `src/lib/warningCategories.js:57` (IfStatement)

- **Function:** `categorizeWarnings`
- **Recommendation:** keep in code

```javascript
if (isLocationRuleWarning(message)) { locationWarnings.push(message) } else { otherWarnings.push(message) }
```

#### `src/lib/warningCategories.js:71` (FunctionDeclaration)

- **Function:** `mergeCategorizedWarnings`
- **Recommendation:** keep in code

```javascript
export function mergeCategorizedWarnings(...groups) { const merged = { locationWarnings: [], categoryWarnings: [], otherWarnings: [], } for (const group of groups) { if (!group)...
```

#### `src/lib/warningCategories.js:72` (VariableDeclaration)

- **Function:** `mergeCategorizedWarnings`
- **Recommendation:** move to rules engine

```javascript
merged = { locationWarnings: [], categoryWarnings: [], otherWarnings: [], }
```

#### `src/lib/warningCategories.js:78` (ForOfStatement)

- **Function:** `mergeCategorizedWarnings`
- **Recommendation:** keep in code

```javascript
for (const group of groups) { if (!group) continue if (Array.isArray(group)) { const categorized = categorizeWarnings(group) merged.locationWarnings.push(...categorized.locationWarnings) merged.categoryWarnings.push(....
```

#### `src/lib/warningCategories.js:79` (IfStatement)

- **Function:** `mergeCategorizedWarnings`
- **Recommendation:** keep in code

```javascript
if (!group) continue
```

#### `src/lib/warningCategories.js:80` (IfStatement)

- **Function:** `mergeCategorizedWarnings`
- **Recommendation:** keep in code

```javascript
if (Array.isArray(group)) { const categorized = categorizeWarnings(group) merged.locationWarnings.push(...categorized.locationWarnings) merged.categoryWarnings.push(...categorized.categoryWarnings) merged.otherWarning...
```

### Planner Algorithm Logic

#### `src/lib/circuitGenerator.js:48` (FunctionDeclaration)

- **Function:** `generateCircuit`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
export function generateCircuit({ stationCount, classRoundCount, stationTemplates, stationRounds = [], stationLocations, locationConflicts, equipmentAllowedLocations, existingCi...
```

#### `src/lib/circuitGenerator.js:58` (VariableDeclaration)

- **Function:** `generateCircuit`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
warnings = []
```

#### `src/lib/circuitGenerator.js:109` (VariableDeclaration)

- **Function:** `generateCircuit`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
assignmentQueue = [...templatesForAssignment]
```

#### `src/lib/circuitGenerator.js:110` (VariableDeclaration)

- **Function:** `generateCircuit`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
circuit = []
```

#### `src/lib/circuitGenerator.js:113` (ForStatement)

- **Function:** `generateCircuit`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
for (let index = 0; index < stationCount; index += 1) { const existingRow = existingRows[index] if (existingRow?.locked && existingRow.templateId) { const template = templateById.get(existingRow.templateId) circuit.pu...
```

#### `src/lib/circuitGenerator.js:150` (WhileStatement)

- **Function:** `generateCircuit`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
while (circuit.length < stationCount) { const template = assignmentQueue.shift() if (!template) { circuit.push(buildEmptyRow(circuit.length + 1)) continue } circuit.push( createStationRow( circuit.length + 1, template...
```

#### `src/lib/circuitGenerator.js:172` (ConditionalExpression)

- **Function:** `circuit`
- **Recommendation:** hybrid — keep orchestration in code, externalize thresholds

```javascript
row.templateId ? `${row.templateId}-${index + 1}` : row.id ?? `empty-${index + 1}`
```

### UI Validation

#### `src/components/CircuitMap.jsx:19` (VariableDeclaration)

- **Function:** `—`
- **Recommendation:** keep in code

```javascript
GYM_LAYOUT = [ { code: 'G7', area: 'left' }, { code: 'G6', area: 'left' }, { code: 'G1', area: 'right' }, { code: 'G2', area: 'right' }, { code: 'G3', area: 'right' }, { code: 'G5', area: 'bottom' }, { code: 'G4', are...
```

#### `src/components/CircuitMap.jsx:107` (IfStatement)

- **Function:** `handleDragOver`
- **Recommendation:** keep in code

```javascript
if (!isActive || isUsed || moveDisabled) return
```

#### `src/components/CircuitMap.jsx:119` (IfStatement)

- **Function:** `handleDrop`
- **Recommendation:** keep in code

```javascript
if (!isActive || isUsed || moveDisabled) return
```

#### `src/components/CircuitMap.jsx:130` (IfStatement)

- **Function:** `handleDrop`
- **Recommendation:** keep in code

```javascript
if (!payload?.fromLocationCode || !payload?.templateId) return
```

#### `src/components/CircuitMap.jsx:131` (IfStatement)

- **Function:** `handleDrop`
- **Recommendation:** keep in code

```javascript
if (payload.fromLocationCode === code) return
```

#### `src/components/CircuitMap.jsx:290` (VariableDeclaration)

- **Function:** `CircuitMap`
- **Recommendation:** keep in code

```javascript
slotProps = [ assignmentMap, locations, selectedStationId, dragState, interactionsDisabled, onStationClick, onMoveRequest, handleDragStateChange, ]
```

#### `src/components/CircuitMap.jsx:302` (ConditionalExpression)

- **Function:** `CircuitMap`
- **Recommendation:** keep in code

```javascript
generated ? '' : ' circuit-map-card--preview'
```

#### `src/components/CircuitMap.jsx:314` (ConditionalExpression)

- **Function:** `CircuitMap`
- **Recommendation:** keep in code

```javascript
generated ? '' : ' circuit-map-layout--preview'
```

#### `src/components/CircuitTable.jsx:16` (ConditionalExpression)

- **Function:** `displayRows`
- **Recommendation:** keep in code

```javascript
row.templateId ? ++stationCount : '—'
```

#### `src/components/CircuitTable.jsx:28` (ConditionalExpression)

- **Function:** `CircuitTable`
- **Recommendation:** keep in code

```javascript
!generated ? ( <p className="empty-state">Generate a circuit to see proposed stations.</p> ) : circuit.length === 0 ? ( <p className="empty-state">No stations were assigned. Check warnings for details.</p> ) : ( <div ...
```

#### `src/components/CircuitTable.jsx:30` (ConditionalExpression)

- **Function:** `CircuitTable`
- **Recommendation:** keep in code

```javascript
circuit.length === 0 ? ( <p className="empty-state">No stations were assigned. Check warnings for details.</p> ) : ( <div className="table-wrap"> <table className="circuit-table"> <thead> <tr> <th>Station #</th> <th>L...
```

#### `src/components/CircuitTable.jsx:54` (ConditionalExpression)

- **Function:** `(anonymous)`
- **Recommendation:** keep in code

```javascript
row.locked ? 'row-locked' : ''
```

#### `src/components/CircuitTable.jsx:55` (ConditionalExpression)

- **Function:** `(anonymous)`
- **Recommendation:** keep in code

```javascript
isEmpty ? 'row-cleared' : ''
```

#### `src/components/CircuitTable.jsx:69` (ConditionalExpression)

- **Function:** `(anonymous)`
- **Recommendation:** keep in code

```javascript
row.locked ? ' is-active' : ''
```

#### `src/components/CircuitTable.jsx:72` (ConditionalExpression)

- **Function:** `(anonymous)`
- **Recommendation:** keep in code

```javascript
row.locked ? 'Unlock station' : 'Lock station in place'
```

#### `src/components/CircuitTable.jsx:74` (ConditionalExpression)

- **Function:** `(anonymous)`
- **Recommendation:** keep in code

```javascript
row.locked ? 'Unlock' : 'Lock'
```

#### `src/components/MoveConfirmModal.jsx:6` (IfStatement)

- **Function:** `MoveConfirmModal`
- **Recommendation:** keep in code

```javascript
if (!move) return null
```

#### `src/components/SwapModal.jsx:7` (IfStatement)

- **Function:** `SwapModal`
- **Recommendation:** keep in code

```javascript
if (!row) return null
```

#### `src/components/SwapModal.jsx:23` (ConditionalExpression)

- **Function:** `SwapModal`
- **Recommendation:** keep in code

```javascript
candidates.length === 0 ? ( <p className="empty-state">No eligible replacement stations for this location.</p> ) : ( <ul className="swap-list"> {candidates.map((template) => ( <li key={template.id}> <button type="butt...
```

#### `src/components/WarningsPanel.jsx:6` (ConditionalExpression)

- **Function:** `RuleCheckRow`
- **Recommendation:** keep in code

```javascript
isViolation ? ' rule-check-row--warn' : ''
```

#### `src/components/WarningsPanel.jsx:8` (ConditionalExpression)

- **Function:** `RuleCheckRow`
- **Recommendation:** keep in code

```javascript
isViolation ? '!' : '✓'
```

#### `src/components/WarningsPanel.jsx:54` (ConditionalExpression)

- **Function:** `WarningsPanel`
- **Recommendation:** keep in code

```javascript
!generated ? ( <p className="insights-empty">Generate a circuit to see rules engine insights.</p> ) : ( <> <div className="insights-summary"> <div className="insights-stat"> <span className="insights-stat-label">Stati...
```

#### `src/components/WarningsPanel.jsx:126` (ConditionalExpression)

- **Function:** `(anonymous)`
- **Recommendation:** keep in code

```javascript
target > 0 ? Math.min(100, (actual / target) * 100) : 0
```

#### `src/components/WarningsPanel.jsx:139` (ConditionalExpression)

- **Function:** `(anonymous)`
- **Recommendation:** keep in code

```javascript
isMismatch ? ' category-progress-fill--warn' : ''
```

#### `src/components/WarningsPanel.jsx:166` (ConditionalExpression)

- **Function:** `WarningsPanel`
- **Recommendation:** keep in code

```javascript
locationWarnings.length === 0 ? ( <p className="insights-ok">All locations look good.</p> ) : ( <ul className="insights-notes-list insights-notes-list--warn"> {locationWarnings.map((warning, index) => ( <li key={`loca...
```

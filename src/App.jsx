import { useCallback, useEffect, useMemo, useState } from 'react'
import Sidebar from './components/Sidebar'
import GenerateControls from './components/GenerateControls'
import CircuitTable from './components/CircuitTable'
import CircuitMap from './components/CircuitMap'
import WarningsPanel from './components/WarningsPanel'
import SwapModal from './components/SwapModal'
import MoveConfirmModal from './components/MoveConfirmModal'
import { fetchReferenceData } from './lib/fetchReferenceData'
import { generateCircuit } from './lib/circuitGenerator'
import { validateCircuit } from './lib/ruleValidator'
import { mergeCategorizedWarnings } from './lib/warningCategories'
import { saveClass } from './lib/saveClass'
import { buildRoundCountMap, getClassRoundCount } from './lib/rounds'
import {
  applySwapTemplate,
  applyMoveToLocation,
  clearCircuitRow,
  findCircuitRowForMapLocation,
  getEligibleSwapTemplates,
  toggleRowLock,
} from './lib/manualEdits'
import './App.css'

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

function formatClassNameFromDate(isoDate) {
  if (!isoDate) return ''

  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const monthName = date.toLocaleString('en-US', { month: 'long' })
  const twoDigitYear = String(year).slice(-2)

  return `${monthName} ${day}, ${twoDigitYear}`
}

function renumberCircuit(rows) {
  return rows.map((row, index) => ({
    ...row,
    stationNumber: index + 1,
    id: row.templateId ? `${row.templateId}-${index + 1}` : `empty-${index + 1}`,
  }))
}

export default function App() {
  const [referenceData, setReferenceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const [classDate, setClassDate] = useState(todayIsoDate())
  const [className, setClassName] = useState(() => formatClassNameFromDate(todayIsoDate()))
  const [notes, setNotes] = useState('')
  const [stationCount, setStationCount] = useState(8)
  const [repeatWindowDays, setRepeatWindowDays] = useState(21)

  const [circuit, setCircuit] = useState([])
  const [warnings, setWarnings] = useState({
    locationWarnings: [],
    categoryWarnings: [],
    otherWarnings: [],
  })
  const [generated, setGenerated] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState(null)
  const [swapRowId, setSwapRowId] = useState(null)
  const [selectedMapStationId, setSelectedMapStationId] = useState(null)
  const [pendingMove, setPendingMove] = useState(null)

  const classRoundCount = useMemo(
    () => getClassRoundCount(stationCount),
    [stationCount],
  )

  const roundCountMap = useMemo(
    () => buildRoundCountMap(referenceData?.stationRounds ?? []),
    [referenceData],
  )

  const mapAssignments = useMemo(
    () =>
      circuit
        .filter((row) => row.templateId && row.locationCode && row.locationCode !== '—')
        .map((row) => ({
          location_code: row.locationCode,
          station_name: row.stationName,
          planner_category: row.plannerCategory,
          equipment_required: row.equipmentRequired,
          station_number: row.stationNumber,
          locked: row.locked,
          station_template_id: row.templateId,
        })),
    [circuit],
  )

  const handleClassDateChange = useCallback((nextDate) => {
    setClassName((prevName) => {
      const previousDefault = formatClassNameFromDate(classDate)
      if (prevName === previousDefault || prevName === '') {
        return formatClassNameFromDate(nextDate)
      }
      return prevName
    })
    setClassDate(nextDate)
  }, [classDate])

  useEffect(() => {
    let cancelled = false

    async function loadReferenceData() {
      setLoading(true)
      setLoadError(null)

      try {
        const data = await fetchReferenceData()
        if (!cancelled) {
          setReferenceData(data)
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error.message ?? 'Failed to load data from Supabase')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadReferenceData()
    return () => {
      cancelled = true
    }
  }, [])

  const runValidation = useCallback(
    (nextCircuit) => {
      if (!referenceData) {
        return {
          locationWarnings: [],
          categoryWarnings: [],
          otherWarnings: [],
        }
      }

      return validateCircuit({
        circuit: nextCircuit.filter((row) => row.templateId),
        classRoundCount,
        stationTemplates: referenceData.stationTemplates,
        locationConflicts: referenceData.locationConflicts,
        equipmentAllowedLocations: referenceData.equipmentAllowedLocations,
      })
    },
    [referenceData, classRoundCount],
  )

  const applyValidation = (nextCircuit, extraWarnings = []) => {
    const validated = runValidation(nextCircuit)
    return mergeCategorizedWarnings(extraWarnings, validated)
  }

  const updateCircuit = (nextCircuit) => {
    setCircuit(nextCircuit)
    if (generated) {
      setWarnings(applyValidation(nextCircuit))
    }
  }

  const handleGenerate = () => {
    if (!referenceData) return

    setGenerating(true)
    setSwapRowId(null)
    setPendingMove(null)

    const { circuit: nextCircuit, warnings: generationWarnings } = generateCircuit({
      stationCount,
      classRoundCount,
      stationTemplates: referenceData.stationTemplates,
      stationRounds: referenceData.stationRounds,
      stationLocations: referenceData.stationLocations,
      locationConflicts: referenceData.locationConflicts,
      equipmentAllowedLocations: referenceData.equipmentAllowedLocations,
      existingCircuit: circuit,
    })

    setCircuit(nextCircuit)
    setWarnings(applyValidation(nextCircuit, generationWarnings))
    setGenerated(true)
    setGenerating(false)
  }

  const handleLock = (rowId) => {
    updateCircuit(
      circuit.map((row) => (row.id === rowId ? toggleRowLock(row) : row)),
    )
  }

  const handleSwapOpen = (rowId) => {
    setSwapRowId(rowId)
  }

  const handleSwapSelect = (template) => {
    if (!swapRowId) return

    const row = circuit.find((entry) => entry.id === swapRowId)
    if (!row) {
      setSwapRowId(null)
      return
    }

    updateCircuit(
      circuit.map((entry) =>
        entry.id === swapRowId
          ? applySwapTemplate(entry, template, {
              roundCountMap,
              classRoundCount,
            })
          : entry,
      ),
    )
    setSwapRowId(null)
  }

  const handleRemove = (rowId) => {
    if (swapRowId === rowId) {
      setSwapRowId(null)
    }

    updateCircuit(
      renumberCircuit(
        circuit.map((row) => (row.id === rowId ? clearCircuitRow(row) : row)),
      ),
    )
  }

  const handleMapMoveRequest = ({
    fromLocationCode,
    toLocationCode,
    templateId,
    stationName,
  }) => {
    const row = findCircuitRowForMapLocation(circuit, fromLocationCode, templateId)
    if (!row) return

    const previousCircuit = circuit
    const nextCircuit = circuit.map((entry) =>
      entry.id === row.id
        ? applyMoveToLocation(entry, toLocationCode)
        : entry,
    )

    setCircuit(nextCircuit)
    if (generated) {
      setWarnings(applyValidation(nextCircuit))
    }

    setPendingMove({
      fromLocationCode,
      toLocationCode,
      stationName: stationName ?? row.stationName,
      previousCircuit,
    })
  }

  const handleMoveConfirm = () => {
    setPendingMove(null)
  }

  const handleMoveCancel = () => {
    if (!pendingMove) return

    setCircuit(pendingMove.previousCircuit)
    if (generated) {
      setWarnings(applyValidation(pendingMove.previousCircuit))
    }
    setPendingMove(null)
  }

  const canSave =
    generated &&
    circuit.some(
      (row) => row.templateId && row.locationCode && row.locationCode !== '—',
    )

  const handleSave = async () => {
    if (!referenceData || !canSave) return

    setSaving(true)
    setSaveMessage(null)

    try {
      const { classPlanId } = await saveClass({
        classDate,
        className,
        notes,
        stationCount,
        repeatWindowClasses: classRoundCount,
        circuit,
        warnings,
        stationTemplates: referenceData.stationTemplates,
        stationLocations: referenceData.stationLocations,
      })
      setSaveMessage({
        type: 'success',
        text: `Class saved successfully (ID: ${classPlanId}).`,
      })
    } catch (error) {
      setSaveMessage({
        type: 'error',
        text: error.message ?? 'Failed to save class.',
      })
    } finally {
      setSaving(false)
    }
  }

  const swapRow = circuit.find((row) => row.id === swapRowId)
  const swapCandidates =
    swapRow && referenceData
      ? getEligibleSwapTemplates({
          row: swapRow,
          circuit,
          stationTemplates: referenceData.stationTemplates,
          equipmentAllowedLocations: referenceData.equipmentAllowedLocations,
        })
      : []

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="main-content">
        {loadError && (
          <div className="banner banner-error" role="alert">
            Could not load Supabase data: {loadError}
          </div>
        )}

        <header className="hero-header">
          <h1>Let&apos;s build an amazing class</h1>
          <p className="hero-tagline">
            Empowering women through strength, movement &amp; community.
          </p>
        </header>

        <GenerateControls
          classDate={classDate}
          className={className}
          notes={notes}
          stationCount={stationCount}
          repeatWindowDays={repeatWindowDays}
          classRoundCount={classRoundCount}
          loading={loading}
          generating={generating}
          saving={saving}
          canSave={canSave}
          saveMessage={saveMessage}
          onClassDateChange={handleClassDateChange}
          onClassNameChange={setClassName}
          onNotesChange={setNotes}
          onStationCountChange={setStationCount}
          onRepeatWindowDaysChange={setRepeatWindowDays}
          onGenerate={handleGenerate}
          onSave={handleSave}
        />

        <div className="planner-grid">
          <CircuitMap
            locations={referenceData?.stationLocations ?? []}
            assignments={mapAssignments}
            selectedStationId={selectedMapStationId}
            onStationClick={({ stationTemplateId }) => {
              setSelectedMapStationId(stationTemplateId ?? null)
            }}
            onMoveRequest={handleMapMoveRequest}
            moveDisabled={Boolean(pendingMove)}
            generated={generated}
          />
          <WarningsPanel
            warnings={warnings}
            generated={generated}
            circuit={circuit}
            stationCount={stationCount}
            stationTemplates={referenceData?.stationTemplates ?? []}
            locationConflicts={referenceData?.locationConflicts ?? []}
          />
        </div>

        <CircuitTable
          circuit={circuit}
          generated={generated}
          onLock={handleLock}
          onSwap={handleSwapOpen}
          onRemove={handleRemove}
        />

        <SwapModal
          row={swapRow}
          candidates={swapCandidates}
          onSelect={handleSwapSelect}
          onClose={() => setSwapRowId(null)}
        />

        <MoveConfirmModal
          move={pendingMove}
          onConfirm={handleMoveConfirm}
          onCancel={handleMoveCancel}
        />
      </div>
    </div>
  )
}

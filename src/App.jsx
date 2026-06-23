import { useCallback, useEffect, useMemo, useState } from 'react'
import Sidebar from './components/Sidebar'
import GenerateControls from './components/GenerateControls'
import SavedClassControls from './components/SavedClassControls'
import MyClasses from './components/MyClasses'
import CircuitTable from './components/CircuitTable'
import CircuitMap from './components/CircuitMap'
import WarningsPanel from './components/WarningsPanel'
import SwapModal from './components/SwapModal'
import MoveConfirmModal from './components/MoveConfirmModal'
import DeleteClassModal from './components/DeleteClassModal'
import { fetchReferenceData } from './lib/fetchReferenceData'
import { generateCircuit } from './lib/circuitGenerator'
import { validateCircuit } from './lib/ruleValidator'
import { mergeCategorizedWarnings } from './lib/warningCategories'
import { saveClass } from './lib/saveClass'
import { deleteClassPlan, fetchSavedClassPlans, loadClass } from './lib/loadClass'
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

function createClassSnapshot({
  className,
  notes,
  stationCount,
  classRoundCount,
  circuit,
}) {
  return {
    className,
    notes,
    stationCount,
    classRoundCount,
    circuit: JSON.parse(JSON.stringify(circuit)),
  }
}

function applyClassSnapshot(snapshot, setters) {
  setters.setClassName(snapshot.className)
  setters.setNotes(snapshot.notes)
  setters.setStationCount(snapshot.stationCount)
  setters.setClassRoundCount(snapshot.classRoundCount)
  setters.setCircuit(snapshot.circuit)
}

export default function App() {
  const [activeView, setActiveView] = useState('create')
  const [myClassesScreen, setMyClassesScreen] = useState('list')
  const [referenceData, setReferenceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const [classDate, setClassDate] = useState(todayIsoDate())
  const [className, setClassName] = useState(() => formatClassNameFromDate(todayIsoDate()))
  const [notes, setNotes] = useState('')
  const [stationCount, setStationCount] = useState(8)
  const [classRoundCount, setClassRoundCount] = useState(() => getClassRoundCount(8))
  const [repeatWindowDays, setRepeatWindowDays] = useState(21)

  useEffect(() => {
    if (activeView === 'create') {
      setClassRoundCount(getClassRoundCount(stationCount))
    }
  }, [stationCount, activeView])

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
  const [savedClassPlans, setSavedClassPlans] = useState([])
  const [analyticsRefreshKey, setAnalyticsRefreshKey] = useState(0)
  const [loadingClassPlans, setLoadingClassPlans] = useState(false)
  const [loadingClass, setLoadingClass] = useState(false)
  const [myClassesMessage, setMyClassesMessage] = useState(null)
  const [viewingClassPlan, setViewingClassPlan] = useState(null)
  const [classEditMode, setClassEditMode] = useState(false)
  const [classDirty, setClassDirty] = useState(false)
  const [savedClassSnapshot, setSavedClassSnapshot] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deletingClass, setDeletingClass] = useState(false)
  const [swapRowId, setSwapRowId] = useState(null)
  const [selectedMapStationId, setSelectedMapStationId] = useState(null)
  const [pendingMove, setPendingMove] = useState(null)

  const isSavedClassDetail =
    activeView === 'classes' && myClassesScreen === 'detail' && viewingClassPlan

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

  const refreshSavedClassPlans = useCallback(async () => {
    const plans = await fetchSavedClassPlans()
    setSavedClassPlans(plans)
    setAnalyticsRefreshKey((key) => key + 1)
    return plans
  }, [])

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

  useEffect(() => {
    let cancelled = false

    async function loadSavedClassPlans() {
      setLoadingClassPlans(true)

      try {
        const plans = await refreshSavedClassPlans()
        if (!cancelled) {
          setSavedClassPlans(plans)
        }
      } catch (error) {
        if (!cancelled) {
          setMyClassesMessage({
            type: 'error',
            text: error.message ?? 'Failed to load saved class list.',
          })
        }
      } finally {
        if (!cancelled) {
          setLoadingClassPlans(false)
        }
      }
    }

    loadSavedClassPlans()
    return () => {
      cancelled = true
    }
  }, [refreshSavedClassPlans])

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

  const markClassDirtyIfEditing = useCallback(() => {
    if (isSavedClassDetail && classEditMode) {
      setClassDirty(true)
    }
  }, [isSavedClassDetail, classEditMode])

  const updateCircuit = (nextCircuit) => {
    setCircuit(nextCircuit)
    if (generated) {
      setWarnings(applyValidation(nextCircuit))
    }
    markClassDirtyIfEditing()
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
    markClassDirtyIfEditing()

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
        stationRounds: referenceData.stationRounds,
        exercises: referenceData.exercises,
      })
      setSaveMessage({
        type: 'success',
        text: `Class saved successfully (ID: ${classPlanId}).`,
      })
      await refreshSavedClassPlans()
    } catch (error) {
      setSaveMessage({
        type: 'error',
        text: error.message ?? 'Failed to save class.',
      })
    } finally {
      setSaving(false)
    }
  }

  const applyLoadedClass = useCallback(
    (loaded) => {
      setViewingClassPlan(loaded.classPlan)
      setClassDate(loaded.classPlan.class_date ?? todayIsoDate())
      setClassName(loaded.classPlan.class_name ?? '')
      setNotes(loaded.classPlan.notes ?? '')
      setStationCount(Number(loaded.classPlan.requested_station_count) || loaded.circuit.length)
      setClassRoundCount(
        Number(loaded.classPlan.repeat_window_classes) ||
          getClassRoundCount(loaded.circuit.length),
      )
      setCircuit(loaded.circuit)
      setWarnings(applyValidation(loaded.circuit))
      setGenerated(true)
      setSavedClassSnapshot(
        createClassSnapshot({
          className: loaded.classPlan.class_name ?? '',
          notes: loaded.classPlan.notes ?? '',
          stationCount: Number(loaded.classPlan.requested_station_count) || loaded.circuit.length,
          classRoundCount:
            Number(loaded.classPlan.repeat_window_classes) ||
            getClassRoundCount(loaded.circuit.length),
          circuit: loaded.circuit,
        }),
      )
      setClassEditMode(false)
      setClassDirty(false)
    },
    [applyValidation],
  )

  const handleNavigate = (view) => {
    setActiveView(view)
    setMyClassesMessage(null)
    setSaveMessage(null)

    if (view === 'classes') {
      setMyClassesScreen('list')
      setViewingClassPlan(null)
      setClassEditMode(false)
      setClassDirty(false)
      setSavedClassSnapshot(null)
    }
  }

  const handleOpenClass = async (classPlanId, { startInEditMode = false } = {}) => {
    setLoadingClass(true)
    setMyClassesMessage(null)
    setSwapRowId(null)
    setPendingMove(null)

    try {
      const loaded = await loadClass(classPlanId)
      applyLoadedClass(loaded)
      if (startInEditMode) {
        setClassEditMode(true)
        setClassDirty(false)
      }
      setMyClassesScreen('detail')
      setActiveView('classes')
    } catch (error) {
      setMyClassesMessage({
        type: 'error',
        text: error.message ?? 'Failed to load class.',
      })
    } finally {
      setLoadingClass(false)
    }
  }

  const handleBackToMyClasses = () => {
    setMyClassesScreen('list')
    setViewingClassPlan(null)
    setClassEditMode(false)
    setClassDirty(false)
    setSavedClassSnapshot(null)
    setSwapRowId(null)
    setPendingMove(null)
    setMyClassesMessage(null)
  }

  const handleEditClass = () => {
    setClassEditMode(true)
    setClassDirty(false)
  }

  const handleCancelEditClass = () => {
    if (savedClassSnapshot) {
      applyClassSnapshot(savedClassSnapshot, {
        setClassName,
        setNotes,
        setStationCount,
        setClassRoundCount,
        setCircuit,
      })
      setWarnings(applyValidation(savedClassSnapshot.circuit))
    }
    setClassEditMode(false)
    setClassDirty(false)
  }

  const handleSaveAsNew = async () => {
    if (!referenceData || !classDirty || !canSave) return

    setSaving(true)
    setMyClassesMessage(null)

    try {
      const newClassDate = todayIsoDate()
      const { classPlanId } = await saveClass({
        classDate: newClassDate,
        className,
        notes,
        stationCount,
        repeatWindowClasses: classRoundCount,
        circuit,
        warnings,
        stationTemplates: referenceData.stationTemplates,
        stationLocations: referenceData.stationLocations,
        stationRounds: referenceData.stationRounds,
        exercises: referenceData.exercises,
      })

      await refreshSavedClassPlans()
      setMyClassesMessage({
        type: 'success',
        text: `Saved as new class on ${newClassDate} (ID: ${classPlanId}). The original class was not changed.`,
      })
      setClassEditMode(false)
      setClassDirty(false)
    } catch (error) {
      setMyClassesMessage({
        type: 'error',
        text: error.message ?? 'Failed to save as new class.',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRequest = (plan) => {
    const target = plan?.id != null ? plan : viewingClassPlan
    if (target) {
      setDeleteTarget(target)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteTarget(null)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget?.id) return

    const deletedName = deleteTarget.class_name
    setDeletingClass(true)

    try {
      await deleteClassPlan(deleteTarget.id)
      await refreshSavedClassPlans()
      setDeleteTarget(null)
      setMyClassesScreen('list')
      setViewingClassPlan(null)
      setClassEditMode(false)
      setClassDirty(false)
      setSavedClassSnapshot(null)
      setSwapRowId(null)
      setPendingMove(null)
      setActiveView('classes')
      setMyClassesMessage({
        type: 'success',
        text: `Deleted class "${deletedName}".`,
      })
    } catch (error) {
      setMyClassesMessage({
        type: 'error',
        text: error.message ?? 'Failed to delete class.',
      })
    } finally {
      setDeletingClass(false)
    }
  }

  const handleSavedClassNameChange = (value) => {
    setClassName(value)
    if (classEditMode) setClassDirty(true)
  }

  const handleSavedNotesChange = (value) => {
    setNotes(value)
    if (classEditMode) setClassDirty(true)
  }

  const handleSavedStationCountChange = (value) => {
    setStationCount(value)
    if (classEditMode) setClassDirty(true)
  }

  const handleSavedClassRoundCountChange = (value) => {
    setClassRoundCount(value)
    if (classEditMode) setClassDirty(true)
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

  const circuitTableReadOnly = isSavedClassDetail && !classEditMode
  const mapMoveDisabled =
    Boolean(pendingMove) || !generated || (isSavedClassDetail && !classEditMode)

  return (
    <div className="app-shell">
      <Sidebar activeView={activeView} onNavigate={handleNavigate} />

      <div className="main-content">
        {loadError && (
          <div className="banner banner-error" role="alert">
            Could not load Supabase data: {loadError}
          </div>
        )}

        {activeView === 'create' && (
          <>
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
              onClassRoundCountChange={setClassRoundCount}
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
                moveDisabled={mapMoveDisabled}
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
          </>
        )}

        {activeView === 'classes' && myClassesScreen === 'list' && (
          <MyClasses
            plans={savedClassPlans}
            loading={loadingClassPlans || loadingClass}
            message={myClassesMessage}
            analyticsRefreshKey={analyticsRefreshKey}
            onSelectClass={handleOpenClass}
            onEditClass={(classPlanId) => handleOpenClass(classPlanId, { startInEditMode: true })}
          />
        )}

        {isSavedClassDetail && (
          <>
            <header className="hero-header">
              <h1>{viewingClassPlan.class_name}</h1>
              <p className="hero-tagline">Saved class details</p>
            </header>

            <SavedClassControls
              classPlan={viewingClassPlan}
              className={className}
              notes={notes}
              stationCount={stationCount}
              classRoundCount={classRoundCount}
              editMode={classEditMode}
              dirty={classDirty}
              saving={saving}
              message={myClassesMessage}
              onClassNameChange={handleSavedClassNameChange}
              onNotesChange={handleSavedNotesChange}
              onStationCountChange={handleSavedStationCountChange}
              onClassRoundCountChange={handleSavedClassRoundCountChange}
              onEdit={handleEditClass}
              onCancelEdit={handleCancelEditClass}
              onSaveAsNew={handleSaveAsNew}
              onDelete={() => handleDeleteRequest()}
              onBack={handleBackToMyClasses}
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
                moveDisabled={mapMoveDisabled}
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
              readOnly={circuitTableReadOnly}
              onLock={handleLock}
              onSwap={handleSwapOpen}
              onRemove={handleRemove}
            />
          </>
        )}

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

        <DeleteClassModal
          classPlan={deleteTarget}
          deleting={deletingClass}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      </div>
    </div>
  )
}

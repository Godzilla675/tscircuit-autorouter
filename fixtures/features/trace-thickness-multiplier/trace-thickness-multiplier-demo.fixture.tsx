import { AutoroutingPipelineDebugger } from "lib/testing/AutoroutingPipelineDebugger"
import { SimpleRouteJson } from "lib/types"
import { useState } from "react"

/**
 * Demo fixture for the traceThicknessMultiplier feature.
 *
 * This demo shows how different traceThicknessMultiplier values (2x, 4x, 8x)
 * affect the trace width during routing. The multiplier is applied to the
 * minTraceWidth to determine the nominalTraceWidth that the TraceWidthSolver
 * attempts to use when there's sufficient clearance.
 *
 * - 2x: nominalTraceWidth = minTraceWidth * 2 (default)
 * - 4x: nominalTraceWidth = minTraceWidth * 4
 * - 8x: nominalTraceWidth = minTraceWidth * 8
 *
 * The solver will use the widest trace width that fits within the available
 * clearance, falling back to narrower widths when obstacles or other traces
 * require it.
 */

// Sample circuit with multiple connections to demonstrate trace width effects
const baseSrj: SimpleRouteJson = {
  layerCount: 2,
  minTraceWidth: 0.15,
  bounds: { minX: -20, maxX: 20, minY: -20, maxY: 20 },
  obstacles: [
    // Central obstacle to force routing around
    {
      type: "rect",
      layers: ["top", "bottom"],
      center: { x: 0, y: 0 },
      width: 4,
      height: 4,
      connectedTo: [],
    },
    // Component pads on the left side
    {
      type: "rect",
      layers: ["top"],
      center: { x: -12, y: 5 },
      width: 1.5,
      height: 1,
      connectedTo: ["conn1"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: { x: -12, y: 0 },
      width: 1.5,
      height: 1,
      connectedTo: ["conn2"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: { x: -12, y: -5 },
      width: 1.5,
      height: 1,
      connectedTo: ["conn3"],
    },
    // Component pads on the right side
    {
      type: "rect",
      layers: ["top"],
      center: { x: 12, y: 5 },
      width: 1.5,
      height: 1,
      connectedTo: ["conn1"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: { x: 12, y: 0 },
      width: 1.5,
      height: 1,
      connectedTo: ["conn2"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: { x: 12, y: -5 },
      width: 1.5,
      height: 1,
      connectedTo: ["conn3"],
    },
  ],
  connections: [
    {
      name: "conn1",
      pointsToConnect: [
        { x: -12, y: 5, layer: "top" },
        { x: 12, y: 5, layer: "top" },
      ],
    },
    {
      name: "conn2",
      pointsToConnect: [
        { x: -12, y: 0, layer: "top" },
        { x: 12, y: 0, layer: "top" },
      ],
    },
    {
      name: "conn3",
      pointsToConnect: [
        { x: -12, y: -5, layer: "top" },
        { x: 12, y: -5, layer: "top" },
      ],
    },
  ],
}

type MultiplierValue = 2 | 4 | 8

const multiplierInfo: Record<
  MultiplierValue,
  { label: string; description: string; color: string }
> = {
  2: {
    label: "Standard",
    description: "Default trace width, good for dense routing",
    color: "#3b82f6",
  },
  4: {
    label: "Medium",
    description: "Wider traces for better current capacity",
    color: "#8b5cf6",
  },
  8: {
    label: "Wide",
    description: "Maximum width for high-current paths",
    color: "#ec4899",
  },
}

export default () => {
  const [multiplier, setMultiplier] = useState<MultiplierValue>(2)

  // Create SRJ with the selected traceThicknessMultiplier
  const srj: SimpleRouteJson = {
    ...baseSrj,
    traceThicknessMultiplier: multiplier,
  }

  const nominalWidth = baseSrj.minTraceWidth * multiplier

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header Panel */}
      <div
        className="px-6 py-4 shadow-md"
        style={{
          background: `linear-gradient(135deg, ${multiplierInfo[multiplier].color}15 0%, #f8fafc 100%)`,
          borderBottom: `3px solid ${multiplierInfo[multiplier].color}`,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: multiplierInfo[multiplier].color }}
              />
              Trace Thickness Multiplier Demo
            </h1>
            <p className="text-slate-600 mt-1">
              Interactive demonstration of the{" "}
              <code className="bg-slate-200 px-2 py-0.5 rounded text-sm font-mono">
                traceThicknessMultiplier
              </code>{" "}
              routing feature
            </p>
          </div>

          {/* Current Value Display */}
          <div
            className="text-right px-4 py-2 rounded-lg"
            style={{
              backgroundColor: `${multiplierInfo[multiplier].color}10`,
              border: `1px solid ${multiplierInfo[multiplier].color}30`,
            }}
          >
            <div className="text-xs text-slate-500 uppercase tracking-wide">
              Nominal Trace Width
            </div>
            <div
              className="text-2xl font-bold"
              style={{ color: multiplierInfo[multiplier].color }}
            >
              {nominalWidth.toFixed(2)}mm
            </div>
            <div className="text-xs text-slate-500">
              {baseSrj.minTraceWidth}mm × {multiplier}
            </div>
          </div>
        </div>

        {/* Multiplier Selection */}
        <div className="flex items-center gap-6">
          <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Select Multiplier
          </span>
          <div className="flex gap-3">
            {([2, 4, 8] as MultiplierValue[]).map((m) => {
              const info = multiplierInfo[m]
              const isSelected = multiplier === m
              return (
                <button
                  key={m}
                  onClick={() => setMultiplier(m)}
                  className="group relative transition-all duration-200"
                  style={{
                    transform: isSelected ? "scale(1.02)" : "scale(1)",
                  }}
                >
                  <div
                    className="px-5 py-3 rounded-lg transition-all duration-200"
                    style={{
                      backgroundColor: isSelected ? info.color : "white",
                      color: isSelected ? "white" : "#334155",
                      border: `2px solid ${isSelected ? info.color : "#e2e8f0"}`,
                      boxShadow: isSelected
                        ? `0 4px 12px ${info.color}40`
                        : "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{m}×</span>
                      <span className="text-sm font-medium">{info.label}</span>
                    </div>
                    <div
                      className="text-xs mt-1"
                      style={{
                        color: isSelected ? "rgba(255,255,255,0.8)" : "#64748b",
                      }}
                    >
                      {(baseSrj.minTraceWidth * m).toFixed(2)}mm width
                    </div>
                  </div>
                  {/* Hover tooltip */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 -bottom-12 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10"
                    style={{ boxShadow: "0 4px 6px rgba(0,0,0,0.2)" }}
                  >
                    {info.description}
                    <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 bg-slate-800 rotate-45" />
                  </div>
                </button>
              )
            })}
          </div>

          {/* Info Badge */}
          <div className="ml-auto flex items-center gap-2 text-sm text-slate-600 bg-white px-4 py-2 rounded-lg border border-slate-200">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              The solver uses the widest trace that fits, falling back to
              narrower widths near obstacles
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <AutoroutingPipelineDebugger key={multiplier} srj={srj} />
      </div>
    </div>
  )
}

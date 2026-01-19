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

export default () => {
  const [multiplier, setMultiplier] = useState<MultiplierValue>(2)

  // Create SRJ with the selected traceThicknessMultiplier
  const srj: SimpleRouteJson = {
    ...baseSrj,
    traceThicknessMultiplier: multiplier,
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 bg-gray-100 border-b">
        <h1 className="text-xl font-bold mb-2">
          Trace Thickness Multiplier Demo
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          This demo shows how different traceThicknessMultiplier values affect
          the trace width. The multiplier is applied to minTraceWidth (
          {baseSrj.minTraceWidth}mm) to determine the nominal trace width.
        </p>
        <div className="flex items-center gap-4">
          <span className="font-medium">Select Multiplier:</span>
          <div className="flex gap-2">
            {([2, 4, 8] as MultiplierValue[]).map((m) => (
              <button
                key={m}
                onClick={() => setMultiplier(m)}
                className={`px-4 py-2 rounded ${
                  multiplier === m
                    ? "bg-blue-500 text-white"
                    : "bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {m}x ({(baseSrj.minTraceWidth * m).toFixed(2)}mm)
              </button>
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-4">
            Current: {multiplier}x → nominalTraceWidth ={" "}
            {(baseSrj.minTraceWidth * multiplier).toFixed(2)}mm
          </span>
        </div>
      </div>
      <div className="flex-1">
        <AutoroutingPipelineDebugger key={multiplier} srj={srj} />
      </div>
    </div>
  )
}

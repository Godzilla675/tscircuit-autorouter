import { test, expect } from "bun:test"
import { AutoroutingPipelineSolver2_PortPointPathing } from "lib/autorouter-pipelines/AutoroutingPipeline2_PortPointPathing/AutoroutingPipelineSolver2_PortPointPathing"
import type { SimpleRouteJson, SimpleRouteConnection } from "lib/types"

/**
 * Test that per-connection trace width (nominalTraceWidth) is propagated
 * through the pipeline and reflected in the output traces.
 *
 * This tests the implementation of trace thickness as a parameter,
 * supporting multiples like 2x, 4x, 8x of the minimum trace width.
 */
test("per-connection trace width - propagates nominalTraceWidth through pipeline", () => {
  // Create a simple two-connection scenario with different trace widths
  // Connection 1: Normal data trace (0.15mm = minTraceWidth)
  // Connection 2: Power trace (0.3mm = 2x minTraceWidth)
  const minTraceWidth = 0.15

  const srj: SimpleRouteJson = {
    layerCount: 2,
    minTraceWidth,
    obstacles: [],
    connections: [
      {
        name: "conn_data",
        // No nominalTraceWidth specified - should use minTraceWidth
        pointsToConnect: [
          { x: 0, y: 0, layer: "top" },
          { x: 5, y: 0, layer: "top" },
        ],
      },
      {
        name: "conn_power",
        // 2x trace width for power
        nominalTraceWidth: 0.3,
        pointsToConnect: [
          { x: 0, y: 2, layer: "top" },
          { x: 5, y: 2, layer: "top" },
        ],
      },
    ],
    bounds: { minX: -2, maxX: 8, minY: -2, maxY: 6 },
  }

  const solver = new AutoroutingPipelineSolver2_PortPointPathing(srj)
  solver.solve()

  expect(solver.solved).toBe(true)
  expect(solver.failed).toBe(false)

  const output = solver.getOutputSimplifiedPcbTraces()
  expect(output.length).toBeGreaterThan(0)

  // Find traces by connection name
  const dataTrace = output.find((t) => t.connection_name === "conn_data")
  const powerTrace = output.find((t) => t.connection_name === "conn_power")

  expect(dataTrace).toBeDefined()
  expect(powerTrace).toBeDefined()

  // Check that wire segments have the correct width
  const dataWires = dataTrace!.route.filter((r) => r.route_type === "wire") as Array<{
    route_type: "wire"
    x: number
    y: number
    width: number
    layer: string
  }>
  const powerWires = powerTrace!.route.filter((r) => r.route_type === "wire") as Array<{
    route_type: "wire"
    x: number
    y: number
    width: number
    layer: string
  }>

  expect(dataWires.length).toBeGreaterThan(0)
  expect(powerWires.length).toBeGreaterThan(0)

  // Data trace should use minimum trace width (0.15mm)
  for (const wire of dataWires) {
    expect(wire.width).toBe(minTraceWidth)
  }

  // Power trace should use 2x trace width (0.3mm)
  for (const wire of powerWires) {
    expect(wire.width).toBe(0.3)
  }
})

test("per-connection trace width - 4x and 8x multiples", () => {
  const minTraceWidth = 0.15

  const srj: SimpleRouteJson = {
    layerCount: 2,
    minTraceWidth,
    obstacles: [],
    connections: [
      {
        name: "conn_power_4x",
        nominalTraceWidth: 0.6, // 4x minimum (0.6mm)
        pointsToConnect: [
          { x: 0, y: 0, layer: "top" },
          { x: 10, y: 0, layer: "top" },
        ],
      },
      {
        name: "conn_power_8x",
        nominalTraceWidth: 1.2, // 8x minimum (1.2mm)
        pointsToConnect: [
          { x: 0, y: 5, layer: "top" },
          { x: 10, y: 5, layer: "top" },
        ],
      },
    ],
    bounds: { minX: -2, maxX: 15, minY: -2, maxY: 10 },
  }

  const solver = new AutoroutingPipelineSolver2_PortPointPathing(srj)
  solver.solve()

  expect(solver.solved).toBe(true)

  const output = solver.getOutputSimplifiedPcbTraces()
  expect(output.length).toBeGreaterThan(0)

  // Find traces
  const trace4x = output.find((t) => t.connection_name === "conn_power_4x")
  const trace8x = output.find((t) => t.connection_name === "conn_power_8x")

  expect(trace4x).toBeDefined()
  expect(trace8x).toBeDefined()

  // Verify widths - type assertion for wire segments
  const wires4x = trace4x!.route.filter((r) => r.route_type === "wire") as Array<{
    route_type: "wire"
    width: number
  }>
  const wires8x = trace8x!.route.filter((r) => r.route_type === "wire") as Array<{
    route_type: "wire"
    width: number
  }>

  for (const wire of wires4x) {
    expect(wire.width).toBe(0.6)
  }

  for (const wire of wires8x) {
    expect(wire.width).toBe(1.2)
  }
})

test("per-connection trace width - merged connections preserve trace width", () => {
  const minTraceWidth = 0.15

  // Create connections that share a common point (will be merged)
  const srj: SimpleRouteJson = {
    layerCount: 2,
    minTraceWidth,
    obstacles: [],
    connections: [
      {
        name: "power_segment1",
        nominalTraceWidth: 0.3,
        pointsToConnect: [
          { x: 0, y: 0, layer: "top" },
          { x: 5, y: 0, layer: "top" },
        ],
      },
      {
        name: "power_segment2",
        nominalTraceWidth: 0.3,
        pointsToConnect: [
          { x: 5, y: 0, layer: "top" }, // Shared point with segment1
          { x: 10, y: 0, layer: "top" },
        ],
      },
    ],
    bounds: { minX: -2, maxX: 15, minY: -2, maxY: 5 },
  }

  const solver = new AutoroutingPipelineSolver2_PortPointPathing(srj)
  solver.solve()

  expect(solver.solved).toBe(true)

  const output = solver.getOutputSimplifiedPcbTraces()
  expect(output.length).toBeGreaterThan(0)

  // All wires in the merged connection should have the same trace width
  for (const trace of output) {
    const wires = trace.route.filter((r) => r.route_type === "wire") as Array<{
      route_type: "wire"
      width: number
    }>
    for (const wire of wires) {
      // The merged connection should preserve the nominalTraceWidth
      expect(wire.width).toBe(0.3)
    }
  }
})

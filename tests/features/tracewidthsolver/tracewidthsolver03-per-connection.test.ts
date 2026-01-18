import { test, expect } from "bun:test"
import { TraceWidthSolver } from "lib/solvers/TraceWidthSolver/TraceWidthSolver"
import { HighDensityRoute } from "lib/types/high-density-types"
import { SimpleRouteConnection } from "lib/types"

test("TraceWidthSolver - respects per-connection nominalTraceWidth", () => {
  // Scenario: Two parallel traces with 0.5mm separation.
  // Trace 1 wants 0.6mm width.
  // Trace 2 wants 0.15mm width (default).
  // Margin = 0.15mm.
  //
  // Check for 0.6mm width on Trace 1:
  // Required clearance = width/2 + margin = 0.3 + 0.15 = 0.45mm
  // Available clearance = distance - other_trace_half_width = 0.5 - 0.075 = 0.425mm
  // 0.425 < 0.45, so 0.6mm should fail.
  //
  // Check for 0.3mm width (next step in schedule):
  // Required clearance = 0.15 + 0.15 = 0.30mm
  // Available clearance = 0.425mm
  // 0.425 > 0.30, so 0.3mm should succeed.

  const hdRoutes: HighDensityRoute[] = [
    {
      connectionName: "conn1",
      traceThickness: 0.15, // Initial thickness
      viaDiameter: 0.6,
      route: [
        { x: 0, y: 0, z: 0 },
        { x: 10, y: 0, z: 0 },
      ],
      vias: [],
    },
    {
      connectionName: "conn2",
      traceThickness: 0.15,
      viaDiameter: 0.6,
      route: [
        { x: 0, y: 0.5, z: 0 },
        { x: 10, y: 0.5, z: 0 },
      ],
      vias: [],
    },
  ]

  const connections: SimpleRouteConnection[] = [
    {
      name: "conn1",
      nominalTraceWidth: 0.6,
      pointsToConnect: [],
    },
    {
      name: "conn2",
      nominalTraceWidth: 0.15,
      pointsToConnect: [],
    },
  ]

  const solver = new TraceWidthSolver({
    hdRoutes,
    connections,
    minTraceWidth: 0.15,
    nominalTraceWidth: 0.15, // Global default
    obstacleMargin: 0.15,
  })

  solver.solve()

  expect(solver.solved).toBe(true)
  const resultRoutes = solver.getHdRoutesWithWidths()

  const route1 = resultRoutes.find(r => r.connectionName === "conn1")
  const route2 = resultRoutes.find(r => r.connectionName === "conn2")

  expect(route1).toBeDefined()
  expect(route2).toBeDefined()

  // Route 1 should have reduced to 0.3mm
  expect(route1!.traceThickness).toBeCloseTo(0.3, 2)

  // Route 2 should stay at 0.15mm
  expect(route2!.traceThickness).toBeCloseTo(0.15, 2)
})

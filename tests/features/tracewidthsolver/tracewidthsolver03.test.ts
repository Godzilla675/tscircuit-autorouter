import { test, expect } from "bun:test"
import { TraceWidthSolver } from "lib/solvers/TraceWidthSolver/TraceWidthSolver"

test("TraceWidthSolver - uses thickness multiplier for nominal width", () => {
  const solver = new TraceWidthSolver({
    hdRoutes: [
      {
        connectionName: "net1",
        traceThickness: 0.15,
        viaDiameter: 0.6,
        route: [
          { x: 0, y: 0, z: 0 },
          { x: 10, y: 0, z: 0 },
        ],
        vias: [],
      },
    ],
    minTraceWidth: 0.15,
    defaultTraceThickness: 0.15,
    traceThicknessMultiplier: 4,
  })

  solver.solve()

  expect(solver.solved).toBe(true)
  expect(solver.nominalTraceWidth).toBeCloseTo(0.6)
  expect(solver.getHdRoutesWithWidths()[0]?.traceThickness).toBeCloseTo(0.6)
})

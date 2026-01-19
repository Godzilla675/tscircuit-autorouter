import { test, expect } from "bun:test"
import { AssignableAutoroutingPipeline2 } from "../lib/autorouter-pipelines/AssignableAutoroutingPipeline2/AssignableAutoroutingPipeline2"
import { SimpleRouteJson } from "../lib/types"
import { convertToCircuitJson } from "../lib/testing/utils/convertToCircuitJson"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

// Base SRJ from the fixture
const baseSrj: SimpleRouteJson = {
  layerCount: 2,
  minTraceWidth: 0.15,
  bounds: { minX: -20, maxX: 20, minY: -20, maxY: 20 },
  obstacles: [
    {
      type: "rect",
      layers: ["top", "bottom"],
      center: { x: 0, y: 0 },
      width: 4,
      height: 4,
      connectedTo: [],
    },
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

test("trace thickness multiplier 8x snapshot", async () => {
  const multiplier = 8
  const srj: SimpleRouteJson = {
    ...baseSrj,
    traceThicknessMultiplier: multiplier,
  }

  const solver = new AssignableAutoroutingPipeline2(srj, {})
  solver.solve()

  expect(solver.failed).toBe(false)

  const srjWithPointPairs =
    solver.netToPointPairsSolver?.getNewSimpleRouteJson() ||
    solver.srjWithPointPairs
  if (!srjWithPointPairs) throw new Error("No srjWithPointPairs")

  const routes = solver.getOutputSimplifiedPcbTraces()
  const circuitJson = convertToCircuitJson(
    srjWithPointPairs,
    routes,
    srj.minTraceWidth,
  )
  const svg = convertCircuitJsonToPcbSvg(circuitJson)

  await expect(svg).toMatchSvgSnapshot(import.meta.path)
})

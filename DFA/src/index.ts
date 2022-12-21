import p5 from 'p5'
const width = 800
const height = 800

const stateWidth = 40

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw message || "Assertion failed"
  }
}

const allUnique = (arr: any[]) => {
  return (new Set(arr)).size === arr.length
}

interface DFASpec {
  states: string[]
  transitions: { [key: string]: { [key: string]: string }}
  finalStates: string[]
  startingState: string
}
type id = symbol

interface DFA {
  Q: Set<id>
  Sigma: Set<symbol>
  delta: (q: id) => (a: id) => id
  q0: id
  F: Set<id>
}

interface DFAState {
  dfa: DFA
  q: id
  s: symbol[]
}

interface DFAVisual {
  dfaState: DFAState
  positions: Map<id, [number, number]>
}
const drawDFA = (dfaVisual: DFAVisual) => (p5: p5) => {
  const { dfaState, positions } = dfaVisual
  const { dfa } = dfaState
  const { Q, Sigma, delta, q0, F } = dfa
  Q.forEach(q => {
    const [x, y] = positions.get(q)
    p5.push()
    if (q === dfaState.q) {
      p5.fill(200, 200, 200)
    }
    p5.circle(x, y, stateWidth)
    p5.pop()
    p5.textAlign(p5.CENTER, p5.CENTER)
    p5.text(q.description, x, y)
  })
  Q.forEach(from => {
    Sigma.forEach(a => {
      const to = delta(from)(a)
      if (to === from) { return }
      const [x1, y1] = positions.get(from)
      const [x2, y2] = positions.get(to)
      const dx = x2 - x1
      const dy = y2 - y1
      const theta = Math.atan2(dy, dx)
      // copilot supprised me with this one
      // refactor later ... maybe
      const x1a = x1 + stateWidth / 2 * Math.cos(theta)
      const y1a = y1 + stateWidth / 2 * Math.sin(theta)
      const x2a = x2 - stateWidth / 2 * Math.cos(theta)
      const y2a = y2 - stateWidth / 2 * Math.sin(theta)
      p5.line(x1a, y1a, x2a, y2a)
      p5.textAlign(p5.CENTER, p5.CENTER)
      p5.text(a.description, (x1a + x2a) / 2, (y1a + y2a) / 2)
      // draw arrow
      const arrowSize = 10
      const arrowTheta = Math.PI / 6
      const arrowTheta1 = theta + arrowTheta
      const arrowTheta2 = theta - arrowTheta
      const x1b = x2a - arrowSize * Math.cos(arrowTheta1)
      const y1b = y2a - arrowSize * Math.sin(arrowTheta1)
      const x2b = x2a - arrowSize * Math.cos(arrowTheta2)
      const y2b = y2a - arrowSize * Math.sin(arrowTheta2)
      p5.triangle(x2a, y2a, x1b, y1b, x2b, y2b)
    })
  })
}

const dfaStep = (dfaState: DFAState) => {
  if (dfaState.s.length === 0) { return }
  const a = dfaState.s.shift()
  dfaState.q = dfaState.dfa.delta(dfaState.q)(a)
}

const s = (p:p5) => {

  const letterA = Symbol('a')
  const letterB = Symbol('b')
  const input = [
    letterA,
    letterA,
    letterB,
  ]
  const stateA = Symbol('a')
  const stateB = Symbol('b')
  const stateC = Symbol('c')
  const dfa: DFA = {
    Q: new Set([
      stateA,
      stateB,
      stateC
    ]),
    Sigma: new Set([
      letterA,
      letterB,
    ]),
    delta: (q: id) => (a: id) => {
      switch (q) {
        case stateA: switch (a) {
          case letterA: return stateB
          case letterB: return stateB
        }
        case stateB: switch (a) {
          case letterA: return stateC
          case letterB: return stateC
        }
        case stateC: switch (a) {
          case letterA: return stateA
          case letterB: return stateA
        }
      }
    },
    q0: stateA,
    F: new Set()
  }
  const dfaState: DFAState = {
    dfa,
    q: dfa.q0,
    s: [
      ...input,
    ],
  }
  const dfaVisual: DFAVisual = {
    dfaState,
    positions: new Map([
      [stateA, [100, 100]],
      [stateB, [200, 200]],
      [stateC, [200, 400]],
    ]),
  }

  p.setup = function() {
    p.createCanvas(width, height)
    p.frameRate(1)
  }

  p.draw = function() {
    p.background(200)
    drawDFA(dfaVisual)(p)
    dfaStep(dfaState)
  }
}

new p5(s)
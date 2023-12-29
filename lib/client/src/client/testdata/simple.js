/** @type {import('@opencodegraph/provider').Provider} */
export default {
  capabilities: () => ({}),
  annotations: () => [
    {
      title: 'A',
      range: { start: { line: 1, character: 2 }, end: { line: 3, character: 4 } },
    },
  ],
}

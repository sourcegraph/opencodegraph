/** @type {import('@opencodegraph/provider').Provider} */
export default {
  capabilities: () => ({ selector: [{ path: 'foo' }] }),
  annotations: (_params, settings) => [
    {
      title: settings.myTitle,
      range: { start: { line: 1, character: 2 }, end: { line: 3, character: 4 } },
    },
  ],
}

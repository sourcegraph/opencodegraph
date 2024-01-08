/** @type {import('@openctx/provider').Provider} */
export default {
  capabilities: () => ({ selector: [{ path: 'foo' }] }),
  items: (_params, settings) => [
    {
      title: settings.myTitle,
      range: { start: { line: 1, character: 2 }, end: { line: 3, character: 4 } },
    },
  ],
}

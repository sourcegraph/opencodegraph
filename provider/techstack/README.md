# Tech Stack File context provider for OpenCodeGraph

This is a context provider for [OpenCodeGraph](https://opencodegraph.org) that annotates your code with metadata such as package category and package homepage urls provided by a corresponding `techstack.yml` file.

## Example
![OpenCodeGraph Techstack provider in action](./examples/demo.gif)

## Usage

Provide the absolute file path of the techstack yml file in the settings.
```json
"opencodegraph.providers": {
    // ... other providers ...
    "https://opencodegraph.org/npm/@opencodegraph/provider-techstack": {
        "yaml": "</full/path/to/techstack.yml>"
    }
}
```

## Notes

- The Tech Stack File provider for [OpenCodeGraph](https://opencodegraph.org) currently provides annotations for `.js(x)` and `.ts(x)` files.

    ```typescript
    capabilities(params: CapabilitiesParams, settings: Settings): CapabilitiesResult {
        // TODO: support more languages
        return { selector: [{ path: '**/*.js?(x)' }, { path: '**/*.ts?(x)' }] }
    },
    ```

- Tech Stack File provider annotates packages detected in your project's `package.json` against CommonJS and ES Module import statements in your code.

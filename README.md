# use-state-array

`use-state-array` is a lightweight helper hook for React that wraps `useState` and gives you array-specific
helpers such as sorting, deduplication, equality checks, and resetting to the initial value. Provide your own
`compareTo` function once and you get a predictable set of utilities for any array-based state.

## Features

- **Custom ordering**: Pass a comparator and the hook keeps the array sorted (or not, you decide).
- **Idempotent inserts**: `addItem` replaces existing matches before inserting, preventing duplicates.
- **Safe removals**: `removeItem` removes one or multiple items in a single call.
- **Equality helpers**: `areEquals` and `areEqualsDeep` ensure quick comparisons in memoised components.
- **State recovery**: `resetArray` restores the original `initialState` snapshot at any time.
- **Deduplication**: `toSingleOccurrence` gives a copy of the array with unique items only.

## Installation

```bash
npm install use-state-array
# or
pnpm add use-state-array
```

This hook works with React 16.8+ (hooks support). No extra providers or setup required.

## Usage

The hook is exported as a named function. Import it in any React component and provide the comparator you want
to use:

```tsx
import { useStateArray } from "use-state-array";

type Donut = { id: string; flavor: string };

const initialDonuts: Donut[] = [
    { id: "1", flavor: "Chocolate Hazelnut" },
    { id: "2", flavor: "Raspberry Jelly" },
];

export function DonutList() {
    const {
        array: donuts,
        addItem,
        removeItem,
        areEqualsDeep,
        resetArray,
    } = useStateArray<Donut>(
        (a, b) => a.id.localeCompare(b.id),
        initialDonuts,
    );

    const addRandomDonut = () => {
        const flavors = [
            "Maple Bacon",
            "Lemon Poppy Seed",
            "Matcha Green Tea",
            "Cinnamon Sugar",
        ];
        const randomFlavor = flavors[Math.floor(Math.random() * flavors.length)];
        addItem({
            id: crypto.randomUUID(),
            flavor: randomFlavor,
        });
    };

    return (
        <div>
            <button onClick={addRandomDonut}>Add donut</button>
            <button onClick={resetArray} disabled={areEqualsDeep(initialDonuts)}>
                Reset
            </button>
            <ul>
                {donuts.map((donut) => (
                    <li key={donut.id}>
                        {donut.flavor}
                        <button onClick={() => removeItem(donut)}>Remove</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
```

Want to manage the array manually? Pass `keepSorted = false` to preserve insertion order:

```ts
const state = useStateArray(compareFn, [], false);
```

## API

```ts
const state = useStateArray<D>(
    compareTo: (a: D, b: D) => number,
    initialState?: D[],
    keepSorted = true,
);
```

- `compareTo` — Mandatory comparator used for sorting and equality checks.
- `initialState` — Optional starting array. Defaults to `[]`.
- `keepSorted` — When `true`, every mutation keeps the array sorted using `compareTo`.

### Returned helpers

- `array` — The current array state.
- `setArray(items: D[])` — Replaces the array with `items` (sorted if `keepSorted` is `true`).
- `addItem(item: D | D[])` — Upserts an item or list of items into the array.
- `removeItem(item: D | D[])` — Removes an item or list of items from the array.
- `areEquals(items: D[])` — Shallow equality using `compareTo`, ignoring order and duplicates.
- `areEqualsDeep(items: D[])` — Deep equality using `lodash.isequal`.
- `findInArray(item: D)` — Returns the first matching element or `null`.
- `toSingleOccurrence()` — Returns a copy containing only the first occurrence of each item.
- `resetArray()` — Restores the array to the provided `initialState`.

Refer to the in-source TSDoc comments (`src/index.ts`) for precise typing information.

## Release

The project ships through an automated GitHub Actions workflow:

1. Make sure `package.json` has the right version (use `npm version <patch|minor|major>`).
2. Push a matching git tag in the form `v1.2.3` to GitHub: `git push origin main --tags`.
3. The `Release` workflow runs `npm ci`, builds with `microbundle`, and publishes to npm.

Setup required on the repository:

- Add an `NPM_TOKEN` secret with publish rights to the package.
- Optional: trigger the workflow manually from the Actions tab (`Workflow Dispatch`) to re-run a release.

You can still release locally with `npm run release`, which builds and publishes using the same steps.

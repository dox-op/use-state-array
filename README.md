# use-state-array

`use-state-array` is a React state array wrapper that simplifies the management of complex arrays. By providing
a `compareTo` function during initialization, it offers various methods such as sorting, finding, upserting, and
removing elements.

## Features

- **Sorting**: Automatically sort the array.
- **Finding**: Easily locate elements using a comparison function.
- **Upserting**: Add or update elements effortlessly.
- **Removing**: Remove elements quickly and intuitively.

## Installation

Install the dependency using npm or yarn:

```bash
npm install use-state-array
# or
pnpm add use-state-array
```

## Usage

Here’s a basic usage example:

```typescript jsx
import useStateArray from 'use-state-array';

type Donut = {
    id: string;
    flavor: string;
}

function App() {
    const possibleDonutFlavors = ["Maple Bacon", "Chocolate Hazelnut", "Lemon Poppy Seed", "Raspberry Jelly", "Matcha Green Tea"];
    const {
        array: donuts,
        addItem: upsertDonuts,
        removeItem: removeDonuts
    } = useStateArray((a, b) => a.id.localeCompare(b.id), []);

    return (
        <div>
            <button onClick={() => addItem({
                id: String(Math.floor(Math.random() * 100)),
                label: possibleDonutFlavors[Math.floor(Math.random() * 100) % 5]
            })}>Add Item
            </button>
            <ul>
                {array.map(({id, flavor}) => (
                    <li key={id}>
                        {flavor}
                        <button onClick={() => removeDonuts({id})}>Remove item</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
```

## API

`useStateArray(compareTo, initialState, keepSorted)`

#### Parameters:

use-state-array respect TSDoc standards

#### Available methods:

use-state-array respect TSDoc standards


import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useStateArray } from "../src/index";

const numberComparator = (a: number, b: number) => a - b;

type Item = { id: string; value: { label: string } };

const objectComparator = (a: Item, b: Item) => a.id.localeCompare(b.id);

describe("useStateArray", () => {
    it("sorts when keepSorted is true but preserves order otherwise", () => {
        const sortedHook = renderHook(() =>
            useStateArray(numberComparator, [3, 1], true),
        );

        act(() => {
            sortedHook.result.current.setArray([3, 2, 1]);
        });

        expect(sortedHook.result.current.array).toEqual([1, 2, 3]);

        const unsortedHook = renderHook(() =>
            useStateArray(numberComparator, [5, 1, 4], false),
        );

        act(() => {
            unsortedHook.result.current.setArray([4, 2, 3, 1]);
        });

        expect(unsortedHook.result.current.array).toEqual([4, 2, 3, 1]);
    });

    it("adds items by replacing duplicates and keeps state in sync", () => {
        const { result } = renderHook(() =>
            useStateArray(numberComparator, [1, 3]),
        );

        let updated: number[] = [];
        act(() => {
            updated = result.current.addItem(2);
        });
        expect(updated).toEqual([1, 2, 3]);
        expect(result.current.array).toEqual([1, 2, 3]);

        act(() => {
            result.current.addItem([5, 4]);
        });

        expect(result.current.array).toEqual([1, 2, 3, 4, 5]);

        act(() => {
            result.current.addItem(3);
        });

        expect(result.current.array).toEqual([1, 2, 3, 4, 5]);
    });

    it("adds items without sorting when keepSorted is false", () => {
        const { result } = renderHook(() =>
            useStateArray(numberComparator, [3, 1], false),
        );

        let updated: number[] = [];
        act(() => {
            updated = result.current.addItem(2);
        });

        expect(updated).toEqual([3, 1, 2]);
        expect(result.current.array).toEqual([3, 1, 2]);

        act(() => {
            result.current.addItem([0, 4]);
        });

        expect(result.current.array).toEqual([3, 1, 2, 0, 4]);
    });

    it("removes items for both single values and batches", () => {
        const { result } = renderHook(() =>
            useStateArray(numberComparator, [1, 2, 3, 4]),
        );

        let removed: number[] = [];
        act(() => {
            removed = result.current.removeItem(2);
        });
        expect(removed).toEqual([1, 3, 4]);
        expect(result.current.array).toEqual([1, 3, 4]);

        act(() => {
            result.current.removeItem([1, 4]);
        });

        expect(result.current.array).toEqual([3]);

        const unsorted = renderHook(() =>
            useStateArray(numberComparator, [5, 2, 4, 3, 1], false),
        );

        act(() => {
            unsorted.result.current.removeItem([4, 2]);
        });

        expect(unsorted.result.current.array).toEqual([5, 3, 1]);
    });

    it("compares arrays with shallow and deep equality helpers", () => {
        const objectA: Item = { id: "1", value: { label: "Alpha" } };
        const objectB: Item = { id: "2", value: { label: "Beta" } };
        const objectC: Item = { id: "3", value: { label: "Gamma" } };

        const { result } = renderHook(() =>
            useStateArray(objectComparator, [objectA, objectB]),
        );

        expect(
            result.current.areEquals([
                { id: "2", value: { label: "Beta" } },
                { id: "1", value: { label: "Alpha" } },
            ]),
        ).toBe(true);

        expect(result.current.areEquals([objectA, objectC])).toBe(false);

        expect(
            result.current.areEqualsDeep([
                { id: "1", value: { label: "Alpha" } },
                { id: "2", value: { label: "Beta" } },
            ]),
        ).toBe(true);

        expect(
            result.current.areEqualsDeep([
                { id: "1", value: { label: "Alpha" } },
                { id: "2", value: { label: "Beta+" } },
            ]),
        ).toBe(false);
    });

    it("finds items by comparator and falls back to null", () => {
        const { result } = renderHook(() =>
            useStateArray(objectComparator, [
                { id: "a", value: { label: "A" } },
                { id: "b", value: { label: "B" } },
            ]),
        );

        expect(result.current.findInArray({ id: "b", value: { label: "" } })).toEqual({
            id: "b",
            value: { label: "B" },
        });

        expect(
            result.current.findInArray({ id: "c", value: { label: "C" } }),
        ).toBeNull();
    });

    it("deduplicates items without mutating the current state", () => {
        const { result } = renderHook(() =>
            useStateArray(numberComparator, [1, 2, 2, 3, 3, 3, 4]),
        );

        expect(result.current.toSingleOccurrence()).toEqual([1, 2, 3, 4]);
        expect(result.current.array).toEqual([1, 2, 2, 3, 3, 3, 4]);
    });

    it("defaults to an empty array when no initial state is provided", () => {
        const { result } = renderHook(() => useStateArray<number>(numberComparator));

        expect(result.current.array).toEqual([]);

        let restored: number[] = [1];
        act(() => {
            result.current.addItem([3, 1, 2]);
            restored = result.current.resetArray();
        });

        expect(restored).toEqual([]);
        expect(result.current.array).toEqual([]);
    });

    it("resets the array to the initial snapshot", () => {
        const objectA: Item = { id: "1", value: { label: "Alpha" } };
        const objectB: Item = { id: "2", value: { label: "Beta" } };
        const initial = [objectA, objectB] as const;

        const { result } = renderHook(() =>
            useStateArray(objectComparator, [...initial]),
        );

        expect(result.current.array).toEqual([...initial]);

        act(() => {
            result.current.addItem({ id: "3", value: { label: "Gamma" } });
        });

        expect(result.current.array).toHaveLength(3);

        let restored: Item[] = [];
        act(() => {
            restored = result.current.resetArray();
        });

        expect(restored).toEqual([...initial]);
        expect(result.current.array).toEqual([...initial]);
    });
});

import { useState } from "react";
import isEqual from "lodash.isequal";

/**
 * A custom React hook that manages an array with utility functions such as sorting,
 * deduplication, adding/removing elements, and deep comparison.
 *
 * @template D - The type of elements in the array.
 *
 * @param compareTo - A comparison function that defines sorting and equality between elements.
 * It should return:
 * - A negative number if `a` comes before `b`
 * - Zero if `a` and `b` are considered equal
 * - A positive number if `a` comes after `b`
 *
 * @param initialState - The initial value of the array. Defaults to an empty array.
 * @param keepSorted - Whether to automatically sort the array after each operation. Defaults to `true`.
 *
 * @returns An object with the array state and a set of utility methods.
 */
export function useStateArray<D = string>(
    compareTo: (a: D, b: D) => number,
    initialState: D[] | undefined = [],
    keepSorted = true,
) {
    const [backupArray] = useState<D[]>(initialState ?? []);
    const [array, setArrayInternal] = useState<D[]>(initialState);
    /**
     * Replaces the current array with the provided items, optionally sorting them first.
     *
     * @param items - The new set of items for the array state.
     */
    const setArray: (items: D[]) => void = (items: D[]) =>
        keepSorted
            ? setArrayInternal(items.sort(compareTo))
            : setArrayInternal(items);

    /**
     * Restores the array to the original `initialState` snapshot.
     *
     * @returns The restored array reference.
     */
    function resetArray() {
        setArray(backupArray);
        return backupArray;
    }

    /**
     * Removes every occurrence of `item` from the current array without mutating the state.
     *
     * @param item - A single item or list of items to remove.
     * @returns A new array with the provided items removed.
     *
     * @internal
     */
    function cleanArrayFromItem(item: D | D[]) {
        const items = Array.isArray(item) ? item : [item];
        const cleanedArray = array.filter(
            (existing) => !items.some((i) => compareTo(existing, i) === 0),
        );
        return keepSorted
            ? cleanedArray.sort((a, b) => compareTo(a, b))
            : cleanedArray;
    }

    /**
     * Inserts the provided item(s) into the array, removing previous occurrences first.
     *
     * @param item - A single item or list of items to upsert.
     * @returns The new array snapshot after the insert.
     */
    const addItem = (item: D | D[]): D[] => {
        const upsertedArray = [
            ...cleanArrayFromItem(item),
            ...(Array.isArray(item) ? item : [item]),
        ];
        setArray(keepSorted ? upsertedArray.sort(compareTo) : upsertedArray);
        return upsertedArray;
    };

    /**
     * Removes the provided item(s) from the array.
     *
     * @param item - A single item or list of items to remove.
     * @returns The new array snapshot after the removal.
     */
    const removeItem = (item: D | D[]) => {
        const upsertedArray = cleanArrayFromItem(item);
        setArray(upsertedArray);
        return upsertedArray;
    };

    /**
     * Performs a shallow equality check between the current array and `items` using `compareTo`.
     *
     * @param items - The items to compare against the current array.
     * @returns `true` when the arrays contain the same elements, disregarding order and duplicates.
     */
    const areEquals = (items: D[]) => {
        return cleanArrayFromItem(items).length === 0;
    };

    /**
     * Performs a deep equality check between the current array and `items`.
     *
     * @param items - The items to compare against the current array.
     * @returns `true` when both arrays contain strictly equal elements (deep comparison).
     */
    const areEqualsDeep = (items: D[]) => {
        return (
            array.length === items.length &&
            array.filter(
                (arrayItem) => !!items.find((item) => isEqual(arrayItem, item)),
            ).length === array.length &&
            items.filter(
                (item) => !!array.find((arrayItem) => isEqual(arrayItem, item)),
            ).length === items.length
        );
    };

    /**
     * Finds an element in the array that matches `item` according to `compareTo`.
     *
     * @param item - The element to search for.
     * @returns The matching element, or `null` when no match is found.
     */
    const findInArray = (item: D): D | null => {
        return array.find((arrayItem) => compareTo(item, arrayItem) === 0) ?? null;
    };

    /**
     * Returns a new array that contains only the first occurrence for each item.
     *
     * @returns A de-duplicated copy of the array.
     */
    const toSingleOccurrence = () => {
        return array.reduce<D[]>(
            (acc, item) =>
                acc.find((arrayItem) => compareTo(item, arrayItem) === 0)
                    ? acc
                    : acc.concat(item),
            [],
        );
    };

    return {
        array,
        addItem,
        removeItem,
        setArray,
        areEquals,
        areEqualsDeep,
        findInArray,
        toSingleOccurrence,
        resetArray,
    };
}

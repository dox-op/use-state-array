import {useState} from "react";
import isEqual from "lodash.isequal";

export function useStateArray<D = string>(
    compareTo: (a: D, b: D) => number,
    initialState: D[] | undefined = [],
    keepSorted = true
) {
    const [array, setArrayInternal] = useState<D[]>(initialState);
    const setArray = (items: D[]) => keepSorted ? setArray(items.sort(compareTo)) : setArray(items);

    function cleanArrayFromItem(item: D | D[]) {
        const items = Array.isArray(item) ? item : [item];
        const cleanedArray = array.filter(
            (existing) => !items.some((i) => compareTo(existing, i) === 0)
        );
        return keepSorted ? cleanedArray.sort((a, b) => compareTo(a, b)) : cleanedArray;
    }

    const addItem = (item: D | D[]) => {
        const upsertedArray = [
            ...cleanArrayFromItem(item),
            ...(Array.isArray(item) ? item : [item])
        ];
        setArray(keepSorted ? upsertedArray.sort(compareTo) : upsertedArray);
    };

    const removeItem = (item: D | D[]) => {
        setArray(cleanArrayFromItem(item));
    };

    const areEquals = (items: D[]) => {
        return cleanArrayFromItem(items).length === 0;
    };

    const areEqualsDeep = (items: D[]) => {
        return (
            array.length === items.length &&
            array.filter(
                (arrayItem) => !!items.find((item) => isEqual(arrayItem, item))
            ).length === array.length &&
            items.filter(
                (item) => !!array.find((arrayItem) => isEqual(arrayItem, item))
            ).length === items.length
        );
    };

    return {
        array,
        addItem,
        removeItem,
        setArray,
        areEquals,
        areEqualsDeep
    };
}

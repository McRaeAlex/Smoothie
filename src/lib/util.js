
/**
 * TwoWayMap is a utility for mapping two types to eachother when both a and b 
 * are sets of the same cardinal (size).
 * Just remeber which a is and which b is
 */
export class TwoWayMap {

    constructor() {
        this.map1 = new Map();
        this.map2 = new Map();
    }

    set(a, b) {
        this.map1.set(a, b)
        this.map2.set(b, a)
    } 

    get(a) {
        return this.map1.get(a)
    }

    getRev(b)  {
        return this.map2.get(b)
    }
}

export function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }

    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }

    return true;
}
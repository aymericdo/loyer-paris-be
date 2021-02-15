export const groupBy = (xs, key) => {
    return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x)
        return rv
    }, {})
}

export const min = <T>(a: T[], f: string): T => a.reduce((m, x) => m[f] < x[f] ? m : x);
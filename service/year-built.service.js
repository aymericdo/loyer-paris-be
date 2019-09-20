function getYearRange(rangeRents, yearBuilt) {
    if (!yearBuilt) {
        return null
    }
    const firstRangeRent = rangeRents.find((rangeRent) => {
        const yearBuiltRange = rangeRent.fields.epoque
            .split(/[\s-]+/)
            .map(year => isNaN(year) ? year.toLowerCase() : +year)

        return (typeof yearBuiltRange[0] === 'number') ?
            yearBuiltRange[0] < yearBuilt && yearBuiltRange[1] > yearBuilt
            : (yearBuiltRange[0] === 'avant') ?
                yearBuilt < yearBuiltRange[1]
                : (yearBuiltRange[0] === 'apres') ?
                    yearBuilt > yearBuiltRange[1]
                    :
                    false
    })

    return firstRangeRent ? firstRangeRent.fields.epoque : null
}

module.exports = {
    getYearRange,
};

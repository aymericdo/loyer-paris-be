module.exports = function (string) {
    return string && string.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

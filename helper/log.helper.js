module.exports = function (message) {
    const date = new Date()
    console.log(`[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}] ${message}`)
}

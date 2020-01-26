const NodeCache = require('node-cache')
const ipCache = new NodeCache({ checkperiod: 15, deleteOnExpire: true })

function getIp(req) {
    return req.header('x-forwarded-for') || req.connection.remoteAddress
}

function isIpCached(requestIp) {
    return ipCache.has(requestIp)
}

function saveIp(ip) {
    return ipCache.set(ip, true)
}

module.exports = {
    getIp,
    isIpCached,
    saveIp,
}

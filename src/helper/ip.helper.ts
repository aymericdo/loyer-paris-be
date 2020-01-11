import NodeCache from 'node-cache'
const ipCache = new NodeCache({ checkperiod: 15, deleteOnExpire: true })

export function getIp(req) {
    return req.header('x-forwarded-for') || req.connection.remoteAddress
}

export function isIpCached(requestIp) {
    return ipCache.has(requestIp)
}

export function saveIp(ip) {
    return ipCache.set(ip, true)
}

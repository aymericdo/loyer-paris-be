function getIp(req) {
    return req.header('x-forwarded-for') || req.connection.remoteAddress;
}

function isIpCached(requestIp) {
    var isCached = ipCache.has(requestIp);
    if (isCached) {
        log.info('Load cachedIp')
    } else {
        log.info('Save ip')
        success = ipCache.set(requestIp, true);
    }
}

module.exports = {
    getIp,
    isIpCached,
}

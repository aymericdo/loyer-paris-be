const opencage = require('opencage-api-client');

function getCoordinate(address) {
    return opencage.geocode({ q: address }).then(data => {
        if (data.status.code == 200) {
            if (data.results.length > 0) {
                const place = data.results[0]
                return place
            }
        } else if (data.status.code == 402) {
            console.log('hit free-trial daily limit')
            console.log('become a customer: https://opencagedata.com/pricing')
        } else {
            // other possible response codes:
            // https://opencagedata.com/api#codes
            console.log('error', data.status.message)
        }
    }).catch(error => {
        console.log('error', error.message)
    });
}

module.exports = {
    getCoordinate,
};

function commonOpts(title) {
    return {
        "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
        "title": {
            "text": title,
            "color": "#fdcd56",
            "fontSize": 22,
            "fontFamily": "Garnett"
        },
        "width": 700,
        "height": 500,
        "padding": 5,
        "background": "#222222",
        "color": "white",
        "config": {
            "view": {
                "stroke": "transparent"
            },
            "legend": {
                "labelColor": "white",
                "labelFontSize": 12,
                "titleColor": "white",
                "titleFontSize": 16
            }
        }
    }
}

module.exports = {
    commonOpts,
}

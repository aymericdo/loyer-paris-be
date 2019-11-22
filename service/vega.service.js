function commonOpts() {
    return {
        $schema: "https://vega.github.io/schema/vega-lite/v4.json",
        width: 700,
        height: 500,
        padding: 26,
        autosize: { type: "fit", contains: "padding" },
        background: "#222222",
        config: {
            view: {
                stroke: "transparent"
            },
            legend: {
                labelColor: "white",
                labelFontSize: 12,
                titleColor: "white",
                titleFontSize: 16
            }
        }
    }
}

module.exports = {
    commonOpts,
}

let d3 = require("d3");

let setupVisualsGoogleAnalytics = require('./analytics.js').setupVisualsGoogleAnalytics;
let trackEvent = require('./analytics.js').trackEvent;
let pym = require('pym.js');
let pymChild = null;

import makeCartogram from "./cartogram";
import makeMultiples from "./multiples";
import xyScales from "./xyScales";

document.addEventListener("DOMContentLoaded", main());

function main() {
    var pymChild = new pym.Child();
}


class polarChart {

    constructor() {


        this.index = 0;
        this.viewTypes = ["lines", "map", "multiples"];
        this.currView = "lines";
        this.viewSettings = {
            lines: {
                xDomain: [2002, 2017],
                yDomain: [-2.5, 2.5],
                text : "State legislators have moved to both the left and right."
            },
            map: {
                xDomain: [2002, 2017],
                yDomain: [-2.5, 2.5],
                text : "The polarization is more pronounced in certain states."
            },
            multiples: {
            	text : "Republicans have gained control of most statehouses in the last 16 years."
            }
        };

        this._getData();

    }


    _getData() {


        let queue = d3.queue();
        queue.defer(d3.tsv, "data/longformStateLegPolarity.tsv");
        queue.defer(d3.csv, "data/party-control-by-year.csv");

        queue.await((error, polarity, control) => {

            this.polarityData = polarity;
            this.controlData = control;

            this._setNav();
            this.update();
        })



    }

    update() {
        this.setScales();
        this.draw();
        this.updateLines();
        //this.drawMultiples();
    }

    setScales() {
        this.carto = new makeCartogram({
            element: document.querySelector(`.chart.lines`),
            onReady: function() {
                 
            }
        });

        //Set Line View properties
        this.viewSettings["lines"].scales = new xyScales({
            xDomain: this.viewSettings.lines.xDomain,
            yDomain: this.viewSettings.lines.yDomain,
            width: this.carto.width,
            height: this.carto.height,
            margin: {
            	left : 0,
            	top: 0,
            	right: 0,
            	bottom: 0
            }
        });

        this.viewSettings["lines"].data = this.polarityData.filter(d => {
            return d.State && d.State !== "dc" && d.State !== "us";
            //return d.State;
        });

        //Set Map View properties
        this.viewSettings["map"].scales = new xyScales({
            xDomain: this.viewSettings.map.xDomain,
            yDomain: this.viewSettings.map.yDomain,
            width: this.carto.wh,
            height: this.carto.wh
        });

        this.viewSettings["map"].data = this.polarityData.filter(d => {
            return d.State && d.State !== "dc" && d.State !== "us";
        });
    }


    _setNav() {
        let _this = this;

 //        d3.selectAll('.nav-increment').on('click', function() {
	// 	stopAutoplay()
	// 	graphic.bindInteraction()
	// 	navigate[this.dataset.direction](graphic)
	// })


        d3.selectAll(".nav-increment").on("click", function() {
            let val = +d3.select(this).attr("val");

            _this.index += val;

            if (_this.index < 0) {
                _this.index = _this.viewTypes.length - 1;
            } else if (_this.index > _this.viewTypes.length - 1) {
                _this.index = 0;
            }

            d3.select(".navigation .current-index").text(_this.index+1);

            _this.currView = _this.viewTypes[_this.index];

            if (_this.currView === "lines" || _this.currView === "map") {
                d3.selectAll(".chart.lines").classed("active", true);
                d3.selectAll(".chart.multiples").classed("active", false);
                _this.updateLines();
            } else {
                d3.selectAll(".chart.lines").classed("active", false);
                d3.selectAll(".chart.multiples").classed("active", true);
                _this.drawMultiples();
            }

            d3.select("h2.head").text(_this.viewSettings[_this.currView].text);

        });


        d3.select("h2.head").text(this.viewSettings[this.currView].text);
    }

    drawAxis() {

    	let xScale = this.viewSettings["lines"].scales.xScale;
    	let yScale = this.viewSettings["lines"].scales.yScale;

    	this.axis = this.carto.plot.append("g")
    		.attr("class", "axis-g");

    	let plot = this.axis.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", "translate(0," +this.carto.height + ")")
            .call(d3.axisBottom(xScale).tickFormat(d=> {
                return String(d) === "2002" ? String(d) : `'${String(d).substring(2,4)}`;
            }));

        this.centerline = this.axis.append("line")
        	.attr("class", "centerline")
        	.attr("x1", 0)
        	.attr("y1", yScale(0))
        	.attr("x2", this.carto.width)
        	.attr("y2", yScale(0));

        this.labels = this.axis.append("g")
            .classed("labels", true)
            .attr("transform", `translate(${-15},${yScale(0)})`);

        this.labels.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0)
            .attr("x", 15)
            .attr("dy", "0.71em")
            .attr("text-anchor", "start")
            .text("More conservative →");

        this.labels.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0)
            .attr("x", -15)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("← More liberal");
    }


    draw() {

        let _this = this;
 
        this.linesGroup = this.carto.plot.append("g")
            .attr("class", "lines-g");

        this.linesGroup.selectAll("rect")
            .data(this.viewSettings[this.currView].data, d => {
                return d["State"];
            }).enter()
            .append("rect")
            .attr("class", d => {
                let p = d["Con Cat"].split("-")[1];
                return `bar ${p}`;
            })
            .attr("x", d => {
                let offset = this.currView === "lines" ? 0 : this.currView === "map" ? this.carto.statesOffset[d["State"]].left : 0;
                return this.viewSettings[this.currView].scales.xScale(+d["Year"]) + offset;
            })
            .attr("y", d => {
                let offset = this.currView === "lines" ? 0 : this.currView === "map" ? this.carto.statesOffset[d["State"]].top : 0;
                return this.viewSettings[this.currView].scales.yScale(+d["Avg Ideology"]) + offset;
            })
            .attr("width", this.viewSettings[this.currView].scales.xScale.bandwidth())
            .attr("height", 2)
            .style("opacity", d => {
                return this.currView === "map" ? 1 : .1;
            });


        this.drawAxis();
    }


    updateLines() {

        if (this.currView !== "map") {
            this.carto.plot.select(".states-g").classed("active", false);
        }

        var t = d3.transition()
            .duration(750)
            .on("end", d => {
                this.carto.plot.select(".states-g").classed("active", this.currView === "map");
            });

        this.linesGroup.attr("class", d => {
            return `lines-g ${this.currView}`;
        });

        this.axis.classed("active", this.currView === "lines");

        this.linesGroup.selectAll("rect")
            .transition(t)
            .attr("x", d => {
                let offset = this.currView === "lines" ? 0 : this.currView === "map" ? this.carto.statesOffset[d["State"]].left : 0;
                return this.viewSettings[this.currView].scales.xScale(+d["Year"]) + offset;
            })
            .attr("y", d => {
                let offset = this.currView === "lines" ? 0 : this.currView === "map" ? this.carto.statesOffset[d["State"]].top : 0;
                return this.viewSettings[this.currView].scales.yScale(+d["Avg Ideology"]) + offset;
            })
            .attr("width", this.viewSettings[this.currView].scales.xScale.bandwidth())
            .style("opacity", d => {
                return this.currView === "map" ? 1 : .1;
            });

    }

    drawMultiples() {

        let _this = this;

        this.multiples = new makeMultiples({
            element: document.querySelector(`.chart.multiples`),
            domain: [2002, 2017],
            data: _this.controlData,
            onReady: function() {
                console.log("ready");
            }
        });



    }
}






let makeChart = new polarChart();



d3.select(window).on("resize", d => {
    makeChart.update();
});
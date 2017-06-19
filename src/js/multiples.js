let d3 = require("d3");

import makeCartogram from "./cartogram";

class makeMultiples {

    constructor(opts) {

        this.element = opts.element;
        this.aspectHeight = opts.aspectHeight ? opts.aspectHeight : .68;
        this.onReady = opts.onReady;
        this.domain = opts.domain;

        this.data = opts.data;

        this._setData();
        this.update();
        this.onReady(); //Callback for whatever. 

    }


    _setDimensions() {
        // define width, height and margin
        this.margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        };

        this.width = this.element.offsetWidth - this.margin.left - this.margin.right;
        this.height = (this.element.offsetWidth * this.aspectHeight) - this.margin.top - this.margin.bottom; //Determine desired height here

    }

    // Abbrev : "me" 
    // Leg Majority : "d" 
    // State : "Maine" 
    // Year : "2014"

    _setData() {
        this.lookup = {};

        this.data.forEach(d=> {
            if (!this.lookup[`yr${d["Year"]}`]) {
                this.lookup[`yr${d["Year"]}`] = {};
            }

            this.lookup[`yr${d["Year"]}`][d["Abbrev"]] = d;

        });

        console.log(this.lookup);

    }

    update() {
        this._setDimensions();
        this.draw();
    }

    draw() {

        console.log(this.data);

        // set up parent element and SVG
        this.element.innerHTML = "";
        this.maps = {};

        let years = [];
        let cartos = {};

        let w = this.width/4;
        let h = w*this.aspectHeight;


        for (let yr = this.domain[0]; yr <= this.domain[1]; yr++) {
            years.push(yr);
        }

        let yearDivs = d3.select(this.element).selectAll(".year")
            .data(years).enter().append("div")
            .attr("class", d=> {
                return `year yr${d}`;
            });
            
        yearDivs.append("div")
            .attr("class", "plot")
            .style("width", `${w}px`)
            .style("height", `${h}px`);

        yearDivs.append("div")
            .attr("class", "year-lbl")
            .text(d=> {
                return d;
            });


        years.forEach(yr=> {
            this.maps[`yr${yr}`] = new makeCartogram({
                element: document.querySelector(`.year.yr${yr} .plot`)
            });



            this.maps[`yr${yr}`].stateSwatch
                .each(d=> {
                    d.yr = yr;
                })
                .attr("class", d=> {
                    let p = this.lookup[`yr${yr}`][d.st]["Leg Majority"];
                    return `state-bkgd ${p}`;
                });


        });




    }


}








export default makeMultiples;
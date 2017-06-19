let d3 = require("d3");

class makeCartogram {

    constructor(opts) {

        this.element = opts.element;
        this.aspectHeight = opts.aspectHeight ? opts.aspectHeight : .68;
        this.onReady = opts.onReady ? opts.onReady : null;

        this.update(); 

        if (this.onReady) {
            this.onReady(); //Callback for whatever. 
        }
        
    }


    _setDimensions() {
        // define width, height and margin

        this.margin = {
            top: 0,
            right: 15,
            bottom: 30,
            left: 15
        };

        this.width = this.element.offsetWidth - this.margin.left - this.margin.right;
        this.height = (this.element.offsetWidth * this.aspectHeight) - this.margin.top - this.margin.bottom; //Determine desired height here

    }

    update() {
        this._setDimensions();
        this.draw();
    }

    draw() {

        var gridArr = [];

        //Cartogram lives on a 12 x 8 grid (12 * 8 = 96)
        //`gridArr` holds the cell number (rows and columns)
        //Create an array of 96 objects, one for each cell.
        //If cell number has a match in the stateGridLookup, store in the `st` property.
        //Otherwise leave it null.

        var row = -1;
        for (var i = 0; i < 96; i++) {
            let column = i % 12;
            row = column == 0 ? row + 1 : row;

            gridArr.push({
                "row": row,
                "column": column,
                "st": stateGridLookup[`${row}-${column}`] ? stateGridLookup[`${row}-${column}`] : null
            });

        }

        this.statesOffset = {};

        this.wh = this.width / 12; //Width and height is equal to 1/12th of the the container width.

        // set up parent element and SVG
        this.element.innerHTML = "";

        this.svg = d3.select(this.element).append('svg');

        //Set svg dimensions
        this.svg.attr('width', this.width + this.margin.left + this.margin.right);
        this.svg.attr('height', this.height + this.margin.top + this.margin.bottom);

        // create the chart group.
        this.plot = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`)
            .attr("class", "chart-g");

        this.states = this.plot.append("g")
            .attr("class", "states-g")
            .selectAll(".state")
            .data(gridArr.filter(d => {
                return d.st; //Only draw cells with a `st` property.
            }))
            .enter().append("g")
            .attr("class", d => {
                return `state ${d.st}`;
            })
            .attr("transform", d => {
                let left = d.column * this.wh;
                let top = d.row * this.wh;

                this.statesOffset[d.st] = {top: top, left: left};

                return `translate(${left},${top})`;
            });

        this.stateSwatch = this.states.append("rect")
            .attr("class", "state-bkgd")
            .attr("width", this.wh)
            .attr("height", this.wh);

        this.states.append("text")
            .attr("x", this.wh / 2)
            .attr("y", this.wh - 6)
            .attr("text-anchor", "middle")
            .text(d => {
                return d.st; //State label
            });
    }


}


var stateGridLookup = {
    "7-1": "ak",
    "6-7": "al",
    "5-5": "ar",
    "5-2": "az",
    "4-1": "ca",
    "4-3": "co",
    "3-10": "ct",
    "4-10": "de",
    "7-9": "fl",
    "6-8": "ga",
    "7-0": "hi",
    "3-5": "ia",
    "2-2": "id",
    "2-6": "il",
    "3-6": "in",
    "5-4": "ks",
    "4-6": "ky",
    "6-5": "la",
    "2-10": "ma",
    "4-9": "md",
    "0-11": "me",
    "2-7": "mi",
    "2-5": "mn",
    "4-5": "mo",
    "6-6": "ms",
    "2-3": "mt",
    "5-7": "nc",
    "2-4": "nd",
    "4-4": "ne",
    "1-11": "nh",
    "3-9": "nj",
    "5-3": "nm",
    "3-2": "nv",
    "2-9": "ny",
    "3-7": "oh",
    "6-4": "ok",
    "3-1": "or",
    "3-8": "pa",
    "3-11": "ri",
    "5-8": "sc",
    "3-4": "sd",
    "5-6": "tn",
    "7-4": "tx",
    "4-2": "ut",
    "4-8": "va",
    "1-10": "vt",
    "2-1": "wa",
    "1-6": "wi",
    "4-7": "wv",
    "3-3": "wy"
};



export default makeCartogram;
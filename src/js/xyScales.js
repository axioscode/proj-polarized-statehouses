let d3 = require("d3");

class xyScales {

    constructor(opts) {
        this.width = opts.width;
        this.height = opts.height;
        this.xDomain = opts.xDomain;
        this.yDomain = opts.yDomain;

        this.margin = opts.margin ? opts.margin : null;

        console.log(opts.margin);

        this.update();

    }

    _setDimensions() {
        // define width, height and margin

        if (!this.margin) {
            this.margin = {
                top: 0,
                right: 0,
                bottom: 10,
                left: 0
            };
        }


        //this.width = this.element.offsetWidth - this.margin.left - this.margin.right;
        //this.height = (this.element.offsetWidth * this.aspectHeight) - this.margin.top - this.margin.bottom; //Determine desired height here

        this.width = this.width - this.margin.left - this.margin.right;
        this.height = this.height - this.margin.top - this.margin.bottom;

    }


    update() {
        this._setDimensions();
        this._setScales();
        //this.draw();
    }


    _setScales() {

        let xDomain = [];
        for (let yr = this.xDomain[0]; yr <= this.xDomain[1]; yr++) {
            xDomain.push(yr);
        }

        this.xScale = d3.scaleBand()
            .rangeRound([0, this.width])
            .padding(0.1)
            .domain(xDomain);

        this.yScale = d3.scaleLinear()
            .rangeRound([this.height, 0])
            .domain(this.yDomain);

    }



    draw() {

        this.element.innerHTML = "";

        // create the chart group.
        this.plot = this.element.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`)
            .attr("class", "chart-g");


        this.plot.append("g")
            .attr("transform", "translate(0," + this.height / 2 + ")")
            .call(d3.axisBottom(this.xScale));



        //this.drawBars();

    }

    // drawBars() {

    //     console.log(this.data);

    //     const bars = this.plot.selectAll(".bar")
    //         .data(this.data)
    //         .enter().append("rect")
    //         .attr("class", d => {
    //             let p = d["Con Cat"].split("-")[1];
    //             return `bar ${p}`;
    //         })
    //         .attr("x", d => {
    //             let yr = +d["Year"]
    //             return this.xScale(yr);
    //         })
    //         .attr("y", d => {
    //             let score = +d["Avg Ideology"]
    //             return this.yScale(score);
    //         })
    //         .attr("width", this.xScale.bandwidth())
    //         .attr("height", 1.5);

    // }

}



export default xyScales;
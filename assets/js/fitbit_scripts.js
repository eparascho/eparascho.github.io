function responsivefy(svg){
  const container = d3.select(svg.node().parentNode),
        width = parseInt(svg.style('width'), 10),
        height = parseInt(svg.style('height'), 10),
        aspect = width / height;
 
  svg.attr('viewBox', `0 0 ${width} ${height}`)
     .attr('preserveAspectRatio', 'xMinYMid')
     .call(resize);

  d3.select(window).on('resize.' + container.attr('id'),  resize);
 
  function resize() {
    const w = parseInt(container.style('width'));
    svg.attr('width', w);
    svg.attr('height', Math.round(w / aspect));
  }
}

function heatmap(){
  // dimensions & margins
  const margin = {top: 30, right: 20, bottom: 30, left: 60}, 
  width = 680 - margin.left - margin.right, 
  height = 500 - margin.top - margin.bottom;
  
  // svg object
  const svg = d3.select("#heatmap").append("svg").attr("width", width + margin.left + margin.right)
                                                 .attr("height", height + margin.top + margin.bottom)
                                                 .call(responsivefy)
                                                 .append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  
  // labels
  const row = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]
  const col = ["November", "December", "January", "February", "March", "April", "May", "June", "July"]
  
  // build x
  const x = d3.scaleBand().range([ 0, width ]).domain(row).padding(0.01);
  svg.append("g").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(x))
  
  // build y
  const y = d3.scaleBand().range([ height, 0 ]).domain(col).padding(0.01);
  svg.append("g").call(d3.axisLeft(y));
  
  //color
  const myColor = d3.scaleLinear().range([d3.interpolateRdBu(0.1), d3.interpolateRdBu(0.8)]).domain([60,90])
  
  // read data
  d3.csv("https://raw.githubusercontent.com/eparascho/ThesisFiles/main/stress_scores.csv").then(function(data){
    // tooltip
    const tooltip = d3.select("#heatmap").append("div").style("opacity", 0).attr("class", "tooltip").style("background-color", "white")
                      .style("border", "solid").style("border-width", "2px").style("border-radius", "5px").style("padding", "5px")
    // tooltip after hover
    const mouseover = function(event,d) {
      tooltip.style("opacity", 1)
      d3.select(this).attr('opacity', 0.6)
    }
    // tooltip after move leave a cell
    const mousemove = function(event,d) {
      tooltip.html("Daily stress: " + d.stress).style("left", (event.x)/2 + "px").style("top", (event.y)/2 + "px")
    }
    // tooltip after leave
    const mouseleave = function(d) {
      tooltip.style("opacity", 0)
      d3.select(this).attr('opacity', 1)
    }
  
    // squares
    svg.selectAll().data(data, function(d) {return d.day+':'+d.month;}).enter().append("rect").attr("x", function(d){return x(d.day)})
                    .attr("y", function(d) { return y(d.month) }).attr("width", x.bandwidth()).attr("height", y.bandwidth())
                    .style("fill", function(d) { return myColor(d.stress)}).on("mouseover", mouseover).on("mousemove", mousemove)
                    .on("mouseleave", mouseleave)
  })
}

function barchart(){
  // dimensions and margins
  const margin = {top: 20, right: 25, bottom: 30, left: 40},
  width = 650 - margin.left - margin.right,
  height = 490 - margin.top - margin.bottom;

  // svg object
  const svg = d3.select("#barchart").append("svg").attr("width", width + margin.left + margin.right)
                                                 .attr("height", height + margin.top + margin.bottom)
                                                 .call(responsivefy)
                                                 .append("g").attr("transform",`translate(${margin.left}, ${margin.top})`);
              
  // read data
  d3.csv("https://raw.githubusercontent.com/eparascho/ThesisFiles/main/all_users_mean.csv").then(function(data) {
    // x axis
    const x = d3.scaleBand().domain(data.map(d=>d.user)).range([0, width]).padding(0.2);
    svg.append("g").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(x))
  
    // y axis
    const y = d3.scaleLinear().range([height, 0]).domain([60, 90]);
    svg.append("g").call(d3.axisLeft(y));

    // tooltip
    var tooltip = d3.select("#barchart").append("div").style("opacity", 0).attr("class", "tooltip").style("background-color", "white")
              .style("border", "solid").style("border-width", "2px").style("border-radius", "5px").style("padding", "5px")
    // tooltip after hover
    var mouseover = function(event,d) {
      tooltip.style("opacity", 1)
      d3.select(this).attr('opacity', 0.5)
    }
    // tooltip after move
    var mousemove = function(event,d) {
      tooltip.html("Mean Stress: " + d.meanstress).style("left", (event.x)/4 + "px").style("top", (event.y)/2 + "px")
    }
    // tooltip after leave
    var mouseleave = function(d) {
      tooltip.style("opacity", 0)
      d3.select(this).attr('opacity', 1)
    }

    // append bar rectangles
    svg.selectAll().data(data).join("rect").attr("x", d => x(d.user))
       .attr("y", d => y(d.meanstress)).attr("width", x.bandwidth()).attr("height", d => height - y(d.meanstress))
       .style("fill", function(d){ return d.user == 36 ? "#fab400" : "#0082aa"})
       .on("mouseover", mouseover ).on("mousemove", mousemove ).on("mouseleave", mouseleave );

    // labels
    svg.append("text").attr("text-anchor", "middle").attr("x", 45).attr("y",10).text("User");
    svg.append("text").attr("text-anchor", "end").attr("y", 20).attr("dy", ".1em").attr("transform", "rotate(-90)")
       .text("Mean Stress Score");
  });
}

function bubbles(){
  // dimensions and margins
  const margin = {top: 25, right: 25, bottom: 30, left: 40},
  width = 800 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

  // svg object
  const svg = d3.select("#bubbles").append("svg").attr("width", width + margin.left + margin.right)
                                                 .attr("height", height + margin.top + margin.bottom)
                                                 .call(responsivefy);
  
  // data
  d3.csv("https://raw.githubusercontent.com/eparascho/ThesisFiles/main/categories-features.csv").then( function(data) {
  
    // color
    const color = d3.scaleOrdinal()
      .domain(["Activity", "Sleep", "Stress", "Health", "Date","Demographics","Disposal"])
      .range(d3.schemeTableau10);
    // size
    const size = d3.scaleLinear().domain([0, 100]).range([20,60])
  
    // tooltip
    const tooltip = d3.select("#bubbles").append("div").style("opacity", 0).attr("class", "tooltip").style("background-color", "white")
      .style("border", "solid").style("border-width", "2px").style("border-radius", "5px").style("padding", "5px")
    // tooltip after hover
    const mouseover = function(event, d) {
      tooltip.style("opacity", 1)
      d3.select(this).attr('opacity', 0.6)
    }
    // tooltip after move
    const mousemove = function(event, d) {
      tooltip.html(d.feature+' : '+d.value+"%").style("left", (event.x/2+20) + "px").style("top",event.y/2 + "px")
    }
    // tooltip after leave
    var mouseleave = function(event, d) {
      tooltip.style("opacity", 0)
      d3.select(this).attr('opacity', 1)
    }
  
    // append circles
    var node = svg.append("g").selectAll("circle").data(data).join("circle").attr("class", "node")
                  .attr("r", d => size(d.value)).attr("cx", width / 2).attr("cy", height / 2).style("fill", d => color(d.category))
                  .style("fill-opacity", 0.8).attr("stroke", "black").style("stroke-width", 1).on("mouseover", mouseover)
                  .on("mousemove", mousemove).on("mouseleave", mouseleave)
  
    // forces
    const simulation = d3.forceSimulation()
      .force("center", d3.forceCenter().x(width / 2).y(height / 2))
      .force("collide", d3.forceCollide().strength(.2).radius(function(d){ return (size(d.value)+3) }).iterations(1))
    simulation.nodes(data).on("tick", function(d){node.attr("cx", d => d.x).attr("cy", d => d.y)});

    // legend scheme - dots
    const sizedot = 20
    const allgroups = ["Activity", "Sleep", "Stress", "Health", "Date","Demographics","Disposal"]
    svg.selectAll("myrect").data(allgroups).join("circle").attr("cx", 630).attr("cy", (d,i) => 120 + i*(sizedot+5)).attr("r", 7)
       .style("fill", d => color(d))
    // legend scheme - labels
    svg.selectAll("mylabels").data(allgroups).enter().append("text").attr("x", 630 + sizedot*.8)
       .attr("y", (d,i) =>  110 + i * (sizedot + 5) + (sizedot/2)).style("fill", d => color(d)).text(d => d).attr("text-anchor", "left")
       .style("alignment-baseline", "middle")
  })
}

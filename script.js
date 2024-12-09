// Set up the dimensions and margins
const margin = {top: 40, right: 40, bottom: 60, left: 60};
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create the SVG
const svg = d3.select("#plot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Define the function to plot
function f(x) {
    return 1 - (100 / (x * 100 + 100));
}

const maxGraphYValue = 20;

// Generate data points
const data = Array.from({length: maxGraphYValue * 10 + 1}, (_, i) => {
    const x = i / 10;
    return {x, y: f(x)};
});

// X scale
const x = d3.scaleLinear()
    .domain([0, maxGraphYValue])
    .range([0, width]);

// Y scale
const y = d3.scaleLinear()
    .domain([d3.min(data, d => d.y), d3.max(data, d => d.y)])
    .range([height, 0]);

// Create line generator
const line = d3.line()
    .x(d => x(d.x))
    .y(d => y(d.y));

// Add X axis with percentage formatting
svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x)
        .tickFormat(d => `${d * 100}%`)
        .tickSizeOuter(0)
    );

// Add Y axis with percentage formatting
svg.append("g")
    .call(d3.axisLeft(y)
        .tickFormat(d => `${(d * 100).toFixed(0)}%`)
        .tickSizeOuter(0)
    );

// Add X axis label
const xLabel = svg.append("text")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .text("Efficiency (%)");

// Add Y axis label
const yLabel = svg.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("y", -40)
    .attr("x", -height / 2)
    .text("Reduction (%)");

// Add title
svg.append("text")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", -20)
    .style("font-weight", "bold")
    .text("Reduction Function");

// Add the main line
const path = svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line);

// Target horizontal line
const horizontalReductionTargetLine = svg.append("line")
    .attr("stroke", "green")
    .attr("stroke-dasharray", "5,5")
    .attr("opacity", 0);

const verticalReductionTargetLine = svg.append("line")
    .attr("stroke", "green")
    .attr("stroke-dasharray", "5,5")
    .attr("opacity", 0);

// Vertical line for current value
const verticalEfficiencyTargetLine = svg.append("line")
    .attr("stroke", "red")
    .attr("stroke-dasharray", "5,5")
    .attr("opacity", 0);

// Vertical line for current value
const horizontalEfficiencyTargetLine = svg.append("line")
    .attr("stroke", "red")
    .attr("stroke-dasharray", "5,5")
    .attr("opacity", 0);

// Intersection points
const efficiencyIntersectionDot = svg.append("circle")
    .attr("r", 6)
    .attr("fill", "red")
    .style("opacity", 0);

const reductionIntersectionDot = svg.append("circle")
    .attr("r", 6)
    .attr("fill", "green")
    .style("opacity", 0);

// Input handling
const efficiencyInput = document.getElementById('efficiencyInput');
const reductionInput = document.getElementById('reductionInput');
const efficiencyConversionDisplay = document.getElementById('efficiencyOutput');
const reductionConversionDisplay = document.getElementById('reductionOutput');

function updateEfficiencyChart() {
    const efficiencyInputValue = parseFloat(efficiencyInput.value) / 100;

    // Clear previous display
    efficiencyConversionDisplay.textContent = '';
    verticalEfficiencyTargetLine.attr("opacity", 0);
    horizontalEfficiencyTargetLine.attr("opacity", 0);
    efficiencyIntersectionDot.style("opacity", 0);

    // Handle efficiency input
    if (efficiencyInputValue >= 0 && efficiencyInputValue <= 20) {
        const yValue = f(efficiencyInputValue);

        // Update vertical line
        verticalEfficiencyTargetLine
            .attr("x1", x(efficiencyInputValue))
            .attr("y1", height)
            .attr("x2", x(efficiencyInputValue))
            .attr("y2", y(yValue))
            .attr("opacity", 1);

        // Update horizontal line
        horizontalEfficiencyTargetLine
            .attr("x1", x(0))
            .attr("y1", y(yValue))
            .attr("x2", x(efficiencyInputValue))
            .attr("y2", y(yValue))
            .attr("opacity", 1);

        // Update intersection dot
        efficiencyIntersectionDot
            .attr("cx", x(efficiencyInputValue))
            .attr("cy", y(yValue))
            .style("opacity", 1);

        // Update current value display
        efficiencyConversionDisplay.textContent += `Reduction: ${(yValue * 100).toFixed(2)}%`;
    }
}

function updateReductionChart() {
    const reductionInputValue = parseFloat(reductionInput.value) / 100;

    // Clear previous display
    reductionConversionDisplay.textContent = '';
    efficiencyIntersectionDot.style("opacity", 0);
    horizontalReductionTargetLine.attr("opacity", 0);
    verticalReductionTargetLine.attr("opacity", 0);
    reductionIntersectionDot.style("opacity", 0);

    // Handle target reduction input
    if (reductionInputValue >= 0 && reductionInputValue <= 1) {
        // Find the efficiency that results in this reduction
        const reductionToEfficiency = (targetY) => {
            // Solve 1 - (100 / (x*100 + 100)) = targetY
            return (100 / (1 - targetY) - 100) / 100;
        };

        const targetEfficiency = reductionToEfficiency(reductionInputValue);

        // TODO are boundaries needed?
        if (targetEfficiency >= 0 && targetEfficiency <= maxGraphYValue) {
        // if (targetEfficiency >= 0) {
            // Update target horizontal line
            horizontalReductionTargetLine
                .attr("x1", x(0))
                .attr("y1", y(reductionInputValue))
                .attr("x2", x(targetEfficiency))
                .attr("y2", y(reductionInputValue))
                .attr("opacity", 1);

            verticalReductionTargetLine
                .attr("x1", x(targetEfficiency))
                .attr("y1", y(0))
                .attr("x2", x(targetEfficiency))
                .attr("y2", y(reductionInputValue))
                .attr("opacity", 1);

            // Update target intersection dot
            reductionIntersectionDot
                .attr("cx", x(targetEfficiency))
                .attr("cy", y(reductionInputValue))
                .style("opacity", 1);

            // Update current value display
        }
        reductionConversionDisplay.textContent += `Efficiency: ${(targetEfficiency * 100).toFixed(2)}%`;
    }
}

// Add event listeners
efficiencyInput.addEventListener('input', updateEfficiencyChart);
reductionInput.addEventListener('input', updateReductionChart);

// Tooltip
const tooltip = d3.select("#tooltip");

// Hover dot
const hoverDot = svg.append("circle")
    .attr("r", 6)
    .attr("fill", "steelblue")
    .style("opacity", 0);

// Hover interaction
svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .on("mousemove", function (event) {
        // Get the x coordinate of the mouse
        const mouseX = d3.pointer(event)[0];

        // Find the closest data point
        const x0 = x.invert(mouseX);
        const bisect = d3.bisector(d => d.x).left;
        const index = bisect(data, x0);
        const d0 = data[index - 1];
        const d1 = data[index];
        const d = x0 - d0.x > d1.x - x0 ? d1 : d0;

        // Update hover dot
        hoverDot
            .attr("cx", x(d.x))
            .attr("cy", y(d.y))
            .style("opacity", 1);

        // Show tooltip
        tooltip.style("display", "block")
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px")
            .html(`
                        <strong>Efficiency:</strong> ${(d.x * 100).toFixed(2)}%<br>
                        <strong>Reduction:</strong> ${(d.y * 100).toFixed(2)}%
                    `);
    })
    .on("mouseout", () => {
        // Hide hover dot
        hoverDot.style("opacity", 0);
        tooltip.style("display", "none");
    });

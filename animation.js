document.addEventListener('DOMContentLoaded', () => {
    const isDarkMode = () => document.documentElement.classList.contains('dark');

    // Adjusted width to make space for labels on both sides
    const mapWidth = 960;
    const labelColumnWidth = 250;
    const width = mapWidth + (labelColumnWidth * 2);
    const height = 600;

    // Remove hardcoded scale and translate. They will be set dynamically.
    const projection = d3.geoAlbersUsa();
    const path = d3.geoPath().projection(projection);

    const svg = d3.select("#walmart-growth-map").append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("width", "100%")
        .style("max-width", `${width}px`)
        .style("height", "auto");

    // Groups for different layers
    const mapGroup = svg.append("g");
    const pointsGroup = svg.append("g");
    const labelsGroup = svg.append("g");

    const yearText = svg.append("text")
        .attr("class", "year-text")
        .attr("x", labelColumnWidth + mapWidth / 2)
        .attr("y", height / 2)
        .attr("dominant-baseline", "middle")
        .attr("text-anchor", "middle")
        .style("font-size", "80px")
        .style("font-weight", "bold");

    function updateMapColors() {
        const fillColor = isDarkMode() ? "#2D3748" : "#E2E8F0"; // Darker gray for dark, light gray for light
        const strokeColor = isDarkMode() ? "#1A202C" : "#FFFFFF"; // Even darker for dark, white for light
        const pointColor = isDarkMode() ? "#A0AEC0" : "#4A5568"; // Lighter gray for dark, darker gray for light
        const labelColor = isDarkMode() ? "#E2E8F0" : "#1A202C";
        const yearColor = isDarkMode() ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";

        mapGroup.selectAll(".states-fill")
            .attr("fill", fillColor);
            
        mapGroup.selectAll(".state-borders")
            .attr("stroke", strokeColor);

        pointsGroup.selectAll("circle")
            .attr("fill", pointColor);

        labelsGroup.selectAll("text")
            .attr("fill", labelColor);

        labelsGroup.selectAll("line")
            .attr("stroke", labelColor);
            
        yearText.attr("fill", yearColor);
    }

    Promise.all([
        d3.json("Assets/us-10m-v1-json-data/2061c02cb3c747daf6ea7c406a5151f4-5d4c901bbf597838fbb8e34922d33c48c8aad7d8/us-states.topojson"),
        d3.csv("Assets/locations.csv")
    ]).then(([us, locations]) => {
        
        // --- DYNAMIC PROJECTION FIT ---
        const states = topojson.feature(us, us.objects['us-states']);
        // Add a small padding so strokes at the outer edges aren't clipped
        const pad = 6;
        projection.fitExtent([[pad, pad], [mapWidth - pad, height - pad]], states);
        
        // --- RENDER MAP ---
        mapGroup.append("path")
            .datum(states)
            .attr("class", "states-fill")
            .attr("d", path)
            .attr("transform", `translate(${labelColumnWidth}, 0)`);

        mapGroup.append("path")
            .datum(topojson.mesh(us, us.objects['us-states'], (a, b) => a !== b))
            .attr("class", "state-borders")
            .attr("d", path)
            .attr("transform", `translate(${labelColumnWidth}, 0)`)
            .attr("fill", "none")
            .attr("stroke-width", 0.75)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("vector-effect", "non-scaling-stroke");
            
        // --- PROCESS DATA ---
        const parseDate = d3.timeParse("%m/%d/%Y");

        const validLocations = locations.filter(d => {
            const lat = parseFloat(d.latitude);
            const lon = parseFloat(d.longitude);
            return !isNaN(lat) && !isNaN(lon) && d.event_date;
        }).map(d => {
            d.date = parseDate(d.event_date);
            d.latitude = parseFloat(d.latitude);
            d.longitude = parseFloat(d.longitude);
            d.proj = projection([d.longitude, d.latitude]);
            return d;
        }).filter(d => d.date && d.proj) // Filter out dates that failed to parse or points outside projection
          .sort((a, b) => a.date - b.date);

        // --- SETUP LABELS ---
        const labelPadding = 15;
        const labelLineHeight = 14;
        let leftLabelY = labelPadding;
        let rightLabelY = labelPadding;

        validLocations.forEach((d, i) => {
            const [x, y] = d.proj;
            const labelX = i % 2 === 0 ? labelColumnWidth - labelPadding : width - labelColumnWidth + labelPadding;
            const labelY = i % 2 === 0 ? leftLabelY : rightLabelY;
            const textAnchor = i % 2 === 0 ? "end" : "start";
            
            const label = labelsGroup.append("g")
                .attr("class", "label-group")
                .attr("opacity", 0); // Initially hidden

            // Add line from label to point
            label.append("line")
                .attr("x1", textAnchor === "end" ? labelX + 5 : labelX - 5)
                .attr("y1", labelY + labelLineHeight)
                .attr("x2", x + labelColumnWidth) // Adjust point position for map offset
                .attr("y2", y)
                .attr("stroke-width", 0.5);

            // Add OrgName
            label.append("text")
                .attr("x", labelX)
                .attr("y", labelY)
                .attr("text-anchor", textAnchor)
                .style("font-size", "10px")
                .style("font-weight", "bold")
                .text(d.OrgName);
            
            // Add Location
            label.append("text")
                .attr("x", labelX)
                .attr("y", labelY + labelLineHeight)
                .attr("text-anchor", textAnchor)
                .style("font-size", "9px")
                .text(d['Location (State)']);
            
            // Add Ransom Amount
            label.append("text")
                .attr("x", labelX)
                .attr("y", labelY + (labelLineHeight * 2))
                .attr("text-anchor", textAnchor)
                .style("font-size", "9px")
                .text(`Ransom: ${d.AmtPaid}`);

            // Store label group for later
            d.labelGroup = label;
            
            // Increment Y position for the next label in the column
            if (i % 2 === 0) {
                leftLabelY += (labelLineHeight * 3) + labelPadding;
            } else {
                rightLabelY += (labelLineHeight * 3) + labelPadding;
            }
        });


        // --- ANIMATION LOGIC ---
        let currentIndex = 0;
        const timeScale = d3.scaleTime()
            .domain(d3.extent(validLocations, d => d.date))
            .range([0, 20000]); // Animation duration in milliseconds

        let animationTimer;

        const startAnimation = () => {
            if (animationTimer) animationTimer.stop();

            const timer = d3.timer(elapsed => {
                const currentDate = timeScale.invert(elapsed);
                yearText.text(currentDate.getFullYear());

                while (currentIndex < validLocations.length && validLocations[currentIndex].date <= currentDate) {
                    const d = validLocations[currentIndex];
                    if (d.proj) {
                        pointsGroup.append("circle")
                            .attr("cx", d.proj[0])
                            .attr("cy", d.proj[1])
                            .attr("r", 3)
                            .attr("transform", `translate(${labelColumnWidth}, 0)`); // Offset to match map
                        
                        d.labelGroup.attr("opacity", 1);
                    }
                    currentIndex++;
                }
                
                updateMapColors();

                if (currentIndex >= validLocations.length) {
                    timer.stop();
                }
            });
            animationTimer = timer;
        };

        const resetAnimation = () => {
            currentIndex = 0;
            pointsGroup.selectAll("circle").remove();
            labelsGroup.selectAll(".label-group").attr("opacity", 0);
            yearText.text("");
            if (animationTimer) animationTimer.stop();
        };

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    resetAnimation();
                    startAnimation();
                } else {
                    if (animationTimer) animationTimer.stop();
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(document.getElementById('walmart-growth-map'));

        // Theme toggling
        const logo = document.getElementById('theme-toggle-logo');
        logo.addEventListener('click', updateMapColors);
        
        updateMapColors(); // Initial call

    }).catch(error => {
        console.error("Error loading data:", error);
        const mapContainer = document.getElementById('walmart-growth-map');
        if (mapContainer) {
            mapContainer.innerHTML = "<p style='color: red; text-align: center;'>Error: Could not load data.</p>";
        }
    });
});
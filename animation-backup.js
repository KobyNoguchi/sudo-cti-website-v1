document.addEventListener('DOMContentLoaded', () => {
    // Map takes 2/3 of screen width, two columns take 1/3
    const totalWidth = window.innerWidth || 1200;
    const mapWidth = Math.floor(totalWidth * (2/3));
    const columnWidth = Math.floor(totalWidth * (1/6)); // Each column is 1/6 of total width
    const width = mapWidth + (columnWidth * 2);
    let height = 600; // Will be updated based on container

    // Remove hardcoded scale and translate. They will be set dynamically.
    const projection = d3.geoAlbersUsa();
    const path = d3.geoPath().projection(projection);

    // Get the container dimensions
    const container = document.getElementById("walmart-growth-map");
    const containerRect = container.getBoundingClientRect();
    const containerHeight = Math.max(600, containerRect.height || 600); // Minimum 600px height
    height = containerHeight; // Update height to match container
    
    const svg = d3.select("#walmart-growth-map").append("svg")
        .attr("viewBox", `0 0 ${width} ${containerHeight}`)
        .attr("preserveAspectRatio", "xMidYMid slice")
        .style("width", "100%")
        .style("height", "100%")
        .style("display", "block")
        .style("background", "transparent");

    // Groups for different layers
    const mapGroup = svg.append("g");
    const pointsGroup = svg.append("g");
    const labelsGroup = svg.append("g");

    let yearText; // Will be positioned after map loads

    function updateMapColors() {
        const fillColor = "#2D3748"; // Dark gray
        const strokeColor = "#1A202C"; // Even darker
        const pointColor = "#A0AEC0"; // Lighter gray
        const labelColor = "#E2E8F0"; // Light gray
        const yearColor = "rgba(255, 255, 255, 0.1)"; // Semi-transparent white

        // Fill individual states with gray
        mapGroup.selectAll(".state")
            .attr("fill", fillColor)
            .attr("fill-opacity", 1);

        // Style state borders
        mapGroup.selectAll(".state-borders")
            .attr("stroke", strokeColor);

        mapGroup.selectAll(".country-outline")
            .attr("stroke", "#000000");

        pointsGroup.selectAll("circle:not(.highlighted)")
            .attr("fill", pointColor);

        labelsGroup.selectAll("text:not(.highlighted)")
            .attr("fill", labelColor);
            
        yearText.attr("fill", yearColor);
    }
    
    function highlightElements(d) {
        // Highlight the circle with enhanced glow
        if (d.circleElement) {
            d.circleElement.classed("highlighted", true)
                .attr("fill", "#FF6B35")
                .attr("r", 6)
                .style("filter", "drop-shadow(0 0 12px #FF6B35) drop-shadow(0 0 6px #FF6B35)")
                .style("opacity", 1);
        }
        
        // Highlight the incident row with enhanced glow
        if (d.incidentRow) {
            d.incidentRow.style.backgroundColor = '#FF6B35';
            d.incidentRow.style.boxShadow = '0 0 15px #FF6B35, 0 0 25px rgba(255, 107, 53, 0.5)';
            d.incidentRow.style.transform = 'scale(1.02)';
            d.incidentRow.style.zIndex = '10';
            
            // Change ransom amount to black when highlighted
            const ransomElement = d.incidentRow.querySelector('.ransom-amount');
            if (ransomElement) {
                ransomElement.style.color = '#000000';
            }
            
            // Auto-scroll to row if not visible
            scrollToRowIfNotVisible(d.incidentRow);
        }
    }
    
    function unhighlightElements(d) {
        const pointColor = "#A0AEC0"; // Lighter gray
        const labelColor = "#E2E8F0"; // Light gray
        
        // Unhighlight the circle
        if (d.circleElement) {
            d.circleElement.classed("highlighted", false)
                .attr("fill", pointColor)
                .attr("r", 3)
                .style("filter", "none")
                .style("opacity", 1);
        }
        
        // Unhighlight the incident row
        if (d.incidentRow) {
            d.incidentRow.style.backgroundColor = '#475569'; // slate-600
            d.incidentRow.style.boxShadow = 'none';
            d.incidentRow.style.transform = 'scale(1)';
            d.incidentRow.style.zIndex = 'auto';
            
            // Restore ransom amount to orange
            const ransomElement = d.incidentRow.querySelector('.ransom-amount');
            if (ransomElement) {
                ransomElement.style.color = '#fb923c'; // orange-400
            }
        }
    }
    
    // Auto-scroll function to ensure row is visible
    function scrollToRowIfNotVisible(row) {
        const container = document.getElementById('incident-list');
        if (!container || !row) return;
        
        const containerRect = container.getBoundingClientRect();
        const rowRect = row.getBoundingClientRect();
        
        // Check if row is not fully visible
        const isAbove = rowRect.top < containerRect.top;
        const isBelow = rowRect.bottom > containerRect.bottom;
        
        if (isAbove || isBelow) {
            // Calculate target scroll position
            let targetScrollTop;
            
            if (isAbove) {
                // Scroll up to show row at top with padding
                targetScrollTop = container.scrollTop + (rowRect.top - containerRect.top) - 10;
            } else {
                // Scroll down to show row at bottom with padding  
                targetScrollTop = container.scrollTop + (rowRect.bottom - containerRect.bottom) + 10;
            }
            
            // Smooth scroll to target position
            container.scrollTo({
                top: targetScrollTop,
                behavior: 'smooth'
            });
        }
    }

    Promise.all([
        d3.json("Assets/us-10m-v1-json-data/2061c02cb3c747daf6ea7c406a5151f4-5d4c901bbf597838fbb8e34922d33c48c8aad7d8/us-states.topojson"),
        d3.csv("Assets/locations.csv")
    ]).then(([us, locations]) => {
        
        // --- DYNAMIC PROJECTION FIT ---
        const states = topojson.feature(us, us.objects['us-states']);
        // Add a small padding so strokes at the outer edges aren't clipped
        const pad = 6;
        // Account for title space at top (64px = 4rem)
        const titleSpace = 64;
        projection.fitExtent([[pad, pad + titleSpace], [mapWidth - pad, height - pad]], states);
        
        // Get the actual bounds of the projected map for year text positioning
        const bounds = path.bounds(states);
        const mapBounds = {
            left: bounds[0][0],
            top: bounds[0][1], 
            right: bounds[1][0],
            bottom: bounds[1][1]
        };
        
        // Position year text based on actual map bounds
        yearText = svg.append("text")
            .attr("class", "year-text")
            .attr("x", mapBounds.right - 20)
            .attr("y", mapBounds.bottom - 20)
            .attr("dominant-baseline", "baseline")
            .attr("text-anchor", "end")
            .style("font-size", "56px")
            .style("font-weight", "bold");
        
        // --- RENDER MAP ---
        // Create individual state paths with fills
        mapGroup.selectAll(".state")
            .data(states.features)
            .enter().append("path")
            .attr("class", "state")
            .attr("d", path);
            
        // Add US country outline (external borders)
        mapGroup.append("path")
            .datum(topojson.mesh(us, us.objects['us-states'], (a, b) => a === b))
            .attr("class", "country-outline")
            .attr("d", path)
            .attr("fill", "none")
            .attr("stroke-width", 2)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("vector-effect", "non-scaling-stroke");

        // Add state borders for clear boundaries between states
        mapGroup.append("path")
            .datum(topojson.mesh(us, us.objects['us-states'], (a, b) => a !== b))
            .attr("class", "state-borders")
            .attr("d", path)
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

        // --- SETUP HTML INCIDENT LIST ---
        const incidentListContainer = document.getElementById('incident-list');
        
        validLocations.forEach((d, i) => {
            // Create incident row
            const incidentRow = document.createElement('div');
            incidentRow.className = 'incident-row bg-slate-600 dark:bg-slate-700 p-3 border-b border-slate-500 dark:border-slate-600 cursor-pointer hover:bg-slate-500 dark:hover:bg-slate-600 transition-colors';
            
            // Format the date for display
            const dateString = d.date ? d.date.toLocaleDateString() : 'Unknown';
            
            // Create two-column layout within row
            incidentRow.innerHTML = `
                <div class="grid grid-cols-2 gap-2 text-white text-xs">
                    <div class="space-y-1">
                        <div class="font-bold">${d.OrgName}</div>
                        <div class="text-slate-200">${d['Location (State)']}</div>
                    </div>
                    <div class="border-l border-slate-400 pl-2 space-y-1 text-right">
                        <div class="text-slate-300 text-xs">${dateString}</div>
                        <div class="ransom-amount font-bold text-orange-400">${d.AmtPaid}</div>
                    </div>
                </div>
            `;
            
            // Store references for hover interactions
            d.incidentRow = incidentRow;
            d.circleElement = null; // Will be set when circle is created
            
            // Add hover interactions
            incidentRow.addEventListener('mouseenter', () => {
                highlightElements(d);
            });
            
            incidentRow.addEventListener('mouseleave', () => {
                unhighlightElements(d);
            });
            
            // Add to container (initially hidden)
            incidentRow.style.display = 'none';
            incidentListContainer.appendChild(incidentRow);
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
                        const circle = pointsGroup.append("circle")
                            .attr("cx", d.proj[0])
                            .attr("cy", d.proj[1])
                            .attr("r", 3)
                            .style("cursor", "pointer");
                        
                        // Store circle reference for hover interactions
                        d.circleElement = circle;
                        
                        // Add hover interactions to the map dot
                        circle.on("mouseenter", function() {
                            highlightElements(d);
                        })
                        .on("mouseleave", function() {
                            unhighlightElements(d);
                        });
                        
                        // Show the HTML incident row
                        d.incidentRow.style.display = 'block';
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
            // Hide all incident rows
            validLocations.forEach(d => {
                d.incidentRow.style.display = 'none';
                d.circleElement = null;
            });
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

        // Apply initial map colors
        updateMapColors();

    }).catch(error => {
        console.error("Error loading data:", error);
        const mapContainer = document.getElementById('walmart-growth-map');
        if (mapContainer) {
            mapContainer.innerHTML = "<p style='color: red; text-align: center;'>Error: Could not load data.</p>";
        }
    });
});
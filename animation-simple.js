document.addEventListener('DOMContentLoaded', () => {
    // Map takes 2/3 of screen width, two columns take 1/3
    const totalWidth = window.innerWidth || 1200;
    const mapWidth = Math.floor(totalWidth * (2/3));
    const columnWidth = Math.floor(totalWidth * (1/6)); // Each column is 1/6 of total width
    const width = mapWidth + (columnWidth * 2);
    let height = 600; // Will be updated based on container

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

        // Fill US outline with gray
        mapGroup.selectAll("#contiguous-us")
            .attr("fill", fillColor)
            .attr("fill-opacity", 1);

        mapGroup.selectAll("#alaska")
            .attr("fill", fillColor)
            .attr("fill-opacity", 1);

        mapGroup.selectAll("#hawaii circle")
            .attr("fill", fillColor);

        // Style borders
        mapGroup.selectAll("#state-borders line")
            .attr("stroke", strokeColor);

        pointsGroup.selectAll("circle:not(.highlighted)")
            .attr("fill", pointColor);

        labelsGroup.selectAll("text:not(.highlighted)")
            .attr("fill", labelColor);
            
        if (yearText) {
            yearText.attr("fill", yearColor);
        }
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
                ransomElement.style.color = '#FB923C'; // orange-400
            }
        }
    }
    
    function scrollToRowIfNotVisible(row) {
        const container = document.getElementById('incident-list');
        if (!container || !row) return;
        
        const containerRect = container.getBoundingClientRect();
        const rowRect = row.getBoundingClientRect();
        
        const isAbove = rowRect.top < containerRect.top;
        const isBelow = rowRect.bottom > containerRect.bottom;
        
        if (isAbove || isBelow) {
            let targetScrollTop;
            if (isAbove) {
                targetScrollTop = container.scrollTop + (rowRect.top - containerRect.top) - 10;
            } else {
                targetScrollTop = container.scrollTop + (rowRect.bottom - containerRect.bottom) + 10;
            }
            
            container.scrollTo({
                top: targetScrollTop,
                behavior: 'smooth'
            });
        }
    }

    // Load the simple SVG and CSV data
    Promise.all([
        d3.xml("Assets/us-map-simple.svg"),
        d3.csv("Assets/locations.csv")
    ]).then(([svgDoc, locations]) => {
        
        // Import the SVG map
        const importedSvg = svgDoc.documentElement;
        const mapSvgGroup = mapGroup.node().appendChild(importedSvg.cloneNode(true));
        
        // Set up simple projection for coordinate mapping
        // This is a basic projection that maps lat/lon to our SVG coordinates
        const projection = d3.geoAlbersUsa()
            .scale(1000)
            .translate([mapWidth/2, height/2]);
        
        // Position year text
        yearText = svg.append("text")
            .attr("class", "year-text")
            .attr("x", mapWidth - 40)
            .attr("y", height - 40)
            .attr("dominant-baseline", "baseline")
            .attr("text-anchor", "end")
            .style("font-size", "56px")
            .style("font-weight", "bold");
            
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
            
            // Store references
            d.incidentRow = incidentRow;
            d.circleElement = null; // Will be set when circle is created
            
            // Add event listeners
            incidentRow.addEventListener('mouseenter', () => {
                highlightElements(d);
            });
            
            incidentRow.addEventListener('mouseleave', () => {
                unhighlightElements(d);
            });
            
            // Initially hide the row
            incidentRow.style.display = 'none';
            
            // Add to container
            incidentListContainer.appendChild(incidentRow);
        });

        // --- SETUP ANIMATION ---
        const startDate = d3.min(validLocations, d => d.date);
        const endDate = d3.max(validLocations, d => d.date);
        const timeScale = d3.scaleTime()
            .domain([startDate, endDate])
            .range([0, 10000]); // 10 second animation

        let timer;
        let currentTime = 0;

        function startAnimation() {
            if (timer) timer.stop();
            
            timer = d3.timer((elapsed) => {
                currentTime = elapsed;
                const currentDate = timeScale.invert(elapsed);
                
                // Show/hide incidents based on current date
                const visibleIncidents = validLocations.filter(d => d.date <= currentDate);
                
                // Update circles
                const circles = pointsGroup.selectAll("circle")
                    .data(visibleIncidents, d => d.OrgName + d.date);
                
                circles.enter()
                    .append("circle")
                    .attr("cx", d => d.proj[0])
                    .attr("cy", d => d.proj[1])
                    .attr("r", 3)
                    .each(function(d) {
                        d.circleElement = d3.select(this);
                        
                        // Add hover events to circles
                        d3.select(this)
                            .on("mouseenter", function() {
                                highlightElements(d);
                            })
                            .on("mouseleave", function() {
                                unhighlightElements(d);
                            });
                    });
                
                // Update incident list visibility
                validLocations.forEach(d => {
                    if (d.date <= currentDate) {
                        d.incidentRow.style.display = 'block';
                    } else {
                        d.incidentRow.style.display = 'none';
                    }
                });
                
                // Update year display
                yearText.text(currentDate.getFullYear());
                
                updateMapColors();

                if (currentTime >= 10000) {
                    timer.stop();
                }
            });
        }

        // Setup intersection observer to start animation when map comes into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startAnimation();
                    observer.unobserve(entry.target);
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

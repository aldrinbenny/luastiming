// Function to update the stop dropdown based on the selected line
function updateStops() {
    const lineSelect = document.getElementById("line");
    const stopSelect = document.getElementById("stop");

    // Clear existing options
    stopSelect.innerHTML = "";

    // Define stops for both lines
    const greenLineStops = [
        { name: "Marlborough", code: "MAR" },
        { name: "Trinity", code: "TPT" },
        { name: "St. Stephen's Green", code: "STS" },
        { name: "Harcourt", code: "HAR" },
        { name: "Ranelagh", code: "RAN" },
        { name: "Balally", code: "BST" },
        { name: "Brides Glen", code: "BRD" }
    ];

    const redLineStops = [
        { name: "Abbey Street", code: "ABB" },
        { name: "O'Connell/Abbey Street", code: "OCA" },
        { name: "Jervis", code: "JER" },
        { name: "Smithfield", code: "SMI" },
        { name: "Four Courts", code: "FC" },
        { name: "Heuston", code: "HEU" },
        { name: "Red Cow", code: "RC" },
        { name: "Tallaght", code: "TAL" },
        { name: "Saggart", code: "SAG" }
    ];

    // Determine which line is selected
    const selectedLine = lineSelect.value;

    // Add the correct stops based on the selected line
    let stops = [];
    if (selectedLine === "green") {
        stops = greenLineStops;
    } else if (selectedLine === "red") {
        stops = redLineStops;
    }

    // Populate the stop dropdown with the correct stops
    stops.forEach(stop => {
        let option = document.createElement("option");
        option.value = stop.code;
        option.textContent = stop.name;
        stopSelect.appendChild(option);
    });
}

// Initialize the stops when the page loads
window.onload = updateStops;

// Function to fetch timings and display them
async function fetchTimings() {
    let stop = document.getElementById("stop").value.trim().toUpperCase();
    let resultsDiv = document.getElementById("results");

    if (stop === "") {
        resultsDiv.innerHTML = "❌ Please select a valid Luas stop!";
        return;
    }

    let apiUrl = `https://luasforecasts.rpa.ie/xml/get.ashx?action=forecast&stop=${stop}&encrypt=false`;
    let proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;

    try {
        let response = await fetch(proxyUrl);
        let data = await response.json(); // Get JSON response
        let xmlText = data.contents;

        // Convert XML text to a JavaScript object
        let parser = new DOMParser();
        let xml = parser.parseFromString(xmlText, "text/xml");

        // Extract useful data
        let stopName = xml.documentElement.getAttribute("stop"); // Stop name
        let message = xml.getElementsByTagName("message")[0]?.textContent || "No status available";

        let greenLineTrams = xml.getElementsByTagName("direction")[0]?.getElementsByTagName("tram");
        let redLineTrams = xml.getElementsByTagName("direction")[1]?.getElementsByTagName("tram");

        let output = `<h2>📍 ${stopName} Stop</h2>`;
        output += `<p>🟢 Status: ${message}</p>`;

        output += "<h3>🚋 Green Line Trams:</h3>";
        if (greenLineTrams && greenLineTrams.length > 0) {
            output += "<ul>";
            for (let tram of greenLineTrams) {
                let destination = tram.getAttribute("destination");
                let dueMins = tram.getAttribute("dueMins") || "N/A";
                output += `<li>🚆 ${destination} - Arriving in ${dueMins} mins</li>`;
            }
            output += "</ul>";
        } else {
            output += "<p>No Green Line trams available.</p>";
        }

        output += "<h3>🚋 Red Line Trams:</h3>";
        if (redLineTrams && redLineTrams.length > 0) {
            output += "<ul>";
            for (let tram of redLineTrams) {
                let destination = tram.getAttribute("destination");
                let dueMins = tram.getAttribute("dueMins") || "N/A";
                output += `<li>🚆 ${destination} - Arriving in ${dueMins} mins</li>`;
            }
            output += "</ul>";
        } else {
            output += "<p>No Red Line trams available.</p>";
        }

        resultsDiv.innerHTML = output;
    } catch (error) {
        resultsDiv.innerHTML = "⚠️ Error fetching Luas data. Try again!";
        console.error("Error:", error);
    }
}

const version = "9.0";

document.addEventListener("DOMContentLoaded", function() {
    console.log("Script version:", version); // Log the version for verification
    console.log("Snooping around eh? :-D");

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const timeTable = document.getElementById("timeTable");

    // Create the day rows
    days.forEach((day, dayIndex) => {
        let row = timeTable.insertRow();
        row.insertCell().textContent = day;
        for (let i = 0; i < 3; i++) { // Three segments per day
            let cellIn = row.insertCell();
            let labelIn = document.createElement("span");
            labelIn.textContent = "In: ";
            let inputIn = createInput(`time_${dayIndex}_${i}_in`);
            cellIn.appendChild(labelIn);
            cellIn.appendChild(inputIn);

            let cellOut = row.insertCell();
            let labelOut = document.createElement("span");
            labelOut.textContent = "Out: ";
            let inputOut = createInput(`time_${dayIndex}_${i}_out`);
            cellOut.appendChild(labelOut);
            cellOut.appendChild(inputOut);
        }
        let totalCell = row.insertCell();
        totalCell.className = "totalHours";
    });

    // Add total row
	let totalRow = timeTable.insertRow();
	totalRow.insertCell().textContent = "Total";
	for (let i = 0; i < 3 * 2; i++) { // 3 segments, each has 2 cells (In and Out)
		totalRow.insertCell();
	}
	let totalHoursCell = totalRow.insertCell();
	totalHoursCell.id = "weeklyTotal";

    // Load data from the cookie
    let storedData = getCookie('timeData');
    if (storedData) {
        const data = JSON.parse(storedData);
        // Populate the table with data from the cookie
        for (const key in data) {
            const input = document.querySelector(`input[name='${key}']`);
            if (input) {
                input.value = data[key];
                calculateDayTotal(input); // Assuming this function calculates the total for a row
            }
        }
    }

    addEventListeners();

    // Assuming there's a button with id 'clearButton' in your HTML
    document.getElementById('clearButton').addEventListener('click', function() {
        eraseCookie('timeData');
        console.log('clearButton clicked!')  
        // Logic to clear the time table in the UI
    });
});

function createInput(name) {
    let input = document.createElement("input");
    input.className = "timeInput";
    input.placeholder = "HH:MM";
    input.name = name;
    return input;
}

// ... rest of the functions (addEventListeners, validateAndFormatTime, isValidTime, calculateDayTotal, calculateDuration, formatHoursMinutes, calculateWeeklyTotal) ...



function addEventListeners() {
    document.querySelectorAll('.timeInput').forEach(input => {
        input.addEventListener('change', function() {
            validateAndFormatTime(this);
            calculateDayTotal(this);
            updateCookieWithCurrentData();
        });
    });
}

function updateCookieWithCurrentData() {
    const data = {};
    document.querySelectorAll('.timeInput').forEach(input => {
        data[input.name] = input.value;
    });
    setCookie('timeData', JSON.stringify(data), 7); // Save for 7 days
}

function validateAndFormatTime(inputElement) {
    let value = inputElement.value;
    value = value.replace(/:/g, ''); // Remove colon if present

    if (value.length === 3 || value.length === 4) {
        let hours, minutes;
        if (value.length === 3) {
            hours = value.substring(0, 1);
            minutes = value.substring(1, 3);
        } else {
            hours = value.substring(0, 2);
            minutes = value.substring(2, 4);
        }
        if (isValidTime(hours, minutes)) {
            inputElement.value = `${hours.padStart(2, '0')}:${minutes}`;
        } else {
            inputElement.value = '';
        }
    } else {
        inputElement.value = '';
    }
}

function isValidTime(hours, minutes) {
    return !isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

function calculateDayTotal(inputElement) {
    let row = inputElement.closest('tr');
    let totalMinutes = 0;
    for (let j = 1; j < row.cells.length - 1; j += 2) { // Increment by 2 to jump from "In" to "Out" cell
        let startInput = row.cells[j].querySelector('input');
        let endInput = row.cells[j + 1].querySelector('input');
        let start = startInput.value;
        let end = endInput.value;
        if (start && end) {
            totalMinutes += calculateDuration(start, end);
        }
    }
    let totalHoursCell = row.cells[row.cells.length - 1];

    // Check if totalMinutes is zero and adjust display accordingly
    if (totalMinutes === 0) {
        totalHoursCell.textContent = ''; // Or set to any other default display like '--' or 'No Time'
    } else {
        totalHoursCell.textContent = formatHoursMinutes(totalMinutes);
    }

    calculateWeeklyTotal();
}


function calculateDuration(start, end) {
    let [startHours, startMinutes] = start.split(":").map(Number);
    let [endHours, endMinutes] = end.split(":").map(Number);
    let duration = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
    if (duration < 0) duration += 24 * 60; // Adjust for next day
    return duration; // Keep minutes for total calculation
}

function formatHoursMinutes(totalMinutes) {
    let hours = Math.floor(totalMinutes / 60);
    let minutes = totalMinutes % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
}

function calculateWeeklyTotal() {
    let rows = document.getElementById("timeTable").rows;
    let weeklyTotalMinutes = 0;
    // Iterate over the day rows, which start at index 1 (to skip the header) and end one row before the last (to skip the total row)
    for (let i = 1; i < rows.length - 1; i++) {
        let totalHoursCell = rows[i].cells[rows[i].cells.length - 1];
        let dailyTotal = totalHoursCell.textContent;
        if (dailyTotal) {
            let [hours, minutes] = dailyTotal.split(":").map(Number);
            weeklyTotalMinutes += (hours * 60) + minutes;
        }
    }
    let weeklyTotalHoursCell = document.getElementById("weeklyTotal");
    weeklyTotalHoursCell.textContent = formatHoursMinutes(weeklyTotalMinutes);
}

// Cookie management functions
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    let sameSite = 'SameSite=Lax'; // Use Lax for most cases
    let secure = (window.location.protocol === 'https:') ? '; Secure' : '';
    document.cookie = name + "=" + (value || "") + expires + "; path=/; " + sameSite + secure;
}


function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {   
    let sameSite = 'SameSite=Lax';
    let secure = (window.location.protocol === 'https:') ? '; Secure' : '';
    document.cookie = name + '=; Max-Age=-99999999; path=/; ' + sameSite + secure;
    location.reload(); // Reloads the current page
}



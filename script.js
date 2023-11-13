const version = "8.4";

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

    addEventListeners();
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
        });
    });
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
    totalHoursCell.textContent = formatHoursMinutes(totalMinutes);
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



// Global variables
let calendar;
let holidays = []; // will hold all PH holidays

// Show/hide advanced options
document.getElementById('enableAdvanced').addEventListener('change', function() {
  const adv = document.getElementById('advancedOptions');
  adv.style.display = this.checked ? 'block' : 'none';
});

// Show/hide hybrid radios, remember previous selections
function updateHybridRadios() {
  const hybridEnabled = document.getElementById('hybridCheck').checked;
  document.querySelectorAll('.workday-toggle').forEach(toggle => {
    const dayRow = toggle.closest('.day-row');
    const hybridOptions = dayRow.querySelector('.hybrid-options');

    if (hybridEnabled && toggle.checked) {
      hybridOptions.style.display = 'flex';

      // On first load, set default On-site if nothing is selected
      const anyChecked = hybridOptions.querySelector('input[type="radio"]:checked');
      if (!anyChecked) {
        hybridOptions.querySelector('input[type="radio"][value="onsite"]').checked = true;
      }
    } else {
      // Only hide radios, do NOT reset the value (so it remembers last selection)
      hybridOptions.style.display = 'none';
    }
  });
}

// Run on hybrid checkbox change
document.getElementById('hybridCheck').addEventListener('change', updateHybridRadios);

// Run on day toggle change
document.querySelectorAll('.workday-toggle').forEach(toggle => {
  toggle.addEventListener('change', updateHybridRadios);
});

// Run on page load
window.addEventListener('DOMContentLoaded', updateHybridRadios);



// Run on hybrid checkbox change
document.getElementById('hybridCheck').addEventListener('change', updateHybridRadios);

// Run on day toggle change
document.querySelectorAll('.workday-toggle').forEach(toggle => {
  toggle.addEventListener('change', updateHybridRadios);
});

// ✅ Run on page load to hide radios for unchecked days
window.addEventListener('DOMContentLoaded', updateHybridRadios);


// Fetch PH holidays at the start
async function fetchPhilippinesHolidays(year = new Date().getFullYear()) {
  try {
    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/PH`);
    if (!res.ok) throw new Error(`API request failed (${res.status})`);
    holidays = await res.json(); // save in global variable
    console.log("Philippine holidays loaded:", holidays.map(h => h.date));
  } catch (err) {
    console.error("Error fetching PH holidays:", err);
    holidays = []; // fallback to empty
  }
}

// Initialize calendar
document.addEventListener('DOMContentLoaded', async function() {
  const calendarEl = document.getElementById('calendar');
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    editable: false,
    selectable: false,
    events: [] // initially empty
  });
  calendar.render();

  // Fetch holidays
  await fetchPhilippinesHolidays();
});


async function calculateDays() {
  const company = document.getElementById("companyName").value.trim();
  const totalHours = parseFloat(document.getElementById("totalHours").value);
  const hoursPerShift = parseFloat(document.getElementById("hoursPerShift").value);
  const startDateInput = document.getElementById("startDate").value;
  const result = document.getElementById("result");

  // Advanced options
  const advancedEnabled = document.getElementById('enableAdvanced').checked;
  const hybridEnabled = advancedEnabled && document.getElementById('hybridCheck').checked;

  // Validation
  if (!company || !startDateInput || !totalHours || !hoursPerShift || totalHours <= 0 || hoursPerShift <= 0) {
    result.textContent = "Please fill in all required fields with valid values.";
    result.style.color = "red";
    return;
  }

  // Fetch PH holidays from Nager.Date API
  let holidays = [];
  try {
    const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${new Date().getFullYear()}/PH`);
    if (!response.ok) throw new Error(`API request failed (${response.status})`);
    holidays = await response.json();
  } catch (err) {
    console.error("Error fetching holidays:", err);
  }

  const holidayDates = holidays.map(h => h.date); // array of strings YYYY-MM-DD

  // Clear previous calendar highlights
  calendar.removeAllEvents();

  const workdayDates = [];
  let daysAdded = 0;
  let currentDate = new Date(startDateInput);

  let onsiteHours = 0;
  let remoteHours = 0;

  // Map day numbers to IDs
  const dayIdMap = ['sun','mon','tue','wed','thu','fri','sat'];

  while (daysAdded < Math.ceil(totalHours / hoursPerShift)) {
    const dayOfWeek = currentDate.getDay(); // 0=Sun, 6=Sat
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayId = dayIdMap[dayOfWeek];
    const dayToggle = document.getElementById(dayId);

    // Skip if the day toggle exists and is unchecked
    if (dayToggle && !dayToggle.checked) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    // Check if this day is a holiday
    const isHoliday = holidayDates.includes(dateStr);
    if (isHoliday) {
      const holiday = holidays.find(h => h.date === dateStr);
      calendar.addEvent({
        title: holiday ? holiday.localName : "Holiday",
        start: dateStr,
        display: 'background',
        backgroundColor: '#ffc107' // yellow
      });
      // Holidays don't count as workdays
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    // ✅ Add workday
    workdayDates.push(new Date(currentDate));
    daysAdded++;

    // Hybrid hours calculation
    if (hybridEnabled && dayToggle) {
      const onsiteRadio = document.getElementById(`${dayId}Onsite`);
      const remoteRadio = document.getElementById(`${dayId}Remote`);
      if (onsiteRadio && onsiteRadio.checked) onsiteHours += hoursPerShift;
      else if (remoteRadio && remoteRadio.checked) remoteHours += hoursPerShift;
      else onsiteHours += hoursPerShift; // fallback
    }

    // Highlight workday in green (except the last day, will highlight separately)
    calendar.addEvent({
      title: `${company} - Day ${workdayDates.length}`,
      start: dateStr,
      display: 'background',
      backgroundColor: '#28a745'
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Highlight end date in red
  const endDate = workdayDates[workdayDates.length - 1];
  calendar.addEvent({
    title: `${company} - End`,
    start: endDate.toISOString().split('T')[0],
    display: 'background',
    backgroundColor: '#dc3545'
  });


  // Prepare message
  let message = `Company: ${company}\n`;
  message += `You need ${workdayDates.length} work days to complete your internship.\n`;
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  message += `Estimated end date: ${endDate.toLocaleDateString('en-US', options)}\n`;


  // Hybrid breakdown
  if (hybridEnabled) {
    message += `Hybrid Mode Hours:\n`;
    message += `On-site: ${onsiteHours}h\n`;
    message += `Remote: ${remoteHours}h\n`;
  }

  result.textContent = message;
  result.style.color = "gray";
}

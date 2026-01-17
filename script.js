// Global variable for the calendar
let calendar;

document.addEventListener('DOMContentLoaded', function() {
  const calendarEl = document.getElementById('calendar');
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    editable: false,
    selectable: false,
    events: []              // initially empty
  });
  calendar.render();
});

function calculateDays() {
  const company = document.getElementById("companyName").value.trim();
  const totalHours = parseFloat(document.getElementById("totalHours").value);
  const hoursPerShift = parseFloat(document.getElementById("hoursPerShift").value);
  const startDateInput = document.getElementById("startDate").value;
  const result = document.getElementById("result");

  // Validation: all fields required
  if (!company || !startDateInput || !totalHours || !hoursPerShift || totalHours <= 0 || hoursPerShift <= 0) {
    result.textContent = "Please fill in all required fields with valid values.";
    result.style.color = "red";
    return;
  }

  const workDays = Math.ceil(totalHours / hoursPerShift);
  const weeks = Math.floor(workDays / 5);
  const remainingDays = workDays % 5;

  let message = `Company: ${company}\n`;
  message += `You need ${workDays} work days to complete your internship.\n`;
  if (weeks > 0) {
    message += `That is ${weeks} week(s)`;
    if (remainingDays > 0) message += ` and ${remainingDays} day(s).`;
    else message += `.`;
  }

  // Clear previous calendar highlights
  calendar.removeAllEvents();

  if (startDateInput) {
    const startDate = new Date(startDateInput);
    let daysAdded = 0;
    let currentDate = new Date(startDate);
    const workdayDates = [];

    // Collect all internship workdays, skipping weekends
    while (daysAdded < workDays) {
      const dayOfWeek = currentDate.getDay(); // 0=Sun, 6=Sat
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workdayDates.push(new Date(currentDate));
        daysAdded++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Estimated end date is the last day
    const endDate = workdayDates[workdayDates.length - 1];
    message += `\nEstimated end date: ${endDate.toDateString()}`;

    // Highlight all workdays in green with company name in tooltip
    for (let i = 0; i < workdayDates.length - 1; i++) { // all except last day
      calendar.addEvent({
        title: `${company} - Day ${i + 1}`,
        start: workdayDates[i].toISOString().split('T')[0],
        display: 'background',
        backgroundColor: '#28a745'
      });
    }

    // Highlight end date in red
    calendar.addEvent({
      title: `${company} - End`,
      start: endDate.toISOString().split('T')[0],
      display: 'background',
      backgroundColor: '#dc3545' // red
    });
  }

  result.textContent = message;
  result.style.color = "blue";
}

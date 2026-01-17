function calculateDays() {
  const totalHours = parseFloat(document.getElementById("totalHours").value);
  const hoursPerShift = parseFloat(document.getElementById("hoursPerShift").value);
  const result = document.getElementById("result");

  if (!totalHours || !hoursPerShift || totalHours <= 0 || hoursPerShift <= 0) {
    result.textContent = "Please enter valid numbers.";
    result.style.color = "red";
    return;
  }

  const workDays = Math.ceil(totalHours / hoursPerShift);

  const weeks = Math.floor(workDays / 5);
  const remainingDays = workDays % 5;

  let message = `You need ${workDays} work days to complete your internship.\n`;

  if (weeks > 0) {
    message += `That is ${weeks} week(s)`;
    if (remainingDays > 0) {
      message += ` and ${remainingDays} day(s).`;
    } else {
      message += `.`;
    }
  }

  result.textContent = message;
  result.style.color = "green";
}

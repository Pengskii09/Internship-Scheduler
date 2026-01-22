async function printPhilippinesHolidays(year = new Date().getFullYear()) {
  try {
    const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/PH`);
    if (!response.ok) throw new Error(`API request failed (${response.status})`);
    const holidays = await response.json();

    console.log(`Public holidays in the Philippines for ${year}:`);
    holidays.forEach(holiday => {
      console.log(`${holiday.date} - ${holiday.localName} (${holiday.name})`);
    });
  } catch (error) {
    console.error("Error fetching holidays:", error);
  }
}

// Run it
printPhilippinesHolidays(2026);

export const getLocalTimezoneDate = (dateString) => {
	// 1. Create a temporary Date object from the string (it will use the local timezone)
	const tempDate = new Date(dateString);
	
	// 2. Check if the input string format includes a time (like 'YYYY-MM-DDTmm:ss')
	if (isNaN(tempDate.getTime())) {
	    // If it's just a date ('YYYY-MM-DD'), let it convert naturally (00:00:00 local)
	    return new Date(dateString);
	}
	
	// 3. Get the timezone offset in minutes and convert to '+HH:MM' format
	// This is the key step to force correct UTC conversion
	const offsetMinutes = tempDate.getTimezoneOffset(); // e.g., -60 for UTC+1
	const offsetHours = Math.abs(offsetMinutes / 60);
	const sign = offsetMinutes > 0 ? '-' : '+'; // Inverted sign for standard format
	const formattedOffset = `${sign}${String(offsetHours).padStart(2, '0')}:00`;
    
	// 4. Return a new Date object created from the string + the offset
	// Example: "2025-12-10T16:00+01:00"
	return new Date(dateString + formattedOffset);
};
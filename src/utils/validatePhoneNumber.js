// Use a single, simplified regex to check for the correct length (10 digits after prefix)
const NIGERIAN_PHONE_REGEX = /^(?:\+?234|0)?(\d{10})$/;

let phoneList = voters
    .map(phoneno => {
        const match = phoneno.match(NIGERIAN_PHONE_REGEX);

        if (match) {
            // The 10-digit number part is captured in match[1]
            const tenDigits = match[1];

            // Reformat to standard 234xxxxxxxxxx (13 digits total)
            return `234${tenDigits}`;
        }

        // If no match, it's invalid
        invalidContactFound = true;
        return null; // Return null or some marker for invalid
    })
    .filter(phone => phone !== null); // Remove the nulls from the list

if (invalidContactFound) {
    Toast.warning("One or more phone numbers not properly formatted");
    return;
}
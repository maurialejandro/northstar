export type parsedLeadFromCSV = {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    county: string;
    private_note: string;
};
export function validateLeads(leads: parsedLeadFromCSV[]) {
    const validLeads: parsedLeadFromCSV[] = [];
    const invalidLeads: parsedLeadFromCSV[] = [];

    // Function to check if a lead is valid
    function isValidLead(lead: parsedLeadFromCSV) {
        // Validation rules: Example rules (modify as needed)
        const isValidName = lead.name.trim() !== '';
        const isValidPhone = lead.phone.trim() !== '';
        const isValidEmail = lead.email.trim() !== '' && lead.email.includes('@');
        const isValidAddress = lead.address.trim() !== '';

        const hasZipCode = lead.zip_code.trim() !== '';

        // Add more validation rules as required

        return isValidName && isValidPhone && isValidEmail && isValidAddress && hasZipCode; // Add more conditions based on your validation criteria
    }

    // Iterate through each lead
    leads.forEach(lead => {
        if (isValidLead(lead)) {
            validLeads.push(lead);
        } else {
            invalidLeads.push(lead);
        }
    });

    return {
        validLeads,
        invalidLeads
    };
}
import { ApiTests, Method, UserLevel } from "../resource_tests.ts";

const apiTests = new ApiTests();
describe("/api/leads is protected by auth", () => {
    beforeAll(async () => {
        await apiTests.loadTestData();
    })

    apiTests.testAuth("/api/leads/admin", true, Method.GET);
    apiTests.testAuth("/api/leads/admin/import-data", true, Method.POST,['Name,Phone Number,Email Address,Address,City,State,Zip Code,County,Private Notes\n,,,,,,,,']);
});

describe("getting", () => {
    beforeEach(async () => {
        await apiTests.loadTestData();
    })

    it("can get all leads as admin", async () => {
        const leadsFromDB = await apiTests.callApi("/api/leads/admin", Method.GET, UserLevel.ADMIN);
        expect(leadsFromDB.status).toBe(200);
        expect(leadsFromDB.body.data.length).toBe(28);

    })

})

describe("import leads", () => {

    beforeAll(async () => {
        await apiTests.loadTestData();
    })

    it('can import validated leads', async () => {
        const leadsWithoutName= '\n,5309998552,christopher.l.garcia@icloud.com,21990 Hillside Dr,Palo Cedro,CA,,SHASTA,XAngel Martinez)'
        const leadsWithoutEmail= '\nEarl Evans,2095649818,,1334 Baxter Ct,Merced,CA,95348,MERCED,XDaniel Alexander)'
        const leadsWithoutPhone= '\nRoy Niederpruem,,Roy.N86@gmail.com,23745 Via Olivia,Murietta,CA,92562,RIVERSIDE,Xluis Venegas)'
        const leadWithoutAddress= '\nLoren Schoenstein,9254574160,lorenelise37@gmail.com,,Walnut Creek,CA,94595,CONTRA COSTA,XDaniel Alexander)'
        const leadWithoutZipCode= '\nAnthony Busamo,2092513176,icycommander16@gmail.com,4000 Fara Biundo Dr Apt 4,Modesto,CA,,STANISLAUS,XFrank Silveria III)'

        function generateLeads(num: number, prefix:string) {
            const leadTemplate = 'Doe,3052972611,Doe@sellmyhouse.com,3040 SW 104th CT,Miami,FL,33165,MIAMI-DADE,XCraig Martinez';

            const generatedLeads = [];
            for (let i = 1; i <= num; i++) {
                const [name, phoneNumber, email, address, city, state, zipCode, county, privateNotes] = leadTemplate.split(',');

                // Extracting the street number
                const streetParts = address.split(' ');
                const streetNumber = parseInt(streetParts[0]) + i; // Incrementing the street number

                // Generating the new lead string with updated street number and index i
                const newLead = `${name}${i},${phoneNumber + prefix + i},${email.split('@')[0]}${prefix + i}@${email.split('@')[1]},${streetNumber + prefix + i} ${streetParts.slice(1).join(' ')},${city},${state},${zipCode},${county},${privateNotes}`;
                generatedLeads.push(newLead);
            }

            const header = 'Name,Phone Number,Email Address,Address,City,State,Zip Code,County,Private Notes';
            const leadsDataString = [header].concat(generatedLeads).join('\n');

            return [leadsDataString];
        }

        // returns failed leads only
        const unparsedLeadsDataString = [`${generateLeads(2, '1')}${leadsWithoutName}${leadsWithoutEmail}${leadsWithoutPhone}${leadWithoutAddress}${leadWithoutZipCode}`]
        const response1 = await apiTests.callApi("/api/leads/admin/import-data", Method.POST, UserLevel.ADMIN, unparsedLeadsDataString);
        expect(response1.status).toBe(200);
        expect(response1.body.invalidLeads.length).toBe(5)
        expect(response1.body.invalidLeads[0].name).toBe('')//lead without name
        expect(response1.body.invalidLeads[1].email).toBe('')//lead without email
        expect(response1.body.invalidLeads[2].phone).toBe('')//lead without phone
        expect(response1.body.invalidLeads[3].address).toBe('')//lead without address
        expect(response1.body.invalidLeads[4].zip_code).toBe('')//lead without zip_code
        expect(response1.body.postedLeads).toBe(2)
        expect(response1.body.duplicatedLeads.length).toBe(0)

        // No failed leads when there are no errors
        const response2 = await apiTests.callApi("/api/leads/admin/import-data", Method.POST, UserLevel.ADMIN, generateLeads(2, '2'));
        expect(response2.status).toBe(200);
        expect(response2.body.invalidLeads.length).toBe(0)
        expect(response2.body.postedLeads).toBe(2)
        expect(response2.body.duplicatedLeads.length).toBe(0)

        // returns 200 when no leads are posted and there are no errors in field validation
        const response3 = await apiTests.callApi("/api/leads/admin/import-data", Method.POST, UserLevel.ADMIN, generateLeads(2, '2'));
        expect(response3.status).toBe(200);
        expect(response3.body.invalidLeads.length).toBe(0)
        expect(response3.body.postedLeads).toBe(0)
        expect(response3.body.duplicatedLeads.length).toBe(2)

        // returns 200 when no leads are posted, but it returns leads that could still be fixed
        const response4 = await apiTests.callApi("/api/leads/admin/import-data", Method.POST, UserLevel.ADMIN, [generateLeads(2,"1")[0] + leadsWithoutEmail]);
        expect(response4.status).toBe(200);
        expect(response4.body.invalidLeads.length).toBe(1)
        expect(response4.body.invalidLeads[0].email).toBe('')//lead without email
        expect(response4.body.postedLeads).toBe(0)
        expect(response4.body.duplicatedLeads.length).toBe(2)

    });

})
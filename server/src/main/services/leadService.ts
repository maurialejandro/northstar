import LeadDAO from '../data/leadDAO';
import { Lead, LeadLabel, ExtendedLead } from '../types/leadTypes.ts';
import { injectable } from "tsyringe";
import { EntityWithCount } from "../types/entityWithCount.ts";
import { LabelColor } from '../types/labelTypes.ts';
import { parsedLeadFromCSV, validateLeads } from "../controllers/validateLeads.ts";
import ActivityService from "./activityService.ts";

type LeadFromCSV = {
    Name: string;
    'Phone Number': string;
    'Email Address': string;
    Address: string;
    City: string;
    State: string;
    'Zip Code': string;
    County: string;
    'Private Notes': string;
};

@injectable()
export default class LeadService {
    constructor(private readonly leadDAO: LeadDAO, private readonly activityService: ActivityService) {}

    async getAllLeads(limit = '50', page = '1'): Promise<EntityWithCount<ExtendedLead[]>> {
        const offset = parseInt(limit) * (parseInt(page) - 1);
        const count = await this.leadDAO.countAllLeads();
        const leads = await this.leadDAO.getAllLeads(parseInt(limit), offset);
        return { data: leads, count };
    }

    async createLead(data: Lead): Promise<Lead> {
        return await this.leadDAO.create(data);
    }

    async getLeadById(id: string): Promise<Lead> {
        return await this.leadDAO.getLeadById(id);
    }

    async updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
        return await this.leadDAO.updateLead(id, data);
    }

    async deleteLead(id: string): Promise<Lead> {
        return await this.leadDAO.deleteLead(id);
    }

    async undeleteLead(id: string): Promise<Lead> {
        return await this.leadDAO.undeleteLead(id);
    }

    async insertManyLeads(csvLeads: string[], adminId: string): Promise<{
        status: number;
        data: {
            invalidLeads: parsedLeadFromCSV[],
            postedLeads: number,
            duplicatedLeads: Partial<Lead>[],
            failedParsingLeads: string[]
        }
    }> {
        const csvLeadsWithoutDoubleQuotes = csvLeads.map(e=> {
            return e.replace(/"/g, '')
        })

        function parseAndTransformCSV(dataString: string): { leads:Partial<Lead>[], failedParsingLeads: string[] } {
            const leadsArray = dataString.split('\n');
            const keys = leadsArray[0].split(',').map((key) => key.trim());

            const leads: (Partial<Lead> & { private_note:string })[] = [];
            const failedParsingLeads: string[] = [];

            for (let i = 1; i < leadsArray.length; i++) {
                try {
                    const leadValues = leadsArray[i].split(',');
                    const leadObject: Partial<LeadFromCSV> = {};
                        keys?.forEach((key, index) => {
                            leadObject[key as keyof LeadFromCSV] = leadValues[index].trim();
                        });

                        const transformedLead = {
                            name: leadObject.Name || '', // Modify transformation logic here if needed
                            phone: leadObject['Phone Number'] || '',
                            email: leadObject['Email Address'] || '',
                            address: leadObject.Address || '',
                            city: leadObject.City || '',
                            state: leadObject.State || '',
                            zip_code: leadObject['Zip Code'] || '',
                            county: leadObject.County || '',
                            private_note: leadObject['Private Notes'] || '',
                        };

                        leads.push(transformedLead);
                    // }
                } catch (e) {
                    console.warn('Lead parsing failed: ' + leadsArray[i] + ' ', e);
                    failedParsingLeads.push(leadsArray[i]);
                }
            }

            return {leads, failedParsingLeads};
        }
        const leads = parseAndTransformCSV(csvLeadsWithoutDoubleQuotes[0]);
        const { invalidLeads, validLeads } = validateLeads(leads.leads as parsedLeadFromCSV[]);

        const attachLeadsToCountyId = async (leads: parsedLeadFromCSV[]): Promise<Partial<Lead>[]> => {
            const counties = await this.leadDAO.getAllCounties();
            const linkedLeads: Partial<Lead>[] = []

            leads.forEach(lead => {
                const leadCounty = counties.find(county => (county.state + county.name).toLowerCase() === (lead.state + lead.county).toLowerCase())
                if (leadCounty) {
                    linkedLeads.push({ ...lead, county_id: leadCounty.id })
                } else {
                    invalidLeads.push(lead)
                }
            })

            return linkedLeads as Partial<Lead>[];

        }
        const postedLeads = [];
        const duplicatedLeads: Partial<Lead>[] = [];
        const attachedLeads = await attachLeadsToCountyId(validLeads);

        const insertLeadPromises = attachedLeads.map(async (lead) => {
            try {
                const privateNote = lead.private_note;
                const leadWithoutPrivateNote = { ...lead };
                delete leadWithoutPrivateNote.private_note;
                const postedLead = await this.leadDAO.insertLead(leadWithoutPrivateNote);
                if (privateNote !== '' && privateNote && postedLead.id) {
                    await this.activityService.create(postedLead.id, adminId, 'private', privateNote)
                }

                postedLeads.push(postedLead);
            } catch (e) {
                duplicatedLeads.push(lead);
            }
        });

        await Promise.all(insertLeadPromises);

        return { status: 200, data: { invalidLeads, postedLeads: postedLeads.length, duplicatedLeads, failedParsingLeads: leads.failedParsingLeads } };

    }

    async createLeadLabel(user_id:string, color:string, text:string): Promise<LeadLabel> {
        return await this.leadDAO.createLeadLabel(user_id, color, text);
    }

    async getLeadLabels(user_id: string): Promise<LeadLabel[]> {
        return await this.leadDAO.getLeadLabels(user_id);
    }

    async deleteLeadLabel(user_id:string,labelId: string): Promise<LeadLabel | null> {
        // if label is not owned by user, return null (resource sends 401 on null)
        const userLabels = await this.leadDAO.getLeadLabels(user_id);
        const containsLabel = userLabels.find((label) => label.id === labelId);
        if (!containsLabel) { return null }
        return await this.leadDAO.deleteLeadLabel(labelId);
    }

    async updateLeadLabel(user_id:string,labelId: string, data:Partial<LeadLabel>): Promise<LeadLabel | null> {
        // if label is not owned by user, return null (resource sends 401 on null)
        const userLabels = await this.leadDAO.getLeadLabels(user_id);
        const containsLabel = userLabels.find((label) => label.id === labelId);
        if (!containsLabel) { return null }
        return await this.leadDAO.updateLeadLabel( labelId, data);
    }

    async assignLabelToLead( labelId: string,leadId: string): Promise<Lead> {
        return await this.leadDAO.assignLabelToLead(labelId, leadId);
    }

    async removeLabelFromLead(leadId: string): Promise<Lead> {
        return await this.leadDAO.removeLabelFromLead(leadId);
    }

    async getAllLabelColors(): Promise<LabelColor> {
        return await this.leadDAO.getAllLabelColors();
    }

}

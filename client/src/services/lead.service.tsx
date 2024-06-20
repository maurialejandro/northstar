import { ExtendedLead, Lead } from "../types/leadTypes.ts";
import { ApiResponse } from "../types/apiResponseType.ts";
import { authProvider, AxiosProvider } from "../config/axiosProvider.ts";
import { EntityWithCount } from "../types/entityWithCount.ts";
import { LabelColor, LeadLabel } from "../types/labelTypes.ts";
import { AxiosResponse } from "axios";

class LeadService {

  constructor(private readonly api: AxiosProvider) { }

  createLead = async (leadData: Lead): Promise<Lead[]> => {
    return await this.api.getApi().post("/api/leads/create", leadData);
  };

  getAllLeads = async (getArchived: boolean, limit: number, page: number): Promise<EntityWithCount<Lead[]>> => {
    return await this.api.getApi().get(`/api/leads/admin?getArchived=${getArchived ? 'true' : 'false'}&limit=${limit}&page=${page}`).then((response) => response.data);

  };

  getLeadById = async (leadId: string | undefined): Promise<ExtendedLead> => {
      return await this.api.getApi().get(`/api/leads/admin/${leadId}`).then((response) => {
        return response.data;
    });
  };

  updateLead = async (leadId: string, updatedFields: Partial<Lead>): Promise<ApiResponse<Lead[]>> => {
    return await this.api.getApi().patch(`/api/leads/${leadId}`, updatedFields);
  };

  deleteLead = async (leadId: string): Promise<ApiResponse<Lead[]>> => {
    return await this.api.getApi().delete(`/api/leads/${leadId}`);
  };

  importLeads = async (
      importedLeads: string[]): Promise<AxiosResponse<{
        postedLeads:number,
        invalidLeads:Partial<Lead>[],
        duplicatedLeads:Partial<Lead>[]
        failedParsingLeads:string[]
  }>> => {
    return await this.api.getApi().post("/api/leads/admin/import-data", importedLeads);
  };

  assignBuyerToLead = async (leadId: string, buyerId: string | null): Promise<ApiResponse<Lead[]>> => {
    return await this.api.getApi().patch(`/api/leads/${leadId}`, { buyer: buyerId });
  }

  getLeadLabels = async (): Promise<LeadLabel[]> => {
        return await this.api.getApi().get(`/api/leads/labels`).then((response) => response.data);
  };

  // add post label
  postLeadLabel = async (body: Partial<LabelColor>): Promise<ApiResponse<Lead>> => {
        return await this.api.getApi().post(`/api/leads/create/label`, body).then((response) => response.data);
  };

  assignLabelToLead = async (body: {label_id: string, lead_id: string}): Promise<ApiResponse<Lead>> => {
        return await this.api.getApi().put(`/api/leads/label/assign`, body);
  }

  getLabelColors = async (): Promise<LabelColor[]> => {
        return await this.api.getApi().get(`/api/leads/label/colors`).then((response) => response.data);
  }

  removeLabel = async (body: { lead_id: string }): Promise<ApiResponse<Lead>> => {
        return await this.api.getApi().put(`/api/leads/label/remove`, body);
  }

}
const leadService = new LeadService(authProvider);

export default leadService;

import { injectable } from 'tsyringe'
import DisputesService from '../services/disputesService.ts'
import { DisputesRate } from '../types/disputesTypes.ts'
@injectable()
export default class AverageWorker {
  constructor(private disputesService: DisputesService) {}

  run = async () => {
    const averageData: DisputesRate = await this.disputesService.getCalculatedAverageDisputeRate()
      const value = averageData.average_dispute
      const context = {
        dispute_count: averageData.dispute_count,
        lead_count: averageData.lead_count,
    }

     await this.disputesService.updateAverageDispute("global_stats", value, context)
    }
  }

import { CountyBid } from '../types/countyBidsType'

export const dataParser = (countyData: CountyBid[]) => {
  return countyData.map((e) => {
    const getPhrase = (wr: number) => {
      if (wr <= 25) {
        return 'Try harder, hombre!'
      } else if (wr <= 50) {
        return 'You might get lucky'
      } else if (wr <= 75) {
        return 'Looking good'
      } else {
        return 'You´re in!'
      }
    }
    return {
      state: e.counties?.state,
      county: e.counties?.name,
      bid_amount: e.bid_amount,
      high_bid: e.high_bid,
      win_rate: e.win_rate,
      ourTake: getPhrase(e.win_rate),
      id: e.id,
      edit: e.id,
      county_id: e.county_id,
    }
  })
}

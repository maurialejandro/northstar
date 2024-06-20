import { Typography } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { Buyer } from '../../../types/buyerType'
import { CountyBid} from '../../../types/countyBidsType'
import CustomButton from '../../mui/Button/CustomButton'
import { BuyerLead } from '../../../types/buyerLeadTypes'
import buyerLeadService from '../../../services/buyer_lead.service'
import { Lead } from '../../../types/leadTypes'
import countyBidService from '../../../services/county_bids.service'
import { useEffect, useState } from 'react'

type Props = {
    interestedBuyers: Buyer[]
    countyBids: CountyBid[]
    setSelectedBuyer: (buyer: Buyer) => void
    setBuyerLead: (buyerLead: BuyerLead) => void
    buyerLead: BuyerLead | undefined
    lead: Lead
    handleClose: () => void
    calculateLastSentDateDifference: (buyers: BuyerLead[]) => string | null
    loadingDisputes: boolean
    buyersDisputes: (CountyBid & { dispute_rate: number })[]
}

type GridColDefWithDisputeRate = GridColDef<{
    id: string;
    name: string;
    bid: number | null;
    last_lead: BuyerLead[] | undefined;
    dispute_rate?: number;
}>;

const ChangeBuyerTable = ({
    interestedBuyers,
    // countyBids,
    setSelectedBuyer,
    setBuyerLead,
    buyerLead,
    lead,
    handleClose,
    calculateLastSentDateDifference,
    loadingDisputes,
    buyersDisputes
}: Props) => {
    const [countyBids, setCountyBids] = useState <CountyBid[]>([])

    useEffect(() => {
        const body = {
            id: lead.id,
            state: lead.state,
            county: lead.county_id.name
        }
        countyBidService.getCountyByLead(body).then((response) => {
            setCountyBids(response.data)
        })
    }, [lead])

    const filteredCountyBids = countyBids.filter((buyer) => buyer !== null);

    const row = filteredCountyBids.map((buyer) => ({
        id: buyer?.users.id?.toString() ?? '',
        name: buyer?.users.name ?? '',
        bid: buyer?.bid_amount ?? null,
        last_lead: buyer?.users?.buyer_leads ?? [],
    }));

    const columns : GridColDefWithDisputeRate[] = [
        {
            field: 'name',
            headerName: 'NAME',
            width: 150
        },
        {
            field: 'bid',
            headerName: 'BID',
            width: 100,
            renderCell: (params) => <span>{`$${params.value}`}</span>,
        },
        {
            field: 'last_lead',
            headerName: 'LAST LEAD',
            width: 100,
            renderCell: (params) => {
                const lastDay = calculateLastSentDateDifference(params.value)
                return (
                    <span>-{lastDay} days</span>
                )
            },
        },
        {
            field: 'dispute_rate',
            headerName: 'DISPUTE RATE',
            width: 150,
            renderCell: (params) => {
                const userMatch = buyersDisputes.find((item) => item.users.id === params.row.id);
                if (loadingDisputes) {
                    return (
                        <span>Loading...</span>
                    )
                }
                return (
                    <span>{`${Math.round((userMatch?.dispute_rate ?? 0) * 100)}%`}</span>
                )
            }
        },
        {
            field: 'action',
            headerName: 'ACTION',
            width: 150,
            renderCell: (params: { row: { id: string } }) => {
                return (
                    <CustomButton
                        onClick={() => {
                            handleBuyerChange(lead.id, params.row.id ? params.row.id : null)
                        }}
                        customSx={{
                            width: '88px',
                            padding: '4px 10px',
                            height: '28px',
                            fontWeight: '600',
                            borderRadius: '4px',
                            boxShadow: '0px 2px 4px -1px rgba(0, 0, 0, 0.20), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12)'
                        }}
                    >Change</CustomButton>
                )
            }
        }
    ]

    async function handleBuyerChange(leadId: string, buyerId: string | null) {
        const newBuyerLead: Partial<BuyerLead> = {
            user_id: buyerId ? null : buyerId,
            lead_id: leadId,
        }
        if (buyerLead) {
                await buyerLeadService.deleteBuyerLead(buyerLead.id);
            }
            const newCreatedBuyerLead = await buyerLeadService.createBuyerLead(newBuyerLead);
            const newSelectedBuyer = interestedBuyers.find((buyer) => {
                return buyer.id === buyerId;
            })
            setSelectedBuyer(newSelectedBuyer!);
            setBuyerLead(newCreatedBuyerLead)
            handleClose()
    }

    return (
        <>
        <Typography sx={{marginLeft:2, marginTop: 2}} variant='h6'>Change Buyer</Typography>
        <DataGrid
            rows={row}
            columns={columns}
            sx={{
                border: '0px',
                p: 2,
                color: '#ffffff',
                ontWeight: '400px',
                width: '100%',
                paddingLeft: '0',
                paddingBottom: '70px',
                paddingRight: '0',
                '& .MuiCheckbox-colorPrimary.Mui-checked': {
                    color: '#01B1F4',
                },
                '.MuiCheckbox-colorPrimary': {
                    color: 'white',
                },
                '.MuiDataGrid-withBorderColor': {
                    borderBottomColor: 'transparent',
                },
                '.MuiDataGrid-row--editing .MuiDataGrid-cell': {
                    backgroundColor: 'transparent',
                 },
                '.MuiDataGrid-row': {
                    border: '1px solid #ffffff',
                    borderLeft: 'none',
                    borderRight: 'none',
                    borderBottom: 'transparent',
                },
                '.MuiDataGrid-columnHeaders': {
                    borderTop: '1px solid #ffffff',
                    borderRadius: 0,
                },
            }}
            hideFooter
            disableColumnMenu={true}
        />
      {/* <Grid sx={{
        position: 'absolute',
        bottom: '10px',
        marginLeft: '70%',
        marginTop: '50px',
      }}
      hideFooter
      disableColumnMenu={true}
      >
        <Pagination sx={{
          'button': {
            color: '#ffffff',
          },
          'Mui-selected': {
            backgroundColor: '#ffffff',
          },
        }}
          count={Math.ceil(row.length / limit)} shape="rounded" page={page} size="large" />
      </Grid> */}
    </>
  )
}

export default ChangeBuyerTable

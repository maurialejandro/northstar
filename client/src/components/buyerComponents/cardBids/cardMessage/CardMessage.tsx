import { Grid, Typography } from '@mui/material'
import ModalAddBids from '../modalAddBids/ModalAddBids'
import { useState } from 'react'
import { County } from '../../../../types/countyType'
import CustomButton from '../../../mui/Button/CustomButton'
import { UpdateBidBuyer } from '../../../../types/countyBidsType'

type Props = {
  getAllStates?: () => Promise<string[]>
  getCountiesByState?: (state: string) => Promise<County[]>
  states: string[]
  selectedState: string | null
  setSelectedState: (arg: string | null) => void
  counties: string[]
  findCountyId: (id: string) => string | undefined
  setUpdateBids: React.Dispatch<React.SetStateAction<UpdateBidBuyer>>
  updateBids: UpdateBidBuyer
  allCountiesQueried: Partial<County>[] | null
}

function CardMessage({
  states,
  selectedState,
  setSelectedState,
  counties,
  findCountyId,
  setUpdateBids,
  updateBids,
  allCountiesQueried,
}: Props) {
  const [openAddBid, setOpenAddBid] = useState<boolean>(false)

  const handleCloseAddBid = () => {
    setOpenAddBid(false)
  }

  return (
    <Grid container>
      <Grid
        item
        xs={12}
        justifyContent='center'
        alignItems='center'
        display='flex'
      >
        <h3>Bid On Your First County!</h3>
      </Grid>
      <Grid
        item
        xs={12}
        justifyContent='start'
        alignItems='center'
        sx={{
          color: '#ffffff',
          pl: 4,
          pr: 4,
        }}
      >
        <h4>
          County Bids allow you to receive leads. You will receive leads when
          you:
        </h4>
      </Grid>
      <Grid
        item
        xs={12}
        justifyContent='start'
        alignItems='center'
        sx={{
          color: '#ffffff',
          pl: 4,
          pr: 4,
        }}
      >
        <h4>a) Have budget remaining to spend</h4>
        <h4>
          b) Are among the group of buyers with the highest bid on the county
          that the lead is in
        </h4>
      </Grid>
      <Grid
        item
        xs={12}
        justifyContent='start'
        alignItems='center'
        sx={{
          color: '#ffffff',
          pl: 4,
          pr: 4,
        }}
      >
        <h4>
          Click{' '}
          <CustomButton
            onClick={() => {
              setOpenAddBid(true)
            }}
            id='basic-button'
            customSx={{
              marginRight: '5px',
              height: '25px',
              width: 'auto',
            }}
          >
            <Typography sx={{ pr: 1, mx: 1, fontSize: '12px' }}>ADD</Typography>
          </CustomButton>
          to create your first county bid
        </h4>
      </Grid>
      <ModalAddBids
        states={states}
        openAddBid={openAddBid}
        handleCloseAddBid={handleCloseAddBid}
        titleText='Add County Bid'
        selectedState={selectedState}
        counties={counties}
        setSelectedState={setSelectedState}
        findCountyId={findCountyId}
        setUpdateBids={setUpdateBids}
        updateBids={updateBids}
        allCountiesQueried={allCountiesQueried}
      />
    </Grid>
  )
}

export default CardMessage

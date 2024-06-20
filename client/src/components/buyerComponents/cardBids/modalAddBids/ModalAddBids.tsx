import { Box, Grid, Modal, Typography } from '@mui/material'
import CustomTextField from '../../../mui/TextField/CustomTextField'
import CustomAutocomplete from '../../../mui/CustomAutocomplete/CustomAutocomplete'
import CustomButton from '../../../mui/Button/CustomButton'
import { useContext, useState } from 'react'
import { UpdateBidBuyer } from '../../../../types/countyBidsType'
import { County } from '../../../../types/countyType'
import countyBidService from '../../../../services/county_bids.service'
import { dataParser } from '../../../../utils/dataParser.utils'
import DataContext from '../../../../context/DataContext'

type Props = {
  openAddBid: boolean
  handleCloseAddBid: () => void
  titleText: string
  states: string[]
  selectedState: string | null
  setSelectedState: (arg: string | null) => void
  counties: string[]
  findCountyId: (id: string) => string | undefined
  setUpdateBids: React.Dispatch<React.SetStateAction<UpdateBidBuyer>>
  updateBids: UpdateBidBuyer
  allCountiesQueried: Partial<County>[] | null
}

export default function ModalAddBids({
  openAddBid,
  handleCloseAddBid,
  titleText,
  states,
  setSelectedState,
  counties,
  setUpdateBids,
  updateBids,
  allCountiesQueried,
}: Props) {
  const { setBidsDataTable } = useContext(DataContext)
  const [countyForm, setCountyForm] = useState<string>('')
  const handleStateChange = (
    _event: React.SyntheticEvent,
    newValue: string | null
  ) => {
    setSelectedState(newValue)
  }
  const handlePostBidChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setUpdateBids({
      ...updateBids,
      [e.target.name]: e.target.value,
    })
  }
  const handleSave = async () => {
    try {
      const countyId = allCountiesQueried?.filter(
        (county) => county.name === countyForm
      )[0].id
      if (countyId) {
        const body = {
          county_id: countyId,
          bid_amount: updateBids.bid_amount,
        }
        await countyBidService.createCountyBid(body)
        const bidsResponse = await countyBidService.getCountyBidByBuyerId()
        bidsResponse && setBidsDataTable(dataParser(bidsResponse))
        handleCloseAddBid()
      }
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <Modal
      open={openAddBid}
      onClose={handleCloseAddBid}
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          borderRadius: '0.4rem',
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography
          id='modal-modal-title'
          variant='h6'
          component='h2'
          align='center'
          marginBottom='10px'
        >
          {titleText}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <CustomAutocomplete
              options={states.map((option) => option)}
              onChange={handleStateChange}
              renderInput={(params) => (
                <CustomTextField
                  {...params}
                  required
                  fullWidth
                  label='Select a Satate'
                  name='State'
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomAutocomplete
              options={counties}
              onChange={(
                _event: React.SyntheticEvent,
                newValue: string | null
              ) => {
                setCountyForm(newValue!)
              }}
              renderInput={(params) => (
                <CustomTextField
                  {...params}
                  required
                  fullWidth
                  label='Select a county'
                  name='county'
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              required
              fullWidth
              label='Bid'
              name='bid_amount'
              type='number'
              onChange={handlePostBidChange}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <CustomButton
              onClick={handleSave}
              customSx={{
               marginRight: '15px',
              }}
            >Save
            </CustomButton>
            <CustomButton
              onClick={handleCloseAddBid}
            >
              Cancel
            </CustomButton>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  )
}

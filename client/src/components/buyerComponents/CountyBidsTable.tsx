import {
  DataGrid,
  GridActionsCellItem,
  GridCellParams,
  GridColDef,
  GridEventListener,
  GridRowClassNameParams,
  GridRowEditStopReasons,
  GridRowId,
  GridRowModel,
  GridRowModes,
  GridRowModesModel,
} from '@mui/x-data-grid'
import styles from './CountyBidsTable.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons'
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Menu,
  MenuItem,
  TextField,
  ThemeProvider,
  createTheme,
} from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { BidRow, CountyBid, UpdateBidBuyer } from '../../types/countyBidsType.ts'
import { County } from '../../types/countyType.ts'
import DataContext from '../../context/DataContext.tsx'
import winRateService from '../../services/win_rate.service.tsx'

type Props = {
  bids: BidRow[]
  bidModesModel: GridRowModesModel
   handleSaveKeyDown: (
    id: GridRowId,
    county_id: string | undefined
  ) => (event: React.KeyboardEvent<HTMLButtonElement>) => Promise<void>;
  handleCancelClick: (
    id: GridRowId
  ) => (event: React.MouseEvent<HTMLButtonElement>) => void
  handleBidModesModelChange: (newBidModesModel: GridRowModesModel) => void
  setBids: React.Dispatch<React.SetStateAction<BidRow[]>>
  setBidModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>
  rowSelectionModel: (string | GridRowId)[]
  setRowSelectionModel: React.Dispatch<
    React.SetStateAction<(string | GridRowId)[]>
  >
  handleBidsBulkDelete: (
    rowSelectionModel: (string | GridRowId)[]
  ) => Promise<void>
  getAllStates: () => Promise<string[]>
  getCountiesByState: (state: string) => Promise<County[]>
  selectedState: string | null
  setSelectedState: (arg: string) => void
  states: string[]
  counties: string[]
  allCountiesQueried: Partial<County>[]
  findCountyId: (id: string) => string | undefined
  setUpdateBids: React.Dispatch<React.SetStateAction<UpdateBidBuyer>>
  updateBids: UpdateBidBuyer
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>
  editMode: boolean
  // handleSaveClick: (id: GridRowId, county_id: string | undefined) => (event: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
   handleSaveClick: (id: GridRowId, county_id: string | undefined) => () => Promise<void>
  setSelectedCountyId: (arg: string) => void
  countiesById: CountyBid[]
  highBid: number
  setHighBid: React.Dispatch<React.SetStateAction<number>>
    lowBid: number;
    setLowBid: React.Dispatch<React.SetStateAction<number>>;
    setSelectedLowBid: React.Dispatch<React.SetStateAction<boolean>>;
    selectedLowBid: boolean;
    activateLabel: boolean;
    setActivateLabel: React.Dispatch<React.SetStateAction<boolean>>;
    winRate: number | null;
    setWinRate: React.Dispatch<React.SetStateAction<number | null>>;
}

const theme = createTheme({
  components: {
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          color: '#fff',
        },
      },
    },
  },
})

const checkboxClasses = {
  checkboxInput: styles.customCheckboxInput, // Custom CSS class for the checkbox input
}

export default function CountyBidsTable({
  bids,
  setBids,
  bidModesModel,
  handleCancelClick,
  handleSaveKeyDown,
  handleBidModesModelChange,
  setBidModesModel,
  rowSelectionModel,
  setRowSelectionModel,
  handleBidsBulkDelete,
  setSelectedState,
  states,
  counties,
  findCountyId,
  setUpdateBids,
  updateBids,
  editMode,
  handleSaveClick,
  setSelectedCountyId,
  allCountiesQueried,
  countiesById,
  highBid,
  setHighBid,
    lowBid,
    setLowBid,
    setSelectedLowBid,
    selectedLowBid,
    activateLabel,
    setActivateLabel,
    winRate,
    setWinRate,
}: Props) {
  const { setBidsDataTable, bidsDataTable } = useContext(DataContext)
    const [selectedCounty, setSelectedCounty] = useState<boolean>(false)
    const [county, setCounty] = useState<string>('')
    const [state, setState] = useState<string>('')
    const [loadingWinRate, setLoadingWinRate] = useState<boolean>(false)
    const [bidAmount, setBidAmount] = useState<number>(lowBid)

    const getWinRate = async (state: string, county: string, bid_amount: number) => {
        return await winRateService.getWinRate(state, county, bid_amount)
    }

    useEffect(() => {
        setLoadingWinRate(true)
        const timer = setTimeout(() => {
            if (county && state) {
                getWinRate(state, county, bidAmount).then((response) => {
                    setWinRate(response.win_rate)
                    setLoadingWinRate(false)
                })
            }
        }, 2000);

        return () => {
            clearTimeout(timer);
        }
    }, [county, state, updateBids, setWinRate, bidAmount, highBid])

    useEffect(() => {
        if (selectedCounty) {
            let maxBidAmount = 0;
            let minBidAmount = Number.MAX_VALUE;
            countiesById.forEach(item => {
                if (item.bid_amount !== null && item.bid_amount > maxBidAmount) {
                    maxBidAmount = item.bid_amount;
                    setHighBid(maxBidAmount)
                    setBidAmount(maxBidAmount)
                }
                if (item.bid_amount !== null && item.bid_amount < minBidAmount) {
                    minBidAmount = item.bid_amount;
                    setSelectedLowBid(true)
                    setLowBid(minBidAmount);
                }
            });
            if (countiesById.length === 0) {
                setSelectedLowBid(true)
                setLowBid(40);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [countiesById, selectedCounty])

  const handleTableUpdate = (params: GridRowModel) => {
    const updatedTableData = bidsDataTable.map((row) => {
      if (row.id === params.id) {
        return {
          ...row,
          state: params.row.state,
          county: params.row.county,
          bid_amount: params.row.bid_amount,
        }
      }
      return row
    })
    setBidsDataTable(updatedTableData)
  }

  const rows = bidsDataTable.map((bid: BidRow) => {
    return {
      id: bid.id,
      state: bid.state,
      county: bid.county,
      bid_amount: bid.bid_amount,
      county_id: bid.county_id,
      high_bid: bid.high_bid,
      win_rate: bid.win_rate,
      ourTake: bid.ourTake,
    }
  })

  const columns: GridColDef[] = [
    {
      field: 'state',
      headerName: 'State',
      width: 175,
      renderCell: (params) => {
        const isInEditMode =
          bidModesModel[params.id]?.mode === GridRowModes.Edit
        if (isInEditMode) {
          return (
            <Autocomplete
              sx={{
                width: '100%',
                color: '#ffffff',
                fontWeight: '700px',
                '& .MuiInputBase-root': { color: '#ffffff' },
                '& .MuiOutlinedInput-notchedOutline': { borderWidth: '0px' },
              }}
              value={params.value}
              options={states.map((option) => option)}
              onChange={(_event, value: string) => {
                setBidModesModel((oldModel) => ({
                  ...oldModel,
                  [params.id]: {
                    mode: GridRowModes.Edit,
                    fieldToFocus: 'state',
                  },
                }))

                setSelectedState(value)
                params.row.state = value
                handleTableUpdate(params)
                setState(value)
              }}
              renderInput={(params) => <TextField {...params} />}
            />
          )
        }
      },
      valueGetter: (params) => {
        return params.row.state
      },
    },
    {
      field: 'county',
      headerName: 'County',
      width: 175,
      renderCell: (params) => {
        const isInEditMode =
          bidModesModel[params.id]?.mode === GridRowModes.Edit
        if (isInEditMode) {
          return (
            <Autocomplete
              sx={{
                borderRadius: '0px',
                width: '100%',
                fill: '#fff',
                color: '#ffffff',
                fontWeight: '500px',
                '& .MuiInputBase-root': { color: '#ffffff' },
                '& .MuiOutlinedInput-notchedOutline': { borderWidth: '0px' },
                'MuiIconButton-root-MuiAutocomplete-popupIndicator': {
                  color: '#ffffff',
                },
              }}
              value={params.value}
              options={counties}
              onChange={(_event, value) => {
                setBidModesModel((oldModel) => ({
                  ...oldModel,
                  [params.id]: {
                    mode: GridRowModes.Edit,
                    fieldToFocus: 'county',
                  },
                }))
                params.row.county = value
                handleTableUpdate(params)
                const countyId = allCountiesQueried.find((county) => county.name === params.row.county)?.id
                setSelectedCountyId(countyId!)
                setSelectedCounty(true)
                setCounty(value)
              }}
              renderInput={(params) => <TextField {...params} />}
            />
          )
        }
      },
      valueGetter: (params) => {
        return params.row.county
      },
    },
    {
      width: 150,
      field: 'bid_amount',
      headerName: 'My Bid',
      headerClassName: styles.header,
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => {
        const isInEditMode =
          bidModesModel[params.id]?.mode === GridRowModes.Edit
        if (selectedLowBid && isInEditMode) {
          return (
            <TextField
              sx={{
                width: '100%',
                color: 'red',
                fontSize: '12px',
                fontFamily: 'roboto',
                '& .MuiInputBase-root': { color: '#ffffff' },
                '& .MuiOutlinedInput-notchedOutline': { borderWidth: '0px' },
                '& Button': { color: '#fff' },
                "& .MuiFormLabel-root": {
                    color: "red",
                    top: "9px",
                },
                '& .MuiFormLabel-root.Mui-focused': {
                    color: "red",
                    top: "9px",
                },
              }}
              defaultValue={lowBid}
              value={params.value === 0 ? lowBid : params.value}
              type='number'
              label={activateLabel ? 'Min $ 40' : ''}
              onChange={(e) => {
                setBidAmount(Number(e.target.value))
                setBidModesModel((oldModel) => ({
                  ...oldModel,
                  [params.id]: {
                    mode: GridRowModes.Edit,
                    fieldToFocus: 'bid_amount',
                  },
                }))
                params.row.bid_amount = e.target.value
                setUpdateBids({
                  ...updateBids,
                  bid_amount: Number(e.target.value),
                })
                handleTableUpdate(params)
                  if (Number(e.target.value) < 40) {
                      setActivateLabel(true)
                  } else {
                      setActivateLabel(false)
                  }
              }}
              onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
                if (event.key === 'Enter') {
                handleSaveKeyDown(params.id, findCountyId(String(params.id)))
                }
              }}
            />
          )
        } return (
            <span>
                {
                    `$${params.row.bid_amount}`
                }
              </span>
        )
      },
    },
    {
      width: 100,
      field: 'high_bid',
      headerName: 'High Bid',
      editable: false,
      headerClassName: styles.header,
      renderCell: (params) => {
        if (params.row.id.length > 6) {
          return `$${params.value}`
        } else {
          return `$${highBid}`
        }
      },
    },
    {
      width: 100,
      field: 'win_rate',
      headerName: 'Win Rate',
      editable: false,
      headerClassName: styles.header,
      renderCell: (params) => {
        const isInEditMode =
          bidModesModel[params.id]?.mode === GridRowModes.Edit

        if (loadingWinRate && isInEditMode && county) {
            return <CircularProgress sx={{ color:'#fff'}} size={25} />
        }
        if (params.row.id.length > 6) {
            return `${params.value}%`
        } else {
            return `${winRate!}%`
        }
      },
    },
    {
      minWidth: 150,
      field: 'ourTake',
      headerName: 'Our Take',
      editable: false,
      headerClassName: styles.header,
      renderCell: (params) => (
        <div>
          <FontAwesomeIcon className={styles.statusCircle} icon={faCircle} />{' '}
          {params.value}
        </div>
      ),
    },
    {
      field: 'edit',
      headerName: ' ',
      editable: false,
      headerClassName: styles.header,
      flex: 1,
      type: 'actions',
      align: 'right',
      getActions: ({ id }) => {
        const isInEditMode = bidModesModel[id]?.mode === GridRowModes.Edit
        // TODO this two might end up staying like this, correcting its type seems to be harder than its worth
        // eslint-disable-next-line
        const [anchorEl, setAnchorEl] = useState(null)
        // eslint-disable-next-line
        const handleOpenMenu = (event: any) => {
          setAnchorEl(event.currentTarget)
        }

        const handleCloseMenu = () => {
          setAnchorEl(null)
        }

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={
                <Button
                  tabIndex={0}
                  disabled={activateLabel ? true : false}
                  sx={{
                    backgroundImage:
                      'linear-gradient(180deg, #FFD056 0%, #FF800B 100%)',
                    color: '#000000',
                    fontSize: '13px',
                    mx: 0,
                    height: '30px',
                    width: 75,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 2,
                    borderRadius: 1,
                  }}
                >
                  {
                    editMode ? 'ADD' : 'UPDATE'
                  }
                </Button>
              }
              label='Save'
              onClick={handleSaveClick(id, findCountyId(String(id)))}
              onKeyDown={(event: React.KeyboardEvent<HTMLButtonElement>) => {
                handleSaveKeyDown(id, findCountyId(String(id)))(event)
              }}
            />,
            <GridActionsCellItem
              icon={
                <Box
                  sx={{
                    backgroundImage: 'transparent',
                    fontSize: '13px',
                    mx: 0,
                    height: '30px',
                    width: 75,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 2,
                    color: '#fff',
                    border: '1px solid #fff',
                    borderRadius: 1,
                  }}
                >
                  CANCEL
                </Box>
              }
              label='Cancel'
              className='textPrimary'
              onClick={handleCancelClick(id)}
              color='inherit'
            />,
          ]
        }
        return [
          <GridActionsCellItem
            sx={{ display: 'flex', justifyContent: 'end', width: '100%' }}
            icon={
              <FontAwesomeIcon
                className={styles.ellipsisVertical}
                icon={faEllipsisVertical}
              />
            }
            label='options'
            className='textPrimary'
            onClick={handleOpenMenu}
            color='inherit'
          />,
          <GridActionsCellItem
            sx={{ display: 'flex', justifyContent: 'end', width: '100%' }}
            icon={
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
              >
                <MenuItem
                  onClick={() => {
                    setSelectedLowBid(true)
                    setBidModesModel((oldModel) => ({
                      ...oldModel,
                      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'state' },
                    }))
                  }}
                >
                  Edit
                </MenuItem>
                <MenuItem onClick={() => {
                  handleBidsBulkDelete([id])
                }}>
                  Delete
                </MenuItem>
              </Menu>
            }
            label='options'
            className='textPrimary'
            onClick={handleCloseMenu}
            color='inherit'
          />,
        ]
      },
    },
  ]

  // Used to style data grid rows
  const getRowClassName = (params: GridRowClassNameParams) => {
    const classNames = [styles.row]
    const isLastRow = params.isLastVisible
    if (isLastRow) {
      classNames.push(styles.lastRow)
    }
    return classNames.join(' ')
  }

  // Used to style data grid cells
  const getCellClassName = (params: GridCellParams) => {
    const classNames = [styles.row]
    if (
      params.field === 'ourTake' ||
      params.field === 'winRate' ||
      params.field === 'highBid'
    ) {
      classNames.push(styles.nonModifiableCells)
    }
    if (
      params.field === 'state' ||
      params.field === 'county' ||
      params.field === 'bid_amount'
    ) {
      classNames.push(styles.modifiableCells)
    }
    if (params.formattedValue === 'Try harder, hombre!') {
      classNames.push(styles.redCircle)
    }
    if (params.formattedValue === 'You might get lucky') {
      classNames.push(styles.orangeCircle)
    }
    if (params.formattedValue === 'Looking good') {
      classNames.push(styles.darkGreenCircle)
    }
    if (params.formattedValue === 'You´re in!') {
      classNames.push(styles.strongGreenCircle)
    }
    if (params.formattedValue === 'Pending') {
      classNames.push(styles.disabledCircle)
    }
    if (params.field === 'state') {
      classNames.push(styles.strong)
    }
    return classNames.join(' ')
  }

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (
    params,
    event
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true
    }
  }

  // Used to update row after editing
  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };
    setBids(bids.map((bid: BidRow) => (bid.id === newRow.id ? updatedRow : bid)) as BidRow[]);
    return updatedRow;
  };

  return (
    <ThemeProvider theme={theme}>
      <DataGrid
        rows={rows}
        editMode='row'
        columns={columns}
        checkboxSelection
        onRowSelectionModelChange={(newRowSelectionModel) => {
          setRowSelectionModel(newRowSelectionModel) // Update the state with the selected rows
        }}
        rowSelectionModel={rowSelectionModel}
        disableRowSelectionOnClick
        getRowId={(row) => row.id}
        getRowClassName={getRowClassName}
        getCellClassName={getCellClassName}
        rowModesModel={bidModesModel}
        onRowModesModelChange={handleBidModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        sx={{
          border: '0px',
          p: 2,
          color: '#ffffff',
          fontWeight: '400px',
          '& .MuiCheckbox-colorPrimary.Mui-checked': {
            color: '#01B1F4',
          },
          '.MuiCheckbox-colorPrimary': {
            color: 'white',
          },
          '.MuiDataGrid-withBorderColor': {
            borderBottomColor: 'rgba(217, 217, 217, 0.3)',
          },
          '.MuiDataGrid-row--editing .MuiDataGrid-cell': {
            backgroundColor: 'transparent',
            color: '#ffffff',
          },
        }}
        hideFooter
        classes={checkboxClasses}
        disableColumnMenu={true}
      />
    </ThemeProvider>
  )
}
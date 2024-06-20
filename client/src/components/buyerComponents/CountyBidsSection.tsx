import { Button, Grid, Menu, MenuItem, Typography } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretDown, faChevronDown, faChevronRight, faCircle, faLocationDot } from '@fortawesome/free-solid-svg-icons'
import CountyBidsTable from './CountyBidsTable'
import { BidRow, CountyBid, UpdateBidBuyer } from '../../types/countyBidsType.ts'
import countyBidService from '../../services/county_bids.service'
import { GridRowId, GridRowModes, GridRowModesModel } from '@mui/x-data-grid'
import DeleteModal from '../DeleteModal'
import CardMessage from './cardBids/cardMessage/CardMessage.tsx'
import { County } from '../../types/countyType.ts'
import DataContext from '../../context/DataContext.tsx'
import { dataParser } from '../../utils/dataParser.utils.tsx'

function CountyBidsSection() {
    const { bidsDataTable, setBidsDataTable } = useContext(DataContext)
    const [display, setDisplay] = useState<boolean>(false)
    const [selectedCountiesCount, setSelectedCountiesCount] = useState<string>('No Counties')
    const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false)
    const [bids, setBids] = useState<BidRow[]>([])
    const [bidModesModel, setBidModesModel] = useState<GridRowModesModel>({})
    const [rowSelectionModel, setRowSelectionModel] = useState<(string | GridRowId)[]>([])
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [selectedState, setSelectedState] = useState<string | null>('')
    const [states, setStates] = useState<string[]>([])
    const [counties, setCounties] = useState<(string)[]>([])
    const [allCountiesQueried, setAllCountiesQueried] = useState<Partial<County>[]>([])
    const [loadingBids, setLoadingBids] = useState<boolean>(false)
    const [editMode, setEditMode] = useState<boolean>(false)
    const [selectedCountyId, setSelectedCountyId] = useState<string>('')
    const [countiesById, setCountiesById] = useState<CountyBid[]>([])
    const [highBid, setHighBid] = useState<number>(0)
    const [lowBid, setLowBid] = useState<number>(40)
    const [selectedLowBid, setSelectedLowBid] = useState<boolean>(false)
    const [updateBids, setUpdateBids] = useState<UpdateBidBuyer>({
        county_id: '',
        bid_amount: lowBid
    });
    const [activeLabel, setActiveLabel] = useState<boolean>(false)
    const [winRate, setWinRate] = useState<number | null>(0);

    const open = Boolean(anchorEl)

    const items = [
        {
            text: selectedCountiesCount,
            color: '#01B1F4',
            pxSmall: '18',
            pxBig: '24px',
            icon: faLocationDot,
        },
        {
            text: 'Top Bid: 5 Counties',
            color: '#12974B',
            pxSmall: '10',
            pxBig: '24px',
            icon: faCircle,
        },
        {
            text: 'Viable: 4 Counties',
            color: '#A9571B',
            pxSmall: '10',
            pxBig: '24px',
            icon: faCircle,
        },
        {
            text: 'Not Viable: 3 Counties',
            color: '#B62A2A',
            pxSmall: '10',
            pxBig: '24px',
            icon: faCircle,
        },
    ]

    useEffect(() => {
        setLoadingBids(true)
        getCountyBids().then((data) => {
            if (data) {
                setBidsDataTable(dataParser(data))
                if (bidsDataTable) {
                    if (bidsDataTable.length <= 0) {
                        setSelectedCountiesCount('No Counties')
                    } else if (bidsDataTable.length === 1) {
                        setSelectedCountiesCount('1 County')
                    } else if (bidsDataTable.length > 1) {
                        setSelectedCountiesCount(bidsDataTable.length + ' Counties')
                    }
                }

            }
            setLoadingBids(false)
        })
    }, [ bidsDataTable, setBidsDataTable])

    // loads counties

    useEffect(() => {
        if (selectedState === null || selectedState === '') {
            return
        }
        getCountiesByState(selectedState).then((res) => {
            if (res) {
                const parsedCounties = res.map((county: Partial<County>) => {
                    return county.name
                })
                setAllCountiesQueried((prev) => {
                    return [...prev, ...res]
                })
                setCounties(parsedCounties as string[])
            }
        })
    }, [selectedState])

    // load counties by id when selectedCountyId changes

    useEffect(() => {
        if (selectedCountyId === '' || selectedCountiesCount === null) {
            return
        }
        getCountyById(selectedCountyId).then((res) => {
            setCountiesById(res)
        })
    }, [selectedCountyId, selectedCountiesCount])

    // loads states

    useEffect(() => {
        getAllStates().then((res) => {
            res && setStates(res)
        })
    }, [])

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleBidsBulkDelete = async (
        rowSelectionModel: (string | GridRowId)[]
    ) => {
        await countyBidService.bulkDeleteCountyBids(rowSelectionModel)
        // Updates table
        const bidsResponse = await getCountyBids()
        bidsResponse && setBidsDataTable(dataParser(bidsResponse))
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const getAllStates = async () => {
        return await countyBidService.getAllStates()
    }
    const getCountiesByState = async (state: string) => {
        return await countyBidService.getCountiesByState(state)
    }

    const getCountyBids = async () => {
        return await countyBidService.getCountyBidByBuyerId()
    }

    const getCountyById = async (id: string) => {
        return await countyBidService.getCountyById(id)
    }

    const handleItemClick = (item: string) => {
        setSelectedCountiesCount(item)
        setDisplay(true)
    }

    // Add New Row
    const handleAddNewBid = () => {
        setEditMode(true)
        const id = Math.round(Math.random() * 100000)
        const newBid = {
            state: null,
            county: null,
            bid_amount: 0,
            highBid: 0,
            win_rate: 0,
            ourTake: 'Pending',
            id,
            edit: '',
            isNew: true,
            county_id: ""
        }
        setBidsDataTable([
            newBid,
            ...bidsDataTable
        ])
        setBidModesModel((oldModel) => ({
            ...oldModel,
            [id]: {mode: GridRowModes.Edit, fieldToFocus: 'state'},
        }))
    }

    // Cancel edit and removes Row from table
    const handleCancelClick = (id: GridRowId) => async () => {
        setBidModesModel({
            ...bidModesModel,
            [id]: {mode: GridRowModes.View, ignoreModifications: true},
        })
        // Deletes Row from table
        if (String(id).length < 6) {
            setBids(bids.filter((e) => e.id !== id))
        }
        // Updates table
        await getCountyBids().then((bidsResponse) => {
            setBidsDataTable(dataParser(bidsResponse))
        })
        setEditMode(false)
        setLowBid(40)
        setSelectedLowBid(false)
        setSelectedCountyId('')
        setWinRate(0)
    }

    // Saves Row in table

    const handleSaveKeyDown = (id: GridRowId, county_id: string | undefined) => async (
        event: React.KeyboardEvent<HTMLButtonElement>
    ): Promise<void> => {
        if (event.key === "Enter") {
            const bid = bidsDataTable.find((e) => e.id === id) as Partial<BidRow>
            setBidModesModel({...bidModesModel, [id]: {mode: GridRowModes.View}})
            // if id is less than 6 digits, it means it is a new row, so it will be updateBids
            if (String(id).length < 6) {
                const newBid = {
                    county_id: county_id as string,
                    bid_amount: Number(bid.bid_amount),
                }
                if (newBid.bid_amount >= 0) {
                    await countyBidService.createCountyBid(newBid)
                }
                // else it will be updated
            } else {
                const updatedBid = {
                    id: bid.id,
                    updatedData: {
                        county_id,
                        bid_amount: Number(bid.bid_amount),
                    },
                }
                await countyBidService.updateCountyBid(updatedBid)
            }
            // Updates table
            const bidsResponse = await getCountyBids()
            bidsResponse && setBidsDataTable(dataParser(bidsResponse))

            if (editMode) {
                setEditMode(false)
            }
        }
    }

    const handleSaveClick = (id: GridRowId, county_id: string | undefined) => async () => {
        if (activeLabel) {
            return
        }
        const bid = bidsDataTable.find((e) => e.id === id) as Partial<BidRow>
        setBidModesModel({...bidModesModel, [id]: {mode: GridRowModes.View}})
        // if id is less than 6 digits, it means it is a new row, so it will be updateBids
        if (String(id).length < 6) {
            const newBid = {
                county_id: county_id as string,
                bid_amount: bid.bid_amount === 0 ? lowBid : Number(bid.bid_amount),
            }
            if (newBid.bid_amount >= 0) {
                await countyBidService.createCountyBid(newBid)
            }
            // else it will be updated
        } else {
            const updatedBid = {
                id: bid.id,
                updatedData: {
                    county_id,
                    bid_amount: Number(bid.bid_amount),
                },
            }
            await countyBidService.updateCountyBid(updatedBid)
        }
        // Updates table
        const bidsResponse = await getCountyBids()
        bidsResponse && setBidsDataTable(dataParser(bidsResponse))
        setHighBid(0)
        setLowBid(40)
        setSelectedLowBid(false)

        if (editMode) {
            setEditMode(false)
        }
    }

    const handleBidModesModelChange = (newBidModesModel: GridRowModesModel) => {
        setBidModesModel(newBidModesModel)
    }
    // finds the countyId by bidId
    const findCountyId = (id: string) => {
        const row = bidsDataTable.find((bid) => String(bid.id) === id)
        return allCountiesQueried.find((county) => county.name === row?.county)?.id
    }

    // TODO: Add loading spinner
    if (loadingBids) {
        return (
            <>
                loading...
            </>
        )

    }

    if (!bidsDataTable || bidsDataTable.length === 0) {
        return (
            <Grid
                item
                sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.4rem',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                xs={12}
            >
                <CardMessage
                    states={states}
                    selectedState={selectedState}
                    setSelectedState={setSelectedState}
                    counties={counties}
                    findCountyId={findCountyId}
                    setUpdateBids={setUpdateBids}
                    updateBids={updateBids}
                    allCountiesQueried={allCountiesQueried}
                />
            </Grid>
        )
    }

    return (
        <Grid
            item
            sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '0.4rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
            xs={12}
        >
            <Grid container>
                {display
                    ? (<>
                        <Grid
                            item
                            sx={{
                                my: 2,
                                mx: 4,
                                display: 'flex',
                                justifyContent: 'start',
                                alignItems: 'start',
                                fontSize: '18px',
                                fontWeight: 500,
                                lineHeight: '24px',
                                letterSpacing: '0px',
                                color: '#ffffff',
                            }}
                            xs={10}
                        >
                            My County Bids
                        </Grid>
                        <Grid
                            item
                            xs={1}
                            sx={{
                                my: 2,
                                display: 'flex',
                                justifyContent: 'end',
                                alignItems: 'end',
                                fontSize: '24px',
                                color: '#ffffff',
                            }}
                        >
                            <FontAwesomeIcon
                                style={{cursor: 'pointer'}}
                                onClick={() => {
                                    setDisplay(!display)
                                }}
                                icon={faChevronDown}
                            />
                        </Grid>
                    </>)
                    : (<Grid
                            item
                            sx={{
                                my: 2,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '68px',
                                fontSize: '18px',
                                fontWeight: 500,
                                lineHeight: '24px',
                                letterSpacing: '0px',
                                color: '#ffffff',
                            }}
                            xs={2}
                        >
                            My County Bids
                        </Grid>
                    )}

                <>
                    {items.map((item) => {
                        return (
                            <Grid
                                onClick={() => {
                                    handleItemClick(item.text)
                                }}
                                key={item.text}
                                item
                                sx={{
                                    my: 2,
                                    pb: 2,
                                    marginBottom: '-1px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexDirection: display ? 'row' : 'column',
                                    height: display ? '24px' : '68px',
                                    color: display ? '#FFFFFFDE' : '#FFFFFFDE',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    borderBottom:
                                        display && item.text === selectedCountiesCount
                                            ? '5px #01B6F8 solid'
                                            : '5px solid transparent',
                                }}
                                xs={display ? 2.2 : 2}
                            >
                                <FontAwesomeIcon
                                    style={{
                                        fontSize: display ? item.pxSmall : item.pxBig,
                                        color: item.color,
                                        margin: display ? '0 8px 0 0' : '0 0 8px 0',
                                    }}
                                    icon={item.icon}
                                />
                                {item.text}
                            </Grid>
                        )
                    })}
                </>
                {display && (
                    <Grid
                        item
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '14px',
                            alignItems: 'center',
                            color: '#FFFFFFDE',
                            cursor: 'pointer',
                        }}
                        xs={3.2}
                    >
                        <Button
                            variant='contained'
                            onClick={() => {
                                handleAddNewBid()
                            }}
                            sx={{
                                backgroundImage:
                                    'linear-gradient(180deg, #FFD056 0%, #FF800B 100%)',
                                color: '#000000',
                                fontSize: '13px',
                                mx: 0,
                                height: '30px',
                            }}
                        >
                            +ADD
                        </Button>
                        <div>
                            <Button
                                id='basic-button'
                                aria-controls={open ? 'basic-menu' : undefined}
                                aria-haspopup='true'
                                aria-expanded={open ? 'true' : undefined}
                                onClick={handleClick}
                                sx={{
                                    backgroundImage:
                                        'linear-gradient(180deg, #FFD056 0%, #FF800B 100%)',
                                    color: '#000000',
                                    fontSize: '13px',
                                    height: '30px',
                                }}
                            >
                                <Typography
                                    sx={{
                                        borderRight: '1px solid #000',
                                        pr: 1,
                                        mx: 1,
                                        fontSize: '13px',
                                    }}
                                >
                                    BULK ACTIONS
                                </Typography>
                                <FontAwesomeIcon icon={faCaretDown}/>
                            </Button>
                            <Menu
                                id='basic-menu'
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleClose}
                                MenuListProps={{
                                    'aria-labelledby': 'basic-button',
                                }}
                            >
                                <MenuItem
                                    value={'delete'}
                                    onClick={() => {
                                        rowSelectionModel.length > 0 && setDeleteModalOpen(true)
                                        handleClose()
                                    }}
                                >
                                    Delete
                                </MenuItem>
                                <MenuItem value={'option'} onClick={handleClose}>
                                    Option 2
                                </MenuItem>
                                <MenuItem value={'option'} onClick={handleClose}>
                                    Option 3
                                </MenuItem>
                            </Menu>
                        </div>
                    </Grid>
                )}

                {!display && (
                    <Grid
                        item
                        xs={2}
                        sx={{
                            my: 2,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '68px',
                            fontSize: '24px',
                            color: '#ffffff',
                            cursor: 'pointer',
                        }}
                        onClick={() => {
                            setDisplay(!display)
                        }}
                    >
                        <FontAwesomeIcon icon={faChevronRight}/>
                    </Grid>
                )}
                {display && (
                    <Grid
                        item
                        sx={{borderTop: '1px solid rgba(217, 217, 217, 0.3) '}}
                        xs={12}
                    >
                        <CountyBidsTable
                            allCountiesQueried={allCountiesQueried}
                            states={states}
                            selectedState={selectedState}
                            setSelectedState={setSelectedState}
                            counties={counties}
                            findCountyId={findCountyId}
                            getAllStates={getAllStates}
                            getCountiesByState={getCountiesByState}
                            setBidModesModel={setBidModesModel}
                            bids={bids}
                            setBids={setBids}
                            handleSaveKeyDown={handleSaveKeyDown}
                            handleCancelClick={handleCancelClick}
                            handleBidModesModelChange={handleBidModesModelChange}
                            bidModesModel={bidModesModel}
                            rowSelectionModel={rowSelectionModel}
                            setRowSelectionModel={setRowSelectionModel}
                            handleBidsBulkDelete={handleBidsBulkDelete}
                            setUpdateBids={setUpdateBids}
                            updateBids={updateBids}
                            setEditMode={setEditMode}
                            editMode={editMode}
                            handleSaveClick={handleSaveClick}
                            setSelectedCountyId={setSelectedCountyId}
                            countiesById={countiesById}
                            highBid={highBid}
                            setHighBid={setHighBid}
                            lowBid={lowBid}
                            setLowBid={setLowBid}
                            setSelectedLowBid={setSelectedLowBid}
                            selectedLowBid={selectedLowBid}
                            activateLabel={activeLabel}
                            setActivateLabel={setActiveLabel}
                            winRate={winRate}
                            setWinRate={setWinRate}
                        />
                    </Grid>
                )}
            </Grid>
            <DeleteModal
                open={deleteModalOpen}
                handleClose={() => {
                    setDeleteModalOpen(!deleteModalOpen)
                }}
                handleDelete={() => {
                    handleBidsBulkDelete(rowSelectionModel)
                }}
                titleText={'Are you sure?'}
                messageText={`Click "Delete" to delete the ${rowSelectionModel.length} selected county bids. Click cancel if this is not what you intended.`}
            />
        </Grid>
    )
}

export default CountyBidsSection
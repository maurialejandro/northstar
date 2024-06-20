import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {Box, Button, FormControlLabel, FormGroup, Grid, Popover, Switch, Typography} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import {useEffect, useState} from "react";

type Props = {
    dateRange: string[];
    setDateRange: (dateRange: string[]) => void;
    tableName: string;
}

export default function DateFilter({ dateRange, setDateRange, tableName }: Props) {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [selectedFromDate, setSelectedFromDate] = useState<Date | null>(null);
    const [selectedToDate, setSelectedToDate] = useState<Date | null>(null);
    const today = new Date();
    const [isSingleDay, setIsSingleDay] = useState<boolean>(false);

    const formatDate = (date: string) => {
        if (date === "") return date
        return new Date(date).toLocaleDateString();
    }

    const buttonText = () => {
        const [start, end] = dateRange.map(formatDate);
        const todayStr = formatDate(today.toDateString());
        if (!start && !end) return '- select dates -';
        // if both dates are the same && start date is today, return 'Today' else return the date
        if (start === end) return start === todayStr ? 'Today' : start;
        // if end date is today, return 'start - Today'
        if (end === todayStr) return `${start || ''} - Today`;
        // if start date is today && not end, return 'Today'
        if (start === todayStr && !end) return 'Today';
        // return both dates
        return `${start || ''}${start && end ? ' - ' : ''}${end || ''}`;
    };

    useEffect(() => {
        if (dateRange[0] === '') setSelectedFromDate(null)
        if (dateRange[1] === '') setSelectedToDate(null)
    }, [dateRange]);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleApply = () => {
        setDateRange([selectedFromDate ? selectedFromDate.toISOString() : dateRange[0], selectedToDate ? selectedToDate.toISOString() : dateRange[1]])
        handleClose()
    };

    const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;
        setSelectedToDate(null)
        setDateRange(['', ''])
        setIsSingleDay(isChecked);
    };

    const handleFromDateChange = (date: Date | null) => {
        setSelectedFromDate(date);
        if (isSingleDay) {
            setSelectedToDate(date); // synchronize dates when isSingleDay is true
        }
    };

    const handleToDateChange = (date: Date | null) => {
        if (!isSingleDay) {
            setSelectedToDate(date); // only change if isSingleDay is false
        } else {
            console.log('isSingleDay is true, not changing toDate');
            console.log({selectedFromDate})
            setSelectedToDate(selectedFromDate);
        }
    };

    const handleDefaultDateButtons = (from: Date, to: Date) => {
        setSelectedFromDate(null)
        setSelectedToDate(null)
        from?.setHours(0, 0, 0, 0)
        to?.setHours(23, 59, 59, 999)
        setDateRange([from.toISOString(), to.toISOString()])
        handleClose()
    }

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
    const btnStyle = {
        fontStyle: 'normal',
        fontWeight: '500',
        lineHeight: '133.4%',
        width: '100%',
        border: '1px #fff solid',
        mb: 1
    }
    const defaultDateButtons = [
        { label: 'Today', from: new Date(new Date().setDate(new Date().getDate())), to: today },
        { label: 'This Week', from: new Date(new Date().setDate(new Date().getDate() - 6)), to: today },
        { label: 'This Month', from: new Date(new Date().setDate(1)), to: today },
        { label: 'Past Month', from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1), to: new Date(new Date().setDate(0)) },
        { label: 'Past Quarter', from: new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1), to: today },
        { label: 'Past Six Months', from: new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1), to: today }
    ]

    return (
        <Box>
            <Button aria-describedby={id} variant="outlined" onClick={handleClick} sx={{
                textTransform: 'capitalize',
                fontSize: '16px',
                width: 250,
                color: '#fff',
                border: 'solid 1px #fff',
                display: "flex",
                justifyContent: 'space-between'
              }}>
                <span>{buttonText()}</span><FontAwesomeIcon icon={faCaretDown} />
            </Button>

            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                sx={{ borderRadius: '10px', '.MuiPaper-root': { backgroundColor: 'transparent' } }}
            >

                <Box sx={{ backgroundColor: '#353535', width: 470, borderRadius: '10px', mt: 1, }}>
                    <Typography sx={{ p: 2, color: '#fff' }}>Select {tableName} Received Between Dates</Typography>
                    <Grid container sx={{ p: 2 }}>
                        <Grid item xs={5}>
                            {defaultDateButtons.map((e) => (<Button variant="outlined" onClick={() => { handleDefaultDateButtons(e.from, e.to); }} sx={btnStyle} key={e.label}>{e.label}</Button>))}
                        </Grid>
                        <Grid item xs={7} sx={{ pl: 5, display: "flex", flexDirection: "column", justifyContent: 'space-between' }}>
                            <Box>
                                <FormGroup>
                                    <FormControlLabel sx={{ ml: "auto" }} control={
                                        <Switch
                                            checked={isSingleDay}
                                            onChange={handleToggleChange}
                                        />
                                    } label={<Typography sx={{ color: '#fff' }}>Single Day</Typography>} />
                                </FormGroup>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: "space-between", alignItems: 'center', }}>
                                <Typography sx={{ color: '#fff' }}>From</Typography>
                                <DatePicker
                                    value={selectedFromDate}
                                    onChange={handleFromDateChange}
                                    sx={{ border: '1px #fff solid', borderRadius: '5px', width: '80%', 'input': { color: '#fff' } }}
                                />
                            </Box>

                            {isSingleDay
                                ? <></>
                                : <Box sx={{ display: 'flex', justifyContent: "space-between", alignItems: 'center' }}>
                                <Typography sx={{ color: '#fff' }}>To</Typography>
                                <DatePicker
                                    value={selectedToDate}
                                    onChange={handleToDateChange}
                                    sx={{ border: '1px #fff solid', borderRadius: '5px', width: '80%', 'input': { color: '#fff' } }}
                                />
                                  </Box>
                            }

                            <Button variant="contained" onClick={handleApply} sx={{
                                backgroundImage: 'linear-gradient(180deg, #FFD056 0%, #FF800B 100%)',
                                color: '#000000',
                                fontSize: '13px',
                                mx: 0,
                                width: '100%',
                                alignSelf: 'center',
                                fontWeight: '600',
                                mb: 1
                            }}>
                                Apply
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Popover >
        </Box >
    );
}

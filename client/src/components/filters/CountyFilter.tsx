import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Button, Grid, Popover, TextField, Autocomplete } from "@mui/material";
import {useCallback, useEffect, useState} from "react";
import countyBidService from "../../services/county_bids.service.tsx";
import {County} from "../../types/countyType.ts";

type Props = {
    countiesFilter: string[];
    setCountiesFilter: (filteredCountyIds: string[]) => void;
}

export default function CountyFilter({ countiesFilter, setCountiesFilter }: Props) {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [allCounties, setAllCounties] = useState<County[]>([]);
    const [selectedCounties, setSelectedCounties] = useState<County[]>([]);
    const [labelText, setLabelText] = useState<string>("Select Counties");

    const fetchAllCounties = useCallback(async () => {
            const response = await countyBidService.getAllCounties();
            setAllCounties(response);

    }, []); // Dependency array might need to be adjusted based on your needs

    useEffect(() => {
        fetchAllCounties();
    }, [fetchAllCounties]);

    useEffect(() => {
        const initialSelectedCounties = countiesFilter.map((countyId) => allCounties.find((county) => county.id === countyId)).filter((county) => county !== undefined) as County[];
        setSelectedCounties(initialSelectedCounties);
    }, [countiesFilter, allCounties]);

    useEffect(() => {
        if (selectedCounties.length === 1) {
            setLabelText(`${selectedCounties[0].name}, ${selectedCounties[0].state}`)
        } else if (selectedCounties.length >= 2) {
            setLabelText(`Counties selected: ${selectedCounties.length}`)
        } else {
            setLabelText("Select Counties")
        }
    }, [selectedCounties]);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

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
            <span>{labelText}</span><FontAwesomeIcon icon={faCaretDown} />
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
                <Grid sx={{ p: 2 }}>
                    <Autocomplete
                        multiple
                        id="tags-outlined"
                        options={allCounties}
                        getOptionLabel={(option) => `${option.name}, ${option.state}`}
                        value={selectedCounties}
                        filterSelectedOptions
                        onChange={(event, newValue) => {
                            event.preventDefault();
                            setSelectedCounties(newValue);
                            setCountiesFilter(newValue.map((county) => county.id));
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                // label={labelText}
                                placeholder="counties..."
                            />
                        )}
                    />
                </Grid>
            </Box>
        </Popover >
    </Box >)

}

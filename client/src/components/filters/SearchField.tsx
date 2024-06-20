import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { InputAdornment, TextField } from "@mui/material";
import { useEffect, useRef, useState } from "react";

type Props = {
    searchFilter: string,
    setSearchFilter: (string: string) => void
}

export default function SearchBar({ setSearchFilter, searchFilter }: Props) {
    const [searchTerm, setSearchTerm] = useState(searchFilter);
    const setSearchFilterRef = useRef(setSearchFilter);

    useEffect(() => {
        setSearchFilterRef.current = setSearchFilter;
    }, [setSearchFilter]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    useEffect(() => {
        // Use the ref to call setSearchFilter
        setSearchFilterRef.current(searchTerm);
    }, [searchTerm]);

    return (

        <TextField
            id="search"
            type="search"
            placeholder="Search"
            value={searchTerm}
            onChange={handleChange}
            variant="standard"
            sx={{ width: 200, mx: 2, color: '#fff', 'svg': { color: '#fff' }, 'input': { color: '#fff' }, '.css-xksckw-MuiInputBase-root-MuiInput-root:before': { borderColor: '#fff' }, '.css-xksckw-MuiInputBase-root-MuiInput-root:hover:not(.Mui-disabled, .Mui-error):before ': { borderColor: '#fff' } }}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start" >
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </InputAdornment>
                ),
            }}
        />

    );
}
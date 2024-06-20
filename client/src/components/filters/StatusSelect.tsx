import { Checkbox, FormControl, ListItemText, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";

type Props = {
    options: string[]
    setStatusFilter: Dispatch<SetStateAction<string[]>>
}

export default function StatusSelect({ options, setStatusFilter }: Props) {
    const [statusOption, setStatusOption] = useState<string[]>([]);

    const handleChange = async (event: SelectChangeEvent<typeof statusOption>) => {
        const {
            target: { value },
        } = event;
        setStatusOption(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };
    const updateStatusFilter = useCallback(
        (newStatus: string[]) => {
            setStatusFilter(newStatus);
        },
        [setStatusFilter],
    );

    useEffect(() => {
        updateStatusFilter(statusOption);
    }, [statusOption, updateStatusFilter]);

    return (
        <div>
            <FormControl sx={{}}>
                <Select
                    multiple
                    size="small"
                    displayEmpty
                    value={statusOption}
                    onChange={handleChange}
                    renderValue={(selected) => {
                        if (!selected.length) {
                            return '- select status -';
                        } else { return selected.join(', ') }
                    }}
                    sx={{ width: 200, mx: 2, color: '#fff', border: 'solid 1px #fff', borderRadius: '4px', 'svg': { color: '#fff' } }}

                >
                    <MenuItem disabled value="" sx={{ textAlign: 'center' }}>
                        - select status -
                    </MenuItem>
                    {options.map((option) => (
                        <MenuItem key={option} value={option}>
                            <Checkbox checked={statusOption.includes(option)} sx={{ 'svg': { color: '#010101' } }} />
                            <ListItemText primary={option} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    );
}

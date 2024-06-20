import Autocomplete, { AutocompleteProps } from '@mui/material/Autocomplete';

type CustomAutocompleteProps<T, Multiple extends boolean | undefined = false, DisableClearable extends boolean | undefined = false, FreeSolo extends boolean | undefined = false> = AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>;

const CustomAutocomplete = <T, Multiple extends boolean | undefined = false, DisableClearable extends boolean | undefined = false, FreeSolo extends boolean | undefined = false>(props: CustomAutocompleteProps<T, Multiple, DisableClearable, FreeSolo>) => {
  return <Autocomplete {...props} />;
};

export default CustomAutocomplete;

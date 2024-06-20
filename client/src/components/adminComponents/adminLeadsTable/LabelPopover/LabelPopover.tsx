import Popover from '@mui/material/Popover'
import leadService from '../../../../services/lead.service'
import { useEffect, useState } from 'react'
import { Button } from '@mui/material'
import CustomTextField from '../../../mui/TextField/CustomTextField'
import { Lead } from '../../../../types/leadTypes'
import { LeadLabel } from '../../../../types/labelTypes'
import "./LabelPopover.css"

type Props = {
    id: string | undefined,
    open: boolean,
    anchorEl: HTMLElement | null,
    handleClose: () => void,
    leadSelected: Lead | null,
    setOpenLabelModal: (open: boolean) => void,
    fetchLeads: () => void,
    labels: LeadLabel[]
}

export default function LabelPopover({
    id,
    open,
    anchorEl,
    handleClose,
    leadSelected,
    setOpenLabelModal,
    fetchLeads,
    labels
}: Props) {
    const [filteredLabels, setFilteredLabels] = useState(labels);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        const filtered = labels.filter((label) => label.text.toLowerCase().includes(searchText.toLowerCase()));
        setFilteredLabels(filtered);
    }, [searchText, labels]);

    const postLabel = (label: LeadLabel) => {
        const body = {
            label_id: label.id,
            // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
            lead_id: leadSelected?.id!
        }

        leadService.assignLabelToLead(body).then(() => {
            handleClose()
            fetchLeads()
        })
    }

    return (
        <div>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
            <div className='label-container'>
                <CustomTextField
                    id="standard-basic"
                    placeholder='search'
                    variant="standard"
                    size="small"
                    inputProps={{ style: { fontSize: 10 } }}
                    onChange={(e) => {
                        setSearchText(e.target.value);
                    }}
            />
                {filteredLabels.map((label) => {
                    const text = label.text
                    const background = label.label_colors.color
                    const colorText = label.label_colors.color_text
                    return (
                        <span
                            onClick={() => {
                                    postLabel(label)
                            }}
                            className='label'
                            style={{
                                backgroundColor: background,
                                color: colorText,
                                fontWeight: 500,
                            }}
                        >
                            {text}
                        </span>
                    )
                })}
                <Button sx={{height: 20}}>
                    <span
                        onClick={() => {
                            setOpenLabelModal(true)
                            handleClose()
                        }}
                        className='label'
                    >+ New label</span>
                </Button>
            </div>
            </Popover>
        </div>
  )
}

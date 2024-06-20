import { Box, Grid, Modal, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import leadService from '../../../../services/lead.service'
import CustomButton from '../../../mui/Button/CustomButton'
import { LabelColor } from '../../../../types/labelTypes'

type Props = {
    openLabelModal: boolean
    handleCloseLabelModal: () => void
    getLeadLabels: () => void
}

export default function AddLabelModal({
    openLabelModal,
    handleCloseLabelModal,
    getLeadLabels,
}: Props) {
    const [colors, setColors] = useState<LabelColor[]>([])
    const [selectedColor, setSelectedColor] = useState<LabelColor | null>(null)
    const [postColor, setPostColor] = useState({
        color: '',
        text: '',
    })

    useEffect(() => {
        if (openLabelModal) {
            getLabelColors()
        }
    }, [openLabelModal])

    const getLabelColors = () => {
        leadService.getLabelColors().then((response) => {
            setColors(response)
        })
    }

    const handleColorClick = (color: LabelColor) => {
        if (selectedColor === color) {
            setSelectedColor(null)
        } else {
            setSelectedColor(color)
            setPostColor({ ...postColor, color: color.id })
        }
    }

    const postLabelColor = () => {
        leadService.postLeadLabel(postColor).then(() => {
            getLeadLabels()
            handleCloseLabelModal()
        })
    }

    return (
        <Modal
            open={openLabelModal}
            onClose={handleCloseLabelModal}
            aria-labelledby='modal-modal-title'
            aria-describedby='modal-modal-description'
        >
        <Box
            sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 300,
                bgcolor: 'background.paper',
                borderRadius: '0.4rem',
                boxShadow: 24,
                p: 4,
            }}
        >
        <Typography
            mb={2}
            sx={{
                fontSize: '16px',
                textAlign: 'center',
            }}
        >
            Create Label
        </Typography>
        <div
            style={{
                backgroundColor: '#1f1c1c',
                margin: '0 -32px',
                padding: '40px',
             }}
        >
            <span
                style={{
                    backgroundColor: selectedColor?.color,
                    color: selectedColor?.color_text,
                    display: 'inline-block',
                    width: '100%',
                    height: '32px',
                    position: 'relative',
                    marginBottom: '0',
                    borderRadius: '3px',
                    padding: '0 12px',
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                    lineHeight: '32px',
                    fontSize: '14px',
                    fontWeight: '500',
                    textAlign: 'left',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}
            >
                {postColor.text}
            </span>
        </div>
        <Typography
            mt={2}
            mb={2}
            sx={{
                fontSize: '16px',
            }}
        >
            Title
        </Typography>
        <TextField
            fullWidth
            size='small'
            sx={{
                width: '100%',
            }}
            value={postColor.text}
            onChange={(e) => {
                setPostColor({ ...postColor, text: e.target.value })
            }}
        />
        <Typography
            mt={2}
            mb={2}
            sx={{
                fontSize: '16px',
            }}
        >
            Select Color
        </Typography>
        <Grid container gap={1}>
            {colors.map((color: LabelColor) => {
                return (
                    <Grid item xs={2}>
                    <div
                        onClick={() => {
                            handleColorClick(color)
                        }}
                        className={`color-box ${
                            selectedColor === color ? 'selected' : ''
                        }`}
                        style={{
                            backgroundColor: color.color,
                            height: 32,
                            borderRadius: selectedColor === color ? 2 : 4,
                            border:
                                selectedColor === color
                                ? '2px solid #fff'
                                : '2px transparent solid',
                            cursor: 'pointer',
                            width: '100%',
                        }}
                    />
                    </Grid>
                )
            })}
        </Grid>
        <Grid container mt={3} justifyContent={'space-evenly'}>
            <CustomButton
                onClick={postLabelColor}
                customSx={{
                    padding: '5px 10px',
                }}
            >
                Create
            </CustomButton>
            <CustomButton
                onClick={handleCloseLabelModal}
                customSx={{
                    padding: '5px 10px',
                }}
            >
                Cancel
            </CustomButton>
        </Grid>
        </Box>
        </Modal>
  )
}

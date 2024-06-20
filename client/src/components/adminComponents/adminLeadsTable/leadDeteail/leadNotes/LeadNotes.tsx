import { faUserGroup, faUserLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Grid, Radio, TextareaAutosize, styled } from "@mui/material"
import { useCallback, useEffect, useState } from 'react';
import activityService from '../../../../../services/activity.service';
import { Activity } from '../../../../../types/activityType';
import Notes from './Notes';

interface RadioComponentProps {
    label: string;
    icon: React.ReactNode;
    value: 'admin' | 'private' | 'user';
}

const blue = {
    100: '#DAECFF',
    200: '#b6daff',
    400: '#3399FF',
    500: '#007FFF',
    600: '#0072E5',
    900: '#003A75',
  };

  const grey = {
    50: '#F3F6F9',
    100: '#E5EAF2',
    200: '#DAE2ED',
    300: '#C7D0DD',
    400: '#B0B8C4',
    500: '#9DA8B7',
    600: '#6B7A90',
    700: '#434D5B',
    800: '#303740',
    900: '#1C2025',
};

const Textarea = styled(TextareaAutosize)(
    ({ theme }) => `
    width: 100%;
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 0.875rem;
    font-weight: 400;
    line-height: 1.5;
    padding: 12px;
    border-radius: 12px 12px 0 12px;
    color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
    background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
    border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
    box-shadow: 0px 2px 2px ${theme.palette.mode === 'dark' ? grey[900] : grey[50]};

    &:hover {
      border-color: ${blue[400]};
    }

    &:focus {
      outline: 0;
      border-color: ${blue[400]};
      box-shadow: 0 0 0 3px ${theme.palette.mode === 'dark' ? blue[600] : blue[200]};
    }

    // firefox
    &:focus-visible {
      outline: 0;
    }
  `,
);

type Props = {
    leadId: string;
}

const LeadNotes = ({leadId}: Props) => {
    const [activities, setActivities] = useState<Activity[]>([])
    const [selectedRadio, setSelectedRadio] = useState<'admin' | 'private' | 'user'>('admin');
    const [noteText, setNoteText] = useState<string>('');

    const getActivities = useCallback(async () => {
        const res = await activityService.getByLeadId(leadId);
        return res
    }, [leadId]);

    useEffect(() => {
        getActivities().then((res) => {
            setActivities(res)
        })
    }, [getActivities])

    const postActivity = useCallback(async () => {
        const body = {
            note: noteText,
            visibility: selectedRadio,
            leadId,
        }
        const res = await activityService.createActivity(body);
        getActivities().then((res) => {
            setActivities(res)
        })
        return res
    }, [leadId, selectedRadio, getActivities, noteText]);

    const handleRadioChange = (value: 'admin' | 'private' | 'user') => {
        setSelectedRadio(value);
    };

    const handleChangeTextArea = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNoteText(event.target.value);
    }

    const RadioComponent: React.FC<RadioComponentProps> = ({ label, icon, value }) => {
        return (
            <div>
                <div style={{ display: "flex", justifyContent: "center", alignItems:"center" }}>
                    <Radio
                        checked={value === selectedRadio}
                        size="small"
                        onChange={() => {
                            handleRadioChange(value)
                        }}
                    />
                    <span style={{fontSize: 12}}>{ label }</span>
                </div>
                <div style={{display: "flex", justifyContent: "center", marginLeft:20}}>
                    {icon}
                </div>
            </div>
        )
    }

    return (
        <>
            <Textarea
                aria-label="empty textarea"
                minRows={5}
                placeholder="Empty"
                onChange={handleChangeTextArea}
                sx={{
                    width: '100%',
                }}
            />
            <Grid
                container
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 1,
                }}
            >
                <Grid>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundImage: 'linear-gradient(180deg, #FFD056 0%, #FF800B 100%)',
                            color: '#000000',
                            fontSize: '12px',
                            height: '25px',
                            fontWeight: '600',
                            textTransform: 'uppercase'
                        }}
                        onClick={() => {
                            postActivity()
                        }}
                    >
                    Save
                    </Button>
                </Grid>
                <Grid
                    sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}
                >
                    <RadioComponent
                        value="admin"
                        label="Admin"
                        icon={<FontAwesomeIcon icon={faUserLock} color='rgb(1, 177, 244)' />}
                    />
                    <RadioComponent
                        value="private"
                        label="Private"
                        icon={<FontAwesomeIcon icon={faUserLock} color='rgb(18, 151, 75)' />}
                    />
                    <RadioComponent
                        value="user"
                        label="Buyer"
                        icon={<FontAwesomeIcon icon={faUserGroup} color='#bd01ff' />}
                    />
                </Grid>
            <Grid
                container
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    pl: '20px',
                    mt: '20px'
                }}
            >
                {
                    activities?.map((activity) => {
                        return (
                            <Notes
                                activity={activity}
                                getActivities={getActivities}
                                setActivities={setActivities}
                                Textarea={Textarea}
                            />
                        )
                    })
                }
            </Grid>
            </Grid>
        </>
    )
}

export default LeadNotes
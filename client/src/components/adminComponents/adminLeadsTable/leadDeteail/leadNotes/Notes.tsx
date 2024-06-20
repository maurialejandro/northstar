import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button, Divider, Grid, TextareaAutosizeProps } from '@mui/material'
import { Activity } from '../../../../../types/activityType'
import { formatDateTime } from '../../../../../utils/formatDateTime'
import { IconDefinition, faUserGroup, faUserLock } from '@fortawesome/free-solid-svg-icons'
import activityService from '../../../../../services/activity.service'
import { useState } from 'react'
import { StyledComponent } from '@emotion/styled'

type Props = {
    activity: Activity
    getActivities: () => Promise<Activity[]>
    setActivities: (activities: Activity[]) => void
    Textarea : StyledComponent<TextareaAutosizeProps & React.RefAttributes<Element>>
}

const Notes = ({ activity, getActivities, setActivities, Textarea }: Props) => {
    const [updateNotes, setUpdateNotes] = useState<string>("")
    const [editModeMap, setEditModeMap] = useState<Record<string, boolean>>({});

    const handleDeleteActivity = async () => {
        const res = await activityService.deleteActivity(activity.id);
        getActivities().then((res) => {
            setActivities(res)
        })
        return res
    }

    const updateActivity = async () => {
        const body = {
            note: updateNotes
        }
        const res = await activityService.updateActivity(activity.id, body);
        getActivities().then((res) => {
            setActivities(res)
            setEditModeMap((prev) => ({ ...prev, [activity.id]: false }))
        })
        return res
    }

     const iconNote = (activity: string) : {icon : IconDefinition, color: string} => {
        switch (activity) {
            case 'admin':
                return { icon: faUserLock, color: 'rgb(1, 177, 244)' };
            case 'private':
                return { icon: faUserLock, color: 'rgb(18, 151, 75)' };
            case 'user':
                return { icon: faUserGroup, color: '#bd01ff' };
            default:
                return { icon: faUserLock, color: 'rgb(1, 177, 244)' };
        }
    }
    const { icon, color } = iconNote(activity.visibility);
    return (
        <>
            <Grid
                item
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    marginBottom:'10px'
                }}
            >
                <span style={{fontSize: 16}}>{activity.users!.name} - {formatDateTime(activity.created.toString())}</span>
                <Grid
                    container
                    sx={{
                        display: 'flex',
                        justifyContent: 'start',
                        alignItems: 'center',
                        gap: "25px",
                    }}
                >
                    <Grid>
                        <FontAwesomeIcon icon={icon} color={color} />
                    </Grid>
                    <Grid
                        item
                        xs={10}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        { editModeMap[activity.id]
                            ? <Textarea aria-label="edit textarea" minRows={3} placeholder="Edit your note..."
                                    value={updateNotes}
                                    onChange={ (e) => {
                                        setUpdateNotes(e.target.value)
                                    }}
                                />
                             : (
                            <span style={{ fontSize: 13 }}>{activity.note}</span>
                        )}
                    </Grid>
                    </Grid>
                    <Grid
                        container
                        sx={{
                            display: 'flex',
                            justifyContent: 'end',
                            alignItems: 'center',
                            gap: '30px',
                            marginTop: '10px',
                            paddingRight: '100px'
                        }}
                    >
                    {editModeMap[activity.id]
                        ? (
                            <>
                            <Button
                                onClick={updateActivity}
                                sx={{
                                    backgroundImage: 'linear-gradient(180deg, #FFD056 0%, #FF800B 100%)',
                                    color: '#000000',
                                    fontSize: '12px',
                                    height: '25px',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                }}
                            >
                                Save
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setEditModeMap((prev) => ({ ...prev, [activity.id]: false }))
                                }}
                                sx={{
                                    borderColor: '#FF800B',
                                    color: '#FF800B',
                                    fontSize: '12px',
                                    height: '25px',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                }}
                            >
                                Cancel
                            </Button>
                            </>
                        )
                        : (
                            <>
                            <span
                                onClick={() => {
                                    setEditModeMap((prev) => ({ ...prev, [activity.id]: true }));
                                    setUpdateNotes(activity.note);
                                }}
                                style={{ fontSize: 12, cursor: 'pointer', color: '#fff', textDecoration: 'underline' }}
                            >
                                Edit
                            </span>
                            <span
                                onClick={handleDeleteActivity}
                                style={{ fontSize: 12, cursor: 'pointer', color: '#fff', textDecoration: 'underline' }}
                            >
                                Delete
                            </span>
                            </>
                            )
                    }
                    </Grid>
            </Grid>
            <Divider />
        </>
    )
}

export default Notes
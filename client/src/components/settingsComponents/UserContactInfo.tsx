import { useState, useEffect, useContext } from 'react';
import { Box, Typography, Button, TextField, Card, CardContent } from '@mui/material';
import userService from "../../services/user.service.tsx";
import { useLocation, useNavigate } from 'react-router-dom';
import DataContext from "../../context/DataContext.tsx";
import { User } from "../../types/userTypes.ts";

export default function UserContactInfo() {
    const [userData, setUserData] = useState<Partial<User>>({name: '', email: '', phone: ''});
    const [editMode, setEditMode] = useState(false);
    const [formValues, setFormValues] = useState<Partial<User>>({name: '', email: '', phone: ''});
    const location = useLocation();
    const navigate = useNavigate();
    const { loggedInUser, setLoggedInUser } = useContext(DataContext);

    useEffect(() => {
        async function confirmUpdateContactInfo(token: string) {
            const data = await userService.confirmUpdateContactInfo(token);

            // TODO: Handle error better, do not expose error message to user
            if (typeof data === 'string') {
                alert(data + '. Please try again.');
                return;
            }

            const formattedUserData = {
                name: data.name,
                email: data.email,
                phone: data.phone
            };

            setLoggedInUser(data);
            setUserData(formattedUserData);
            setFormValues(formattedUserData);
            alert('Contact info updated successfully')
        }

        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token');

        if (token) {
            confirmUpdateContactInfo(token).then(() => {
                navigate('/settings');
            });
        } else if (loggedInUser) {
            setUserData(loggedInUser);
        }

    }, [location.search, navigate, loggedInUser, setLoggedInUser]);

    const saveUserData = async () => {
        const requestUpdateContactInfoResponse = await userService.requestUpdateContactInfo(formValues);
        if (requestUpdateContactInfoResponse) {
            alert('Error saving contact info');
        } else {
            alert('Check your email for a confirmation link to update your contact info');
        }
    };

    const handleEditMode = () => {
        setFormValues(userData);
        setEditMode(true);
    }

    return (
        <Card sx={{minWidth: 275, mb: '1rem', backgroundColor: "rgba(255, 255, 255, 0.1)"}}>
            <CardContent sx={{p: '24px'}}>
                <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="1rem">
                    <Typography variant="h5" gutterBottom component="div">
                        Contact Info
                    </Typography>
                    {!editMode && (
                        <Button variant="contained" color="primary" sx={{height: '32px'}} onClick={handleEditMode}>
                            Edit
                        </Button>
                    )}
                </Box>

                {editMode
                    ? (
                        <form>
                            <Box marginBottom="1rem">
                                <TextField
                                    fullWidth
                                    label="Name"
                                    variant="outlined"
                                    value={formValues.name}
                                    onChange={(e) => {
                                        setFormValues({...formValues, name: e.target.value})
                                    }}
                                />
                            </Box>
                            <Box marginBottom="1rem">
                                <TextField
                                    fullWidth
                                    label="Email"
                                    variant="outlined"
                                    value={formValues.email}
                                    onChange={(e) => {
                                        setFormValues({...formValues, name: e.target.value})
                                    }}
                                />
                            </Box>
                            <Box marginBottom="1rem">
                                <TextField
                                    fullWidth
                                    label="Phone"
                                    variant="outlined"
                                    value={formValues.phone}
                                    onChange={(e) => {
                                        setFormValues({...formValues, name: e.target.value})
                                    }}
                                />
                            </Box>
                            <Box display="flex" justifyContent="flex-end">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => {
                                        saveUserData();
                                        setEditMode(false);
                                    }}
                                >
                                    Save
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    style={{marginLeft: '1rem'}}
                                    onClick={() => {
                                        setEditMode(false)
                                    }}
                                >
                                    Cancel
                                </Button>
                            </Box>
                        </form>
                    )
                    : (
                        <Box>
                            <Typography><strong>Name:</strong> {userData.name}</Typography>
                            <Typography><strong>Email:</strong> {userData.email}</Typography>
                            <Typography><strong>Phone:</strong> {userData.phone}</Typography>
                        </Box>
                    )}
            </CardContent>
        </Card>
    );
}
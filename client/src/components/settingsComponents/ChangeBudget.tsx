import { useState, useEffect, useRef, useContext } from 'react';
import { Box, Typography, Button, TextField, Card, CardContent } from '@mui/material';
import userService from "../../services/user.service.tsx";
import { useNavigate } from "react-router-dom";
import DataContext from "../../context/DataContext.tsx";
import { UserData } from "../../types/buyerType.ts";

export default function ChangeBudget() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [formValues, setFormValues] = useState<{ monthly_budget: number | undefined }>({monthly_budget: undefined});
    const { loggedInUser, setLoggedInUser } = useContext(DataContext);
    const navigate = useNavigate();
    const changeBudget = new URLSearchParams(window.location.search).get('changeBudget');

    // Create a ref for the input field
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        setUserData(loggedInUser);
        if (changeBudget) {
            setEditMode(true);
            setFormValues({monthly_budget: loggedInUser?.monthly_budget});
        }
    }, [navigate, changeBudget, loggedInUser]); // Added changeBudget as a dependency to re-run useEffect when it changes

    useEffect(() => {
        // Focus on the input field when editMode is true
        if (editMode && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editMode]);

    const handleEditMode = () => {
        setFormValues({monthly_budget: userData?.monthly_budget});
        setEditMode(true);
    }

    const saveUserData = async () => {
        const saveBudget = await userService.updateUser({monthly_budget: formValues.monthly_budget});
        setUserData(saveBudget);
        setLoggedInUser(saveBudget);
        setEditMode(false);
        navigate("/settings");
    }

    return (
        <Card sx={{minWidth: 275, mb: '1rem', backgroundColor: "rgba(255, 255, 255, 0.1)"}}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="1rem">
                    <Typography variant="h5" gutterBottom component="div">
                        Monthly Budget
                    </Typography>
                    {!editMode && (
                        <Button variant="contained" color="primary" onClick={handleEditMode}>
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
                                    label="Your Budget"
                                    variant="outlined"
                                    type={'number'}
                                    value={formValues.monthly_budget}
                                    onChange={(e) => {
                                        setFormValues({...formValues, monthly_budget: parseInt(e.target.value)})
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault(); // Prevent the default form submission behavior
                                            saveUserData(); // Save the data when Enter key is pressed
                                        }
                                    }}
                                    // Assign the ref to the input field
                                    inputRef={inputRef}
                                />
                            </Box>
                            <Box display="flex" justifyContent="flex-end">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={saveUserData}
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
                        <Typography variant="body1">
                            <Box display="block">
                                <span style={{fontWeight: "bold"}}>Budget:</span> {userData?.monthly_budget}
                            </Box>
                        </Typography>
                    )}
            </CardContent>
        </Card>
    );
}
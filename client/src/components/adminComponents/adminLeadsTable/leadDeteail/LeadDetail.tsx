import { useCallback, useEffect, useState } from 'react'
import leadService from '../../../../services/lead.service';
import { useParams } from 'react-router-dom';
import { ExtendedLead } from '../../../../types/leadTypes';
import { Grid, useMediaQuery } from '@mui/material';
import GeneralLeadInfo from './generalInformation/GeneralInformation';
import LeadNotes from './leadNotes/LeadNotes';
import BuyerLeadInformation from './buyerLeadInformation/BuyerLeadInformation';

const LeadDetail = () => {
    const { id } = useParams();
    const [lead, setLead] = useState<ExtendedLead[]>([]);

    const getLead = useCallback(async () => {
        const res = await leadService.getLeadById(id)
        return res
    }, [id]);

    useEffect(() => {
        getLead().then((response) => {
            setLead([response]);
        });
    }, [getLead]);

    const isScreenSmall = useMediaQuery('(max-width: 1250px)');

    return (
        <Grid
            container
            sx={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "0.4rem",
                display: 'grid',
                gridTemplateColumns: !isScreenSmall ? '18% 54% 18%' : '30% 60%',
                justifyContent: 'center',
                padding: '20px',
                gap: 3,
            }}
            xs={12}
        >
        <Grid item >
            <GeneralLeadInfo
                lead={lead}
            />
        </Grid>
        <Grid item mt="20px" >
            <LeadNotes
                leadId={id!}
            />
        </Grid>
        {!isScreenSmall && (
            <Grid item mt="3px">
                <BuyerLeadInformation
                    lead={lead}
                    getLead={getLead}
                    setLead={setLead}
                />
            </Grid>
        )}
        </Grid>
    );
}

export default LeadDetail
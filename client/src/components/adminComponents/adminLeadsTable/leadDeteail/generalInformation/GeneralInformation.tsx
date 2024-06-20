import { ExtendedLead } from '../../../../../types/leadTypes';
import { formatDateTime } from '../../../../../utils/formatDateTime';
import ItemDetail from '../../../buyerDetail/customCard/ItemDetail';

type Props = {
    lead : ExtendedLead[]
}

const GeneralLeadInfo = ({
    lead
}: Props) => {
    const { name, address, county, state, created, phone, email } = lead[0] || {};

    return (
        <>
            <h3>{ name }</h3>
            <ItemDetail
                title="Contact Info"
            >
                <span>Phone: { phone } </span>
                <span>Email: { email }  </span>
            </ItemDetail>

            <ItemDetail
                title="Address"
            >
                <span>Address: { address }  </span>
                <span>County: { county }  </span>
                <span>State: { state } </span>
            </ItemDetail>

             <ItemDetail
                title="Uploaded"
            >
                <span>Uploaded:  { created ? formatDateTime(created.toString()) : null }  </span>
            </ItemDetail>
        </>
    )
}

export default GeneralLeadInfo
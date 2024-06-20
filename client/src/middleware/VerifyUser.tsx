import { Navigate } from "react-router-dom";
import {useContext} from "react";
import DataContext from "../context/DataContext.tsx";

type Props = {
    children: React.ReactNode;
};

const VerifyUser = ({ children }: Props) => {
    const {session } = useContext(DataContext);

    if (!session) {
        return <Navigate to="/login" />;
    }

    return <>{children}</>;

};

export default VerifyUser;

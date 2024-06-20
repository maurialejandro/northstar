import React, { createContext, useState, ReactNode, useEffect } from "react";
import { Lead } from "../types/leadTypes";
import { Buyer, UserData } from "../types/buyerType";
import { Session } from "../types/userTypes";
import { BidRow } from '../types/countyBidsType';

// TODO: add LoggedInUser type
type Filters = {
  leadSearch: string;
}

type DataContextType = {
  session: Session | null;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  loadedLeads: Lead[],
  setLoadedLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  loadedBuyers: Buyer[],
  setLoadedBuyers: React.Dispatch<React.SetStateAction<Buyer[]>>;
  loggedInUser: UserData | null;
  setLoggedInUser: React.Dispatch<React.SetStateAction<UserData | null>>;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  role: string;
  setRole: React.Dispatch<React.SetStateAction<string>>;
  bidsDataTable: BidRow[];
  setBidsDataTable: React.Dispatch<React.SetStateAction<BidRow[]>>;
}

// Get data from local storage
const loadFromLocalStorage = () => {
   try {
        // Retrieve data from local storage
        const storedData = localStorage.getItem("appData");
        if (storedData) {
            return JSON.parse(storedData);
        }
    } catch (error) {
        console.error("Error loading data from local storage:", error);
    }
    // Return default values if no data found in local storage
    return {
        session: null,
        loadedLeads: [],
        loadedBuyers: [],
        loggedInUser: null,
        filters: {
            leadSearch: "",
        },
        role: '',
        bidsDataTable: [],
      }
};

const DataContext = createContext<DataContextType>({
  session: null,
  setSession: () => { },
  loadedLeads: [],
  setLoadedLeads: () => { },
  loadedBuyers: [],
  setLoadedBuyers: () => { },
  loggedInUser: null,
  setLoggedInUser: () => { },
  filters: {
    leadSearch: '',
  },
  setFilters: () => { },
  role: '',
  setRole: () => { },
  bidsDataTable: [],
  setBidsDataTable: () => { },
})

type Props = {
  children: ReactNode;
};

export const AppProps = ({ children }: Props) => {
    const initialState = loadFromLocalStorage();
    const [session, setSession] = useState<Session | null>(initialState.session);
    const [loadedLeads, setLoadedLeads] = useState<Lead[]>(initialState.loadedLeads);
    const [loadedBuyers, setLoadedBuyers] = useState<Buyer[]>(initialState.loadedBuyers);
    const [loggedInUser, setLoggedInUser] = useState<UserData | null>(
        initialState.loggedInUser
    );
    const [filters, setFilters] = useState<Filters>(initialState.filters);
    const [role, setRole] = useState<string>(initialState.role)
    const [bidsDataTable, setBidsDataTable] = useState<BidRow[]>(initialState.bidsDataTable);

  // Use useEffect to save state to local storage whenever it changes
    useEffect(() => {
        const dataToStore = {
            session,
            loadedLeads,
            loadedBuyers,
            loggedInUser,
            filters,
            role,
        };
        try {
            // Store data in local storage as a JSON string
            localStorage.setItem("appData", JSON.stringify(dataToStore));
        } catch (error) {
            console.error("Error saving data to local storage:", error);
        }
    }, [session, loadedLeads, loadedBuyers, loggedInUser, filters, role]);

    return (
        <DataContext.Provider
            value={{
                session,
                setSession,
                loadedLeads,
                setLoadedLeads,
                loadedBuyers,
                setLoadedBuyers,
                loggedInUser,
                setLoggedInUser,
                filters,
                setFilters,
                role,
                setRole,
                bidsDataTable,
                setBidsDataTable
            }}
        >
            {children}
        </DataContext.Provider>
    );
};

export default DataContext;

// To Create a Context
// 1. Create a context.jsx file, add all necessary boilerplate code and the states
// 2. Wrap your App with the contextProvider in App.js
// 3. Use useContext(contextName) method to get your state values in any component you want.

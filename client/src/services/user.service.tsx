import { AxiosResponse } from "axios";
import { ExtendedUser, Session, User } from "../types/userTypes";
import { authProvider, AxiosProvider } from "../config/axiosProvider.ts";
import { UserData } from "../types/buyerType.ts";

type AuthResponse = {
    data: {
        user: null,
        session: Session
    }, error: null} | {data: {
        user: null,
        session: null
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, error: any
}

class UserService {
    constructor(private readonly api : AxiosProvider) {}

    getUserRole = async (): Promise<AxiosResponse<{ role: string }>> => {
      return await this.api.getApi().get('/api/users/role');
    };

    authenticateUser = async (email: string, password: string): Promise<AuthResponse & { message: string }> => {
        // getApi(false) means we don't need to send the token in the header
        return await this.api.getApi(false).post('/api/authenticate', { email, password }).then(async (response) => {
            const token = response.data.data.session.access_token;
            this.api.setToken(token); // Store the token in localStorage
            return await this.getUserRole().then((res) => {
                return {
                    message: res.data.role,
                    ...response.data
                };
            });
        }).then((response) => {
            return response;
        });
    }

    registerUser = async (email: string, password: string): Promise<AuthResponse & { message: string }> => {
        // getApi(false) means we don't need to send the token in the header
        return await this.api.getApi(false).post('/api/authenticate/register', { email, password }).then((response) => {
            const token = response.data.data.session.access_token;
            this.api.setToken(token); // Store the token in localStorage
            return response.data;
        });
    }

    signOut = (): { message: string } => {
        this.api.removeToken(); // Remove the token from localStorage
        return { message: 'success' };
    }

    getUserInfo = async (): Promise<UserData> => {
        return await this.api.getApi().get('/api/users/info').then((response) => response.data);
    }

    requestUpdateContactInfo = async (contactInfo: Partial<User>): Promise<boolean> => {
        return await this.api.getApi().post('/api/users/request-update-contact', contactInfo).then((response) => response.data);
    }

    confirmUpdateContactInfo = async (token: string): Promise<ExtendedUser | string> => {
        return await this.api.getApi().post('/api/users/confirm-update-contact', { token }).then((response) => response.data);
    }

    updateUser = async (newInfo: Partial<User>): Promise<ExtendedUser> => {
        return await this.api.getApi().put('/api/users/info', newInfo).then((response) => response.data);
    }
}

const userService = new UserService(authProvider);

export default userService;

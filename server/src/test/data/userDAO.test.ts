import { TestDBSetup } from "../db_tests.ts";
import { EnvConfig } from "../../main/config/envConfig.ts";
import {User} from "../../main/types/userTypes.ts";
import UserDAO from "../../main/data/userDAO.ts";
import { SupabaseWrapper } from "../../main/config/supabaseProvider.ts";

describe('test UserDAO', () => {
    const setup = new TestDBSetup();
    const supabase = new SupabaseWrapper(setup.supabase());
    const dao = new UserDAO(supabase, new EnvConfig());
    let myUserId: string | null;

    beforeEach(async () => {
        await setup.loadTestData();
        myUserId = await setup.userId("test1@flavor8.com");
        expect(myUserId).not.toBeNull();
    });

    it('can find user by ID', async () => {
        const user: User = (await dao.getUserById(myUserId!))!;
        expect(user.auth).toBe("123e4567-e89a-12d3-b456-226600000101");
        expect(user.id).toBe("123e4567-e89a-12d3-b456-226600000201");
        expect(user.email).toBe('test1@flavor8.com');
        expect(user.name).toBe("John Buyer");
    });

    it('can update user name', async () => {
        const user: Partial<User> = {
            name: "John Buyer Updated"
        };
        const updatedUser: User = (await dao.updateUserById(myUserId!, user));
        expect(updatedUser.id).toBe("123e4567-e89a-12d3-b456-226600000201");

        const updatedUserFromDB: User = (await dao.getUserById(myUserId!));
        expect(updatedUserFromDB.name).toBe("John Buyer Updated");

    });

    it('can update user monthlyBudget', async () => {
        const userBeforeUpdate: User = (await dao.getUserById(myUserId!));
        expect(userBeforeUpdate.monthly_budget).toBe(1500);

        const user: Partial<User> = {
            monthly_budget: 1000
        }
        const updatedUser: User = (await dao.updateUserById(myUserId!, user));
        expect(updatedUser.id).toBe("123e4567-e89a-12d3-b456-226600000201");

        const updatedUserFromDB: User = (await dao.getUserById(myUserId!));
        expect(updatedUserFromDB.monthly_budget).toBe(1000);
    });

});

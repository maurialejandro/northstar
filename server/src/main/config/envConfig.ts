import dotenv from 'dotenv';

dotenv.config();

export class EnvConfig {

    public readonly clientUrl: string;
    public readonly serverUrl: string;
    public readonly stripeKey: string;
    public readonly stripeClientKey: string;
    public readonly supabaseKey: string;
    public readonly supabaseUrl: string;
    public readonly sendGridApiKey : string;
    public readonly settingsEmail: string;
    public readonly jwtSecret: string;
    public readonly dbConfig: DBConfig;
    public readonly adminEmail: string

    constructor() {
        this.clientUrl = process.env.VITE_CLIENT_URL!;
        this.serverUrl = process.env.VITE_SERVER_URL!;
        this.stripeKey = process.env.STRIPE_KEY!;
        this.stripeClientKey = process.env.VITE_STRIPE_CLIENT_KEY!;
        // add SUPABASE_ENV_OVERRIDE to your local .env with the key from your local setup
        this.supabaseKey = (process.env.SUPABASE_ENV_OVERRIDE || process.env.SUPABASE_KEY)!;
        this.supabaseUrl = process.env.SUPABASE_URL!;
        this.sendGridApiKey = process.env.SENDGRID_API_KEY!;
        this.settingsEmail = process.env.SETTINGS_EMAIL!;
        this.jwtSecret = process.env.JWT_SECRET!;
        this.dbConfig = new DBConfig();
        this.adminEmail = (process.env.ADMIN_EMAIL_OVERRIDE || process.env.ADMIN_EMAIL)!;
    }
}

export class DBConfig {

    constructor(
        public readonly dbHost = process.env.DB_HOST!,
        public readonly dbUser = process.env.DB_USER!,
        public readonly dbPass = process.env.DB_PASS!,
        public readonly dbPort = process.env.DB_PORT!,
        public readonly dbDb = process.env.DB_DB!
    ) {}
}

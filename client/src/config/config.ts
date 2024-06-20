export class Config {

   constructor(
        public readonly baseUrl: string,
        public readonly supabaseUrl: string,
        public readonly supabaseKey: string) {}
}

const serverUrl = import.meta.env.VITE_SERVER_URL;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

const config = new Config(serverUrl, supabaseUrl, supabaseKey);
export default config;
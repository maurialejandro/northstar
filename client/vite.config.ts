/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

export default defineConfig(() => {
    return {
        plugins: [react()],
        // vite config
        define: {
            "process.env.VITE_SERVER_URL": JSON.stringify(process.env.VITE_SERVER_URL || 'http://localhost:5005'),
            "process.env.VITE_SUPABASE_URL": JSON.stringify(process.env.VITE_SUPABASE_URL),
            "process.env.VITE_SUPABASE_KEY": JSON.stringify(process.env.VITE_SUPABASE_KEY)
        },
    }
})

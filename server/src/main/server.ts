import { NorthstarServer } from "./northstarServer.ts";
import { EnvConfig } from "./config/envConfig.ts";
import { EnvironmentalSupabaseProvider } from "./config/supabaseProvider.ts";
import { DBContainer } from "./config/DBContainer.ts";
import StripeIAO from "./data/stripeIAO.ts";
import { EnvironmentalStripeProvider } from "./config/stripeProvider.ts";

const PORT = process.env.PORT || 5005;

try {
  const config = new EnvConfig();
  const server = new NorthstarServer(
      config,
      new EnvironmentalSupabaseProvider(),
      new StripeIAO(new EnvironmentalStripeProvider().stripe(config), config),
      new DBContainer(config.dbConfig)).setup();
  const app = server.getApp();

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}!`);
  });

} catch (error) {
  console.error('App initialization error:', error);
}
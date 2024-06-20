# Northstar

Welcome to the project.

# Local development 
*  (If on OSX specifically): have Docker running
* `npm install`
* `npm run dev-db-start` - this starts supabase, and dumps the key into a file named .supa
* `npm run dev-db-env` - this copies .supa to .env; we pick up .env to allow overrides (specifically just with this). you don't need to do this all the time, as your own key will stay the same throughout
* `npm run build`
* `npm run dev`
* Modify the .env file adding the email where you want to receive the emails
* Login as test1@flavor8.com / foobah1234
  * See supabase/README.md for instructions on adding more users

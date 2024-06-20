To add auth users:

1) Start up local supabase (npm run dev-db)
2) Navigate in your browser to http://localhost:54323/project/default/auth/users
3) Add an auth
4) On the command line, run `pg_dump postgresql://postgres:postgres@localhost:54322/postgres -t auth.users --data-only --inserts --column-inserts`
5) Copy and paste into seed.sql
6) Now add a users record that joins, e.g.
```insert into users(id, name, email, auth) values ('73d8e3a9-70e1-4787-8a80-302f696a98b9', 'john user', 'test1@flavor8.com',
                                                 '977ef647-d31b-48ca-8133-488793a22200');
 ```

NOTE that you can repeat this trick of dumping out a single table and copying/pasting into seed.sql (or test.sql)
whenever you need (for disputes, leads, whatever). The only thing you need the local supabase client for is setting up 
the initial auth records.

We should aim to have a robust set of data for both dev and test.
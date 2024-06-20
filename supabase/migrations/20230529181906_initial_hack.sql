-- Function for 'budgets' table
CREATE OR REPLACE FUNCTION update_budgets_changetimestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.modified = now(); 
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Function for 'counties' table
CREATE OR REPLACE FUNCTION update_counties_changetimestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.modified = now(); 
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Function for 'disputes' table
CREATE OR REPLACE FUNCTION update_disputes_changetimestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.modified = now(); 
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Function for 'leads' table
CREATE OR REPLACE FUNCTION update_leads_changetimestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.modified = now(); 
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Function for 'subscriptions' table
CREATE OR REPLACE FUNCTION update_subscriptions_changetimestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.modified = now(); 
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Function for 'user_leads' table
CREATE OR REPLACE FUNCTION update_user_leads_changetimestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.modified = now(); 
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Function for 'users' table
CREATE OR REPLACE FUNCTION update_users_changetimestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.modified = now(); 
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';


-- Trigger for 'budgets' table
CREATE TRIGGER update_budgets_changetimestamp
BEFORE UPDATE ON budgets
FOR EACH ROW
EXECUTE PROCEDURE update_budgets_changetimestamp();

-- Trigger for 'counties' table
CREATE TRIGGER update_counties_changetimestamp
BEFORE UPDATE ON counties
FOR EACH ROW
EXECUTE PROCEDURE update_counties_changetimestamp();

-- Trigger for 'disputes' table
CREATE TRIGGER update_disputes_changetimestamp
BEFORE UPDATE ON disputes
FOR EACH ROW
EXECUTE PROCEDURE update_disputes_changetimestamp();

-- Trigger for 'leads' table
CREATE TRIGGER update_leads_changetimestamp
BEFORE UPDATE ON leads
FOR EACH ROW
EXECUTE PROCEDURE update_leads_changetimestamp();

-- Trigger for 'subscriptions' table
CREATE TRIGGER update_subscriptions_changetimestamp
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE PROCEDURE update_subscriptions_changetimestamp();

-- Trigger for 'user_leads' table
CREATE TRIGGER update_user_leads_changetimestamp
BEFORE UPDATE ON user_leads
FOR EACH ROW
EXECUTE PROCEDURE update_user_leads_changetimestamp();

-- Trigger for 'users' table
CREATE TRIGGER update_users_changetimestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE update_users_changetimestamp();



create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (auth, email, name)
  values (new.id, new.email, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

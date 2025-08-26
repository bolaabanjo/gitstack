-- Define Row Level Security policies for the database

-- Policy for allowing users to select their own data
CREATE POLICY "Select own data"
ON your_table_name
FOR SELECT
USING (user_id = auth.uid());

-- Policy for allowing users to insert their own data
CREATE POLICY "Insert own data"
ON your_table_name
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Policy for allowing users to update their own data
CREATE POLICY "Update own data"
ON your_table_name
FOR UPDATE
USING (user_id = auth.uid());

-- Policy for allowing users to delete their own data
CREATE POLICY "Delete own data"
ON your_table_name
FOR DELETE
USING (user_id = auth.uid());

-- Enable Row Level Security on the table
ALTER TABLE your_table_name ENABLE ROW LEVEL SECURITY;
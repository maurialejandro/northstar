// to use this script
// make sure you have the csv file in the same folder as this script
// run npm install
// run -> npm run counties-script
const fs = require('fs');
require('dotenv').config();
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env['SUPABASE_URL'];
const supabaseKey = (process.env.SUPABASE_ENV_OVERRIDE || process.env.SUPABASE_KEY);

const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

async function loadCountyData() {
  try {
    const results = [];
    fs.createReadStream('./scripts/load-counties-script/co-est2022-alldata.csv')
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', async () => {
        try {
          const batchInsert = results.map((countyData) => ({
            name: countyData.CTYNAME,// Replace CTYNAME with the name of the column that contains the name of the counties
            state: countyData.STNAME,// Replace STNAME with the name of the column that contains the name of the states
            population: Number(countyData.POPESTIMATE2022),// Replace POPESTIMATE2022 with the name of the column that contains the population
          }))

          const { data, error } = await supabase.from('counties').insert(batchInsert);

          if (error) {
            console.error('Error inserting county data:', error);
          } else {
            console.log('County data inserted successfully.');
          }

        } catch (error) {
          console.error('Error loading county data:', error);
        }
      });
  } catch (error) {
    console.error('Error loading county data:', error);
  }
}

loadCountyData();

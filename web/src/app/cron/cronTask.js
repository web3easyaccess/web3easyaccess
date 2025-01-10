import { schedule, validate, getTasks } from "node-cron";

import { neon } from "@neondatabase/serverless";


const booted = {b:false}

export async function bootCron() {
    // */2 
    if(booted.b==false) {
      console.log(new Date(), "cron schedule...");
      schedule('* * * * *', () => {
        const query = async ()=>{
          const data = await getData()
          console.log(new Date(),'running a task every one minutes ***:', data);
        }
        
        query()
      });

      booted.b = true;
    }
    
}




export async function getData() {
    const sql = neon(process.env.DATABASE_URL);
    const data = await sql`SELECT * FROM test1.test1tab;`;
    return data;
}

/*
DATABASE_URL	postgresql://neondb_owner:******@ep-autumn-block-a595e4t1-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
DATABASE_URL_UNPOOLED	postgresql://neondb_owner:******@ep-autumn-block-a595e4t1.us-east-2.aws.neon.tech/neondb?sslmode=require


new:
psql "postgres://neondb_owner:sN5LmGeztj1F@ep-ancient-sound-a5y3c0xt-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

*/
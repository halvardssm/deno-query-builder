import { queries } from "./queries.ts";
import { Client } from "https://deno.land/x/postgres@v0.8.0/mod.ts";

for await (const { name, query } of queries("pg")) {
  Deno.test({
    name: `Migration PostgreSQL: ` + (name || "Empty"),
    async fn() {
      const client = new Client({
        user: "root",
        password: "pwd",
        database: "qb",
        hostname: "localhost",
        port: 5000,
      });

      await client.connect();

      let error = null;

      try {
        await client.queryArray({ text: query });
      } catch (e) {
        console.error(query);
        error = e;
      } finally {
        await client.end();

        if (error) {
          throw error;
        }
      }
    },
  });
}

import { queries } from "./queries.ts";
import { Client } from "https://deno.land/x/mysql@v2.8.0/mod.ts";

for await (const { name, query } of queries("mysql")) {
  Deno.test({
    name: `Migration MySQL: ` + (name || "Empty"),
    async fn() {
      const client = await new Client().connect({
        hostname: "localhost",
        username: "root",
        db: "qb",
        port: 5001,
      });

      let error = null;

      try {
        await client.execute(query);
      } catch (e) {
        console.error(query);
        error = e;
      } finally {
        await client.close();

        if (error) {
          throw error;
        }
      }
    },
  });
}

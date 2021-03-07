import { queries } from "./queries.ts";
import { DB } from "https://deno.land/x/sqlite@v2.3.2/mod.ts";

for await (const { name, query, ignore } of queries("sqlite3")) {
  Deno.test({
    name: `Migration SQLite: ` + (name || "Empty"),
    ignore,
    fn() {
      let error = undefined;

      const db = new DB("data/sqlite.db");
      try {
        db.query(query);
      } catch (e) {
        console.error(query);
        error = e;
      } finally {
        db.close(true);

        if (error) {
          throw error;
        }
      }
    },
  });
}

import { assertArrayIncludes, assertEquals } from "../../deps.ts";
import { Schema } from "../../mod.ts";

const dialect = "sqlite3";

const strings = [
  {
    name: "Schema create",
    string: new Schema(dialect).create("testTable", (table) => {
      table.id();
      table.timestamps();
    }),
    solution: [
      "CREATE TABLE testTable (id bigint PRIMARY KEY, created_at timestamp (0) DEFAULT current_timestamp, updated_at timestamp (0) DEFAULT current_timestamp);",
      "DROP TRIGGER IF EXISTS set_timestamp;",
      "CREATE TRIGGER set_timestamp BEFORE UPDATE ON testTable FOR EACH ROW BEGIN UPDATE testTable SET updated_at = CURRENT_TIMESTAMP WHERE id=OLD.id; END;",
    ],
  },
  {
    name: "Schema queryString",
    string: new Schema(dialect).queryString(
      `ALTER TABLE child_table ADD CONSTRAINT fk_child_table_parent_table FOREIGN KEY (parent_table_id) REFERENCES parent_table(id) ON DELETE CASCADE;`,
    ),
    solution: [
      `ALTER TABLE child_table ADD CONSTRAINT fk_child_table_parent_table FOREIGN KEY (parent_table_id) REFERENCES parent_table(id) ON DELETE CASCADE;`,
    ],
  },
  {
    name: "Schema queryString add ; to the end",
    string: new Schema(dialect).queryString(
      `ALTER TABLE child_table ADD CONSTRAINT fk_child_table_parent_table FOREIGN KEY (parent_table_id) REFERENCES parent_table(id) ON DELETE CASCADE`,
    ),
    solution: [
      `ALTER TABLE child_table ADD CONSTRAINT fk_child_table_parent_table FOREIGN KEY (parent_table_id) REFERENCES parent_table(id) ON DELETE CASCADE;`,
    ],
  },
  {
    name: "Schema drop",
    string: new Schema(dialect).drop("testTable"),
    solution: ["DROP TABLE testTable;"],
  },
  {
    name: "Schema drop if exists",
    string: new Schema(dialect).drop("testTable", true),
    solution: ["DROP TABLE IF EXISTS testTable;"],
  },
  {
    name: "Schema drop cascade",
    string: new Schema(dialect).drop("testTable", false, true),
    solution: ["DROP TABLE testTable CASCADE;"],
  },
  {
    name: "Schema drop if exists cascade",
    string: new Schema(dialect).drop("testTable", true, true),
    solution: ["DROP TABLE IF EXISTS testTable CASCADE;"],
  },
  {
    name: "Schema hasTable",
    string: new Schema(dialect).hasTable("testTable"),
    solution:
      "SELECT name FROM sqlite_master WHERE type='table' AND name='testTable';",
  },
  {
    name: "Schema rename table",
    string: new Schema(dialect).renameTable("testTable", "testTable2"),
    solution: ["ALTER TABLE testTable RENAME TO testTable2;"],
  },
  {
    name: "Schema rename column",
    string: new Schema(dialect).renameColumn(
      "testTable",
      "testCol",
      "testCol2",
    ),
    solution: ["ALTER TABLE testTable RENAME COLUMN testCol TO testCol2;"],
  },
  {
    name: "Schema drop column",
    string: new Schema(dialect).dropColumn("testTable", "testCol"),
    solution: [],
  },
  {
    name: "Schema has column",
    string: new Schema(dialect).hasColumn("testTable", "testCol"),
    solution:
      "SELECT EXISTS (SELECT * FROM sqlite_master WHERE tbl_name = 'testTable' AND sql = 'testCol');",
  },
];

strings.forEach(({ name, string, solution }) =>
  Deno.test({
    name: "SQLite: " + (name || "Empty"),
    fn(): void {
      if (Array.isArray(string)) {
        assertArrayIncludes(string, solution as string[]);
      }
      assertEquals(string, solution);
    },
  })
);

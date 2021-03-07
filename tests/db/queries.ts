import { DBDialects, Schema } from "../../mod.ts";

export const queries = (dialect: DBDialects) => [
  {
    name: "Create table",
    query: new Schema(dialect).create("test_table", (table) => {
      table.string("test_col");
      table.id();
      table.string("name", 100).nullable();
      table.boolean("is_true").default("false");
      table.custom("custom_column int default 1");
      table.timestamps();
      table.integer("number").default("0").autoIncrement();
      table.boolean("true").custom("default true");
    }).join(""),
  },
  {
    name: "Has table",
    query: new Schema(dialect).hasTable("test_table"),
  },
  {
    name: "Rename table",
    query: new Schema(dialect).renameTable("test_table", "table_test").join(""),
  },
  {
    name: "Has column",
    query: new Schema(dialect).hasColumn("table_test", "test_col"),
  },
  {
    name: "Rename column",
    query: new Schema(dialect).renameColumn(
      "table_test",
      "test_col",
      "col_test",
    )
      .join(""),
  },
  {
    name: "Drop column",
    query: new Schema(dialect).dropColumn("table_test", "col_test").join(""),
    ignore: dialect === "sqlite3",
  },
  {
    name: "Drop table",
    query: new Schema(dialect).drop("table_test").join(""),
  },
];

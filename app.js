let exe = require("express");
let app = exe();
app.use(exe.json());
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
let db_path = path.join(__dirname, "todoApplication.db");
let db = null;

const connection_db = async () => {
  try {
    db = await open({
      filename: db_path,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server has been started");
    });
  } catch (e) {
    console.log(e.message);
  }
};
connection_db();

// API 2
app.get("/todos/:todoId/", async (request, response) => {
  let { todoId } = request.params;
  let query = `
  SELECT
  *
  FROM 
  todo
  WHERE 
  id=${todoId};`;
  let result = await db.get(query);
  response.send(result);
});

// API 3

app.post("/todos/", async (request, response) => {
  let { id, todo, priority, status } = request.body;
  let query = `
  INSERT INTO todo
  (id,todo,priority,status)
  VALUES
  (${id},"${todo}","${priority}","${status}");`;
  await db.run(query);
  response.send("Todo Successfully Added");
});

// API 5
app.delete("/todos/:todoId/", async (request, response) => {
  let { todoId } = request.params;
  let query = `
  DELETE FROM todo where id=${todoId};`;
  await db.run(query);
  response.send("Todo Deleted");
});

const isstatus = (request) => {
  return request.status !== undefined;
};
const ispriority = (request) => {
  return request.priority !== undefined;
};
const is_status_priority = (request) => {
  return request.status !== undefined && request.priority !== undefined;
};

// API 1
app.get("/todos/", async (request, response) => {
  const { search_q = "", status, priority } = request.query;
  let query = ``;
  switch (true) {
    case isstatus(request.query):
      query = `
           SELECT 
           *
           FROM 
           todo 
        WHERE
        todo like '%${search_q}%' AND 
        status= '${status}';`;
      break;
    case ispriority(request.query):
      query = `
            SELECT 
            *
            FROM
            todo 
            where 
            todo like '%${search_q}%' AND 
            priority='${priority}';`;
      break;
    case is_status_priority(request.query):
      query = `
            SELECT *
            FROM todo
            WHERE
            todo like '%${search_q}%' AND 
            priority ='${priority}' AND 
            status='${status}';`;
      break;

    default:
      query = `
            SELECT 
            *
            FROM 
            todo 
            WHERE
            todo like '%${search_q}%';`;
      break;
  }
  let result = await db.all(query);
  response.send(result);
});
const to_do = (request) => {
  return request.todo !== undefined;
};

// API 4
app.put("/todos/:todoId/", async (request, response) => {
  let update_column = "";
  let { todoId } = request.params;
  let request_obj = request.body;
  switch (true) {
    case request_obj.status !== undefined:
      update_column = "Status";
      break;
    case request_obj.priority !== undefined:
      update_column = "Priority";
      break;
    case request_obj.todo !== undefined:
      update_column = "Todo";
      break;
  }
  let pervious_query = `
 SELECT *
 FROM todo 
 WHERE 
 id=${todoId};`;
  let previous = await db.get(pervious_query);
  console.log(previous);
  let {
    status = previous.status,
    priority = previous.priority,
    todo = previous.todo,
  } = request.body;
  let execution_query = `
 UPDATE todo
 SET 
 status='${status}',
 priority='${priority}',
 todo='${todo}'
 where
 id=${todoId};`;
  await db.run(execution_query);
  response.send(`${update_column} Updated`);
});

module.exports = app;

import { query, queryOne } from "../utils/query.js";
import { addId } from "../utils/addId.js";

// Get all todos for the current user
export const getTodos = async (req, res) => {
  try {
    const userId = String(req.user.id || req.user.userId || req.user.email);
    const organizationId = String(req.user.organizationId);
    const todos = await query(
      `SELECT * FROM "todos"
       WHERE "userId" = $1 AND "organizationId" = $2
       ORDER BY "createdAt" DESC`,
      [userId, organizationId]
    );
    return res.status(200).json({ success: true, data: addId(todos) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch todos", error: error.message });
  }
};

// Create a new todo
export const createTodo = async (req, res) => {
  try {
    const userId = String(req.user.id || req.user.userId || req.user.email);
    const organizationId = String(req.user.organizationId);
    const { title, description, dueDate, priority } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "Title is required" });

    const todo = await queryOne(
      `INSERT INTO "todos" ("userId","organizationId","title","description","dueDate","priority")
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [userId, organizationId, title, description || "", dueDate || null, priority || "medium"]
    );
    return res.status(201).json({ success: true, message: "Todo created", data: addId(todo) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to create todo", error: error.message });
  }
};

// Update a todo
export const updateTodo = async (req, res) => {
  try {
    const userId = String(req.user.id || req.user.userId || req.user.email);
    const { todoId } = req.params;
    const { title, description, dueDate, priority, completed } = req.body;

    const todo = await queryOne(
      `SELECT * FROM "todos" WHERE "id" = $1 AND "userId" = $2`,
      [todoId, userId]
    );
    if (!todo) return res.status(404).json({ success: false, message: "Todo not found" });

    const updated = await queryOne(
      `UPDATE "todos" SET
         "title"       = COALESCE($1, "title"),
         "description" = COALESCE($2, "description"),
         "dueDate"     = COALESCE($3, "dueDate"),
         "priority"    = COALESCE($4, "priority"),
         "completed"   = COALESCE($5, "completed")
       WHERE "id" = $6 AND "userId" = $7 RETURNING *`,
      [title, description, dueDate, priority, completed, todoId, userId]
    );
    return res.status(200).json({ success: true, message: "Todo updated", data: addId(updated) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update todo", error: error.message });
  }
};

// Delete a todo
export const deleteTodo = async (req, res) => {
  try {
    const userId = String(req.user.id || req.user.userId || req.user.email);
    const { todoId } = req.params;

    const todo = await queryOne(
      `SELECT * FROM "todos" WHERE "id" = $1 AND "userId" = $2`,
      [todoId, userId]
    );
    if (!todo) return res.status(404).json({ success: false, message: "Todo not found" });

    await queryOne(`DELETE FROM "todos" WHERE "id" = $1`, [todoId]);
    return res.status(200).json({ success: true, message: "Todo deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete todo", error: error.message });
  }
};

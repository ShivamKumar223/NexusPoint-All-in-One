import Todo from "../models/todo.js";

// Get all todos for the current user
export const getTodos = async (req, res) => {
    try {
        const userId = String(req.user.id || req.user.userId || req.user.email);
        const organizationId = String(req.user.organizationId);
        const todos = await Todo.find({ userId, organizationId }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: todos });
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
        if (!title) {
            return res.status(400).json({ success: false, message: "Title is required" });
        }
        const todo = await Todo.create({ userId, organizationId, title, description, dueDate, priority });
        return res.status(201).json({ success: true, message: "Todo created", data: todo });
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
        const todo = await Todo.findOneAndUpdate(
            { _id: todoId, userId },
            { title, description, dueDate, priority, completed },
            { new: true }
        );
        if (!todo) {
            return res.status(404).json({ success: false, message: "Todo not found" });
        }
        return res.status(200).json({ success: true, message: "Todo updated", data: todo });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to update todo", error: error.message });
    }
};

// Delete a todo
export const deleteTodo = async (req, res) => {
    try {
        const userId = String(req.user.id || req.user.userId || req.user.email);
        const { todoId } = req.params;
        const todo = await Todo.findOneAndDelete({ _id: todoId, userId });
        if (!todo) {
            return res.status(404).json({ success: false, message: "Todo not found" });
        }
        return res.status(200).json({ success: true, message: "Todo deleted" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to delete todo", error: error.message });
    }
};

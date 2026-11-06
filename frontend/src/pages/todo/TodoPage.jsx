import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import {
  IoAddOutline, IoTrashOutline, IoCheckmarkCircle, IoEllipseOutline,
  IoCalendarOutline, IoFlagOutline, IoCreateOutline, IoCloseOutline
} from 'react-icons/io5';
import './TodoPage.css';

const PRIORITY_OPTIONS = ['low', 'medium', 'high'];
const priorityColor = (p) => ({ low: 'success', medium: 'warning', high: 'danger' }[p] || 'secondary');

const TodoPage = () => {
  const { user } = useAuth();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTodo, setEditTodo] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', priority: 'medium' });
  const [filter, setFilter] = useState('all'); // all | active | completed
  const [submitting, setSubmitting] = useState(false);

  const fetchTodos = async () => {
    try {
      const res = await api.get('/todo');
      setTodos(res.data.data || []);
    } catch {
      // Fallback to localStorage
      const key = `sdc_todos_${user?._id || user?.userId || 'guest'}`;
      const saved = localStorage.getItem(key);
      setTodos(saved ? JSON.parse(saved) : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTodos(); }, []);

  const saveLocal = (updatedTodos) => {
    const key = `sdc_todos_${user?._id || user?.userId || 'guest'}`;
    localStorage.setItem(key, JSON.stringify(updatedTodos));
  };

  const resetForm = () => {
    setForm({ title: '', description: '', dueDate: '', priority: 'medium' });
    setEditTodo(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    setSubmitting(true);
    try {
      if (editTodo) {
        const res = await api.patch(`/todo/${editTodo._id}`, form);
        setTodos(prev => prev.map(t => t._id === editTodo._id ? res.data.data : t));
      } else {
        const res = await api.post('/todo', form);
        setTodos(prev => [res.data.data, ...prev]);
      }
      toast.success(editTodo ? 'Todo updated!' : 'Todo added!');
      resetForm();
    } catch {
      // Fallback: localStorage
      if (editTodo) {
        const updated = todos.map(t => t._id === editTodo._id ? { ...t, ...form } : t);
        setTodos(updated);
        saveLocal(updated);
      } else {
        const newTodo = { _id: Date.now().toString(), ...form, completed: false, createdAt: new Date().toISOString() };
        const updated = [newTodo, ...todos];
        setTodos(updated);
        saveLocal(updated);
      }
      toast.success(editTodo ? 'Todo updated!' : 'Todo added!');
      resetForm();
    } finally {
      setSubmitting(false);
    }
  };

  const toggleComplete = async (todo) => {
    try {
      const res = await api.patch(`/todo/${todo._id}`, { completed: !todo.completed });
      setTodos(prev => prev.map(t => t._id === todo._id ? res.data.data : t));
    } catch {
      const updated = todos.map(t => t._id === todo._id ? { ...t, completed: !t.completed } : t);
      setTodos(updated);
      saveLocal(updated);
    }
  };

  const handleDelete = async (todoId) => {
    try {
      await api.delete(`/todo/${todoId}`);
    } catch { /* ignore for local */ }
    const updated = todos.filter(t => t._id !== todoId);
    setTodos(updated);
    saveLocal(updated);
    toast.success('Todo deleted');
  };

  const startEdit = (todo) => {
    setEditTodo(todo);
    setForm({
      title: todo.title,
      description: todo.description || '',
      dueDate: todo.dueDate ? todo.dueDate.split('T')[0] : '',
      priority: todo.priority || 'medium'
    });
    setShowForm(true);
  };

  const filtered = todos.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const stats = {
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length
  };

  if (loading) return <div className="page-loading">Loading todos...</div>;

  return (
    <div className="todo-page">
      <div className="todo-header">
        <div>
          <h1 className="page-title">My Todo List</h1>
          <p className="page-subtitle">Personal task planner — only visible to you</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditTodo(null); setForm({ title: '', description: '', dueDate: '', priority: 'medium' }); }}>
          <IoAddOutline size={18} /> Add Todo
        </button>
      </div>

      {/* Stats */}
      <div className="todo-stats">
        <div className={`todo-stat-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All <span className="todo-stat-count">{stats.total}</span>
        </div>
        <div className={`todo-stat-btn ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>
          Active <span className="todo-stat-count">{stats.active}</span>
        </div>
        <div className={`todo-stat-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>
          Completed <span className="todo-stat-count">{stats.completed}</span>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="todo-form-card">
          <div className="todo-form-header">
            <h3>{editTodo ? 'Edit Todo' : 'New Todo'}</h3>
            <button className="btn-icon" onClick={resetForm}><IoCloseOutline size={20} /></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                className="form-input"
                placeholder="Todo title *"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <textarea
                className="form-textarea"
                placeholder="Description (optional)"
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <input
                  type="date"
                  className="form-input"
                  value={form.dueDate}
                  onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <select className="form-select" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                  {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)} Priority</option>)}
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : editTodo ? 'Update' : 'Add Todo'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Todo List */}
      {filtered.length === 0 ? (
        <div className="todo-empty">
          <IoCheckmarkCircle size={48} />
          <p>{filter === 'completed' ? 'No completed todos yet.' : filter === 'active' ? 'All caught up! 🎉' : 'No todos yet. Add one to get started!'}</p>
        </div>
      ) : (
        <div className="todo-list">
          {filtered.map(todo => (
            <div key={todo._id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <button className="todo-check" onClick={() => toggleComplete(todo)}>
                {todo.completed ? <IoCheckmarkCircle size={22} className="text-success" /> : <IoEllipseOutline size={22} />}
              </button>
              <div className="todo-content">
                <div className="todo-title">{todo.title}</div>
                {todo.description && <div className="todo-desc">{todo.description}</div>}
                <div className="todo-meta">
                  {todo.dueDate && (
                    <span className="todo-meta-item">
                      <IoCalendarOutline size={12} /> {new Date(todo.dueDate).toLocaleDateString()}
                    </span>
                  )}
                  <span className={`badge badge-sm badge-${priorityColor(todo.priority)}`}>
                    <IoFlagOutline size={11} /> {todo.priority}
                  </span>
                </div>
              </div>
              <div className="todo-actions">
                <button className="btn-icon" onClick={() => startEdit(todo)} title="Edit">
                  <IoCreateOutline size={16} />
                </button>
                <button className="btn-icon text-danger" onClick={() => handleDelete(todo._id)} title="Delete">
                  <IoTrashOutline size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoPage;

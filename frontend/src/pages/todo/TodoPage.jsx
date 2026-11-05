import { useState, useEffect } from 'react';
import { useMenu } from '../../context/MenuContext';
import { IoAdd, IoTrash, IoCheckmarkCircle, IoCalendar, IoEllipseOutline } from 'react-icons/io5';
import '../shared/Shared.css';
import './TodoPage.css';

const PRIORITIES = ['low', 'medium', 'high'];
const STORAGE_KEY = 'sdc_todos';

const TodoPage = () => {
  const { setActiveMenu } = useMenu();
  const [todos, setTodos] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
  });
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', priority: 'medium' });
  const [filter, setFilter] = useState('all');
  const [adding, setAdding] = useState(false);

  useEffect(() => { setActiveMenu('todo'); }, []);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(todos)); }, [todos]);

  const addTodo = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const newTodo = {
      id: Date.now(),
      title: form.title,
      description: form.description,
      dueDate: form.dueDate,
      priority: form.priority,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTodos(prev => [newTodo, ...prev]);
    setForm({ title: '', description: '', dueDate: '', priority: 'medium' });
    setAdding(false);
  };

  const toggleTodo = (id) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const filtered = todos.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const priorityColor = { low: 'var(--success)', medium: 'var(--warning)', high: 'var(--danger)' };

  const counts = { all: todos.length, active: todos.filter(t => !t.completed).length, completed: todos.filter(t => t.completed).length };

  return (
    <div className="feature-page todo-page">
      <div className="page-header">
        <h1>My Todo List</h1>
        <button className="btn btn-primary" onClick={() => setAdding(true)}><IoAdd size={18} /> Add Todo</button>
      </div>

      {adding && (
        <div className="card todo-form-card">
          <h3 style={{ marginBottom: '1rem' }}>New Todo</h3>
          <form onSubmit={addTodo}>
            <div className="form-group">
              <label>Title</label>
              <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="What needs to be done?" required />
            </div>
            <div className="form-group">
              <label>Description (optional)</label>
              <textarea className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Add details..." />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Due Date</label>
                <input className="form-input" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select className="form-input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => setAdding(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Add Todo</button>
            </div>
          </form>
        </div>
      )}

      <div className="todo-tabs">
        {['all', 'active', 'completed'].map(tab => (
          <button key={tab} className={`todo-tab ${filter === tab ? 'todo-tab-active' : ''}`} onClick={() => setFilter(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <span className="todo-tab-count">{counts[tab]}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <IoCalendar size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>No todos here</h3>
          <p>{filter === 'completed' ? 'No completed tasks yet.' : 'Add your first todo!'}</p>
        </div>
      ) : (
        <div className="todo-list">
          {filtered.map(todo => (
            <div key={todo.id} className={`todo-item ${todo.completed ? 'todo-completed' : ''}`}>
              <button className="todo-check-btn" onClick={() => toggleTodo(todo.id)}>
                {todo.completed
                  ? <IoCheckmarkCircle size={22} style={{ color: 'var(--success)' }} />
                  : <IoEllipseOutline size={22} style={{ color: 'var(--text-muted)' }} />
                }
              </button>
              <div className="todo-content">
                <div className="todo-header-row">
                  <h4 className="todo-title">{todo.title}</h4>
                  <div className="todo-meta">
                    <span className="todo-priority" style={{ color: priorityColor[todo.priority] }}>
                      ● {todo.priority}
                    </span>
                    {todo.dueDate && (
                      <span className="todo-due">
                        <IoCalendar size={12} /> {new Date(todo.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                {todo.description && <p className="todo-desc">{todo.description}</p>}
              </div>
              <button className="btn-icon todo-delete" onClick={() => deleteTodo(todo.id)}>
                <IoTrash size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoPage;

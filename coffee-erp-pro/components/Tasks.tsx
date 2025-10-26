
import React, { useState, useMemo, useEffect } from 'react';
import { useMockData } from '../hooks/useMockData';
import { Todo, User, Priority, TaskStatus, Comment } from '../types';

// Props
interface TasksProps {
    // FIX: Correct prop type to get dataService
    data: ReturnType<typeof useMockData>['dataService'];
    currentUser: User | null;
}

type SortByType = 'dueDate' | 'createdAt' | 'text' | 'priority';

// Helper functions for styling
const getPriorityClass = (priority: Priority): string => {
    switch(priority) {
        case Priority.HIGH: return 'bg-red-100 text-red-800';
        case Priority.MEDIUM: return 'bg-yellow-100 text-yellow-800';
        case Priority.LOW: return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

const getStatusClass = (status: TaskStatus): string => {
    switch(status) {
        case TaskStatus.TODO: return 'bg-gray-200 text-gray-800';
        case TaskStatus.IN_PROGRESS: return 'bg-blue-200 text-blue-800';
        case TaskStatus.DONE: return 'bg-green-200 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('en-CA');
}

// Main Component
const Tasks: React.FC<TasksProps> = ({ data, currentUser }) => {
    const { todos: todosCrud, users: usersCrud, comments: commentsCrud } = data;
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
    const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
    const [sortBy, setSortBy] = useState<SortByType>('priority');
    const [showDone, setShowDone] = useState(false);

    const allTodos = todosCrud.getAll();
    const allUsers = usersCrud.getAll();

    const userMap = useMemo(() => 
        allUsers.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
        }, {} as Record<string, User>), 
    [allUsers]);

    const commentCounts = useMemo(() => {
        return commentsCrud.getAll().reduce((acc, comment) => {
            acc[comment.taskId] = (acc[comment.taskId] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
    }, [commentsCrud.getAll()]);

    const sortedAndFilteredTodos = useMemo(() => {
        const filtered = allTodos.filter(todo => showDone ? true : todo.status !== TaskStatus.DONE);

        return filtered.sort((a, b) => {
            switch (sortBy) {
                case 'priority':
                    const priorityOrder = { [Priority.HIGH]: 1, [Priority.MEDIUM]: 2, [Priority.LOW]: 3 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                case 'dueDate':
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                case 'createdAt':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'text':
                    return a.text.localeCompare(b.text);
                default:
                    return 0;
            }
        });
    }, [allTodos, sortBy, showDone]);

    const handleAdd = () => {
        setEditingTodo(null);
        setIsFormOpen(true);
    };

    const handleEdit = (todo: Todo) => {
        setEditingTodo(todo);
        setIsFormOpen(true);
    };

    const handleViewDetails = (todo: Todo) => {
        setSelectedTodo(todo);
        setIsDetailsOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            todosCrud.remove(id);
        }
    };

    const handleSaveForm = (text: string, dueDate: string | undefined, priority: Priority, assignedTo: string | undefined) => {
        if (editingTodo) {
            todosCrud.update(editingTodo.id, { text, dueDate, priority, assignedTo });
        } else {
            todosCrud.add({ text, dueDate, priority, assignedTo, status: TaskStatus.TODO, createdAt: new Date().toISOString().split('T')[0] });
        }
        setIsFormOpen(false);
        setEditingTodo(null);
    };

    const handleStatusChange = (todoId: string, newStatus: TaskStatus) => {
        todosCrud.update(todoId, { status: newStatus });
        if (selectedTodo?.id === todoId) {
            setSelectedTodo(prev => prev ? { ...prev, status: newStatus } : null);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-brand-brown-900">Tasks</h1>
                <div className="flex items-center gap-4">
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortByType)} className="p-2 border border-gray-300 rounded-md shadow-sm bg-white">
                        <option value="priority">Sort by Priority</option>
                        <option value="dueDate">Sort by Due Date</option>
                        <option value="createdAt">Sort by Creation Date</option>
                        <option value="text">Sort Alphabetically</option>
                    </select>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={showDone} onChange={() => setShowDone(!showDone)} className="h-4 w-4 rounded border-gray-300 text-brand-brown-600 focus:ring-brand-brown-500"/>
                        <span className="text-sm font-medium text-gray-700">Show Done</span>
                    </label>
                    <button onClick={handleAdd} className="px-5 py-2 bg-brand-brown-700 text-white font-semibold rounded-lg shadow-md hover:bg-brand-brown-800 transition-colors">
                        Add Task
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-brand-brown-200">
                        <thead className="bg-brand-brown-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">Task</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">Assigned To</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">Due Date</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-brand-brown-700 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-brand-brown-200">
                            {sortedAndFilteredTodos.map(todo => {
                                const user = todo.assignedTo ? userMap[todo.assignedTo] : undefined;
                                const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && todo.status !== TaskStatus.DONE;
                                const commentCount = commentCounts[todo.id] || 0;
                                
                                return (
                                    <tr key={todo.id} className={`hover:bg-brand-brown-50 ${isOverdue ? 'bg-red-50' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(todo.status)}`}>
                                                {todo.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-brand-brown-900">
                                            <p className={`${todo.status === TaskStatus.DONE ? 'line-through text-gray-500' : ''}`}>{todo.text}</p>
                                            {commentCount > 0 && 
                                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                                    {commentCount}
                                                </div>
                                            }
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user && <img className="w-8 h-8 rounded-full" src={`https://i.pravatar.cc/150?u=${user.id}`} alt={user.username} title={`Assigned to ${user.username}`}/>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityClass(todo.priority)}`}>
                                                {todo.priority}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isOverdue ? 'text-red-600 font-bold' : 'text-gray-600'}`}>{formatDate(todo.dueDate)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                            <button onClick={() => handleViewDetails(todo)} className="text-blue-600 hover:text-blue-900">Details</button>
                                            <button onClick={() => handleEdit(todo)} className="text-brand-brown-600 hover:text-brand-brown-900">Edit</button>
                                            <button onClick={() => handleDelete(todo.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                        </td>
                                    </tr>
                                )
                            })}
                             {sortedAndFilteredTodos.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center text-gray-500 py-8">No tasks found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {isFormOpen && <TodoForm todo={editingTodo} users={allUsers} onSave={handleSaveForm} onClose={() => setIsFormOpen(false)} />}
            {isDetailsOpen && selectedTodo && currentUser && (
                <TaskDetailsModal
                    todo={selectedTodo}
                    users={allUsers}
                    comments={commentsCrud.getAll().filter(c => c.taskId === selectedTodo.id)}
                    currentUser={currentUser}
                    onClose={() => setIsDetailsOpen(false)}
                    onStatusChange={handleStatusChange}
                    onAddComment={(taskId, text) => commentsCrud.add({ taskId, text, userId: currentUser.id, createdAt: new Date().toISOString() })}
                    onDeleteComment={(commentId) => commentsCrud.remove(commentId)}
                />
            )}
        </div>
    );
};

// Modals
interface TaskDetailsModalProps {
    todo: Todo;
    users: User[];
    comments: Comment[];
    currentUser: User;
    onClose: () => void;
    onStatusChange: (todoId: string, newStatus: TaskStatus) => void;
    onAddComment: (taskId: string, text: string) => void;
    onDeleteComment: (commentId: string) => void;
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ todo, users, comments, currentUser, onClose, onStatusChange, onAddComment, onDeleteComment }) => {
    const [newComment, setNewComment] = useState('');
    const userMap = useMemo(() => users.reduce((acc, user) => { acc[user.id] = user; return acc; }, {} as Record<string, User>), [users]);

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        onAddComment(todo.id, newComment);
        setNewComment('');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-brand-brown-900">{todo.text}</h2>
                    <button onClick={onClose} className="p-2 -m-2 text-gray-500 hover:text-gray-800 text-3xl leading-none">&times;</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 border-b pb-4">
                    <div>
                        <label className="text-sm font-medium text-gray-500">Status</label>
                        <select value={todo.status} onChange={(e) => onStatusChange(todo.id, e.target.value as TaskStatus)} className="mt-1 w-full p-2 border border-gray-300 rounded-md">
                            {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Priority</p>
                        <p className="mt-1 font-semibold text-brand-brown-800">{todo.priority}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Due Date</p>
                        <p className="mt-1 font-semibold text-brand-brown-800">{formatDate(todo.dueDate)}</p>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                    <h3 className="text-lg font-semibold text-brand-brown-800">Comments</h3>
                    {comments.length > 0 ? (
                        comments.map(comment => (
                            <div key={comment.id} className="flex items-start space-x-3">
                                <img className="w-8 h-8 rounded-full" src={`https://i.pravatar.cc/150?u=${comment.userId}`} alt={userMap[comment.userId]?.username} />
                                <div className="flex-1">
                                    <div className="bg-gray-100 rounded-lg p-3">
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm font-semibold text-brand-brown-800">{userMap[comment.userId]?.username}</p>
                                            {comment.userId === currentUser.id && (
                                                <button onClick={() => onDeleteComment(comment.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(comment.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 text-center">No comments yet.</p>
                    )}
                </div>

                <form onSubmit={handleAddComment} className="mt-4 pt-4 border-t flex items-start space-x-3">
                    <img className="w-8 h-8 rounded-full" src={`https://i.pravatar.cc/150?u=${currentUser.id}`} alt={currentUser.username} />
                    <div className="flex-1">
                        <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." rows={2} className="w-full p-2 border border-gray-300 rounded-md"></textarea>
                        <button type="submit" className="mt-2 px-4 py-2 bg-brand-brown-700 text-white text-sm font-semibold rounded-lg hover:bg-brand-brown-800">Post Comment</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface TodoFormProps {
    todo: Todo | null;
    users: User[];
    onSave: (text: string, dueDate: string | undefined, priority: Priority, assignedTo: string | undefined) => void;
    onClose: () => void;
}
const TodoForm: React.FC<TodoFormProps> = ({ todo, users, onSave, onClose }) => {
    const [text, setText] = useState(todo?.text || '');
    const [dueDate, setDueDate] = useState(todo?.dueDate || '');
    const [priority, setPriority] = useState<Priority>(todo?.priority || Priority.MEDIUM);
    const [assignedTo, setAssignedTo] = useState(todo?.assignedTo || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSave(text, dueDate || undefined, priority, assignedTo || undefined);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold text-brand-brown-900 mb-6">{todo ? 'Edit' : 'Create'} Task</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="task-description" className="block text-sm font-medium text-gray-700">Task Description</label>
                        <input id="task-description" type="text" value={text} onChange={(e) => setText(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
                            <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">Assign To</label>
                            <select id="assignedTo" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                                <option value="">Unassigned</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="due-date" className="block text-sm font-medium text-gray-700">Due Date (Optional)</label>
                        <input id="due-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-5 py-2 bg-brand-brown-700 text-white font-semibold rounded-lg shadow-md hover:bg-brand-brown-800">Save Task</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Tasks;

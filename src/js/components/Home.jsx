import React, { useState, useEffect } from "react";

const TodoList = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [userCreated, setUserCreated] = useState(false);

  // URL base de la API
  const API_URL = "https://playground.4geeks.com/todo";

  // 1. Cargar tareas al iniciar o cuando cambia el usuario
  useEffect(() => {
    if (userCreated) {
      fetchTasks();
    }
  }, [userCreated]);

  // Crear usuario
  const createUser = async () => {
    if (!username.trim()) return;
    
    try {
      const response = await fetch(`${API_URL}/users/${username}`, {
        method: "POST",
      });
      if (response.ok) {
        setUserCreated(true);
        alert(`Usuario ${username} creado con éxito!`);
      }
    } catch (error) {
      console.error("Error creando usuario:", error);
    }
  };

  // Obtener tareas
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/${username}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data.todos);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Agregar tarea
  const addTask = async () => {
    if (!newTask.trim() || !userCreated) return;

    try {
      const response = await fetch(`${API_URL}/todos/${username}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label: newTask,
          is_done: false,
        }),
      });

      if (response.ok) {
        setNewTask("");
        await fetchTasks(); // Actualizar lista después de agregar
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // 3. Eliminar tarea
  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(`${API_URL}/todos/${taskId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchTasks(); // Actualizar lista después de eliminar
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // 4. Limpiar todas las tareas
  const clearAllTasks = async () => {
    if (!userCreated || tasks.length === 0) return;

    try {
      // Eliminar cada tarea individualmente (la API no tiene un endpoint para borrar todas)
      await Promise.all(
        tasks.map((task) =>
          fetch(`${API_URL}/todos/${task.id}`, { method: "DELETE" })
        )
      );
      await fetchTasks(); // Actualizar lista vacía
    } catch (error) {
      console.error("Error clearing tasks:", error);
    }
  };

  // Renderizado condicional para usuario no creado
  if (!userCreated) {
    return (
      <div className="container mt-5">
        <h2>Crear Usuario</h2>
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button
            className="btn btn-primary"
            onClick={createUser}
          >
            Crear Usuario
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2>Lista de Tareas de {username}</h2>
      
      {/* Formulario para añadir tareas */}
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Nueva tarea"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
        />
        <button
          className="btn btn-success"
          onClick={addTask}
        >
          Añadir
        </button>
      </div>

      {/* Botón para limpiar todas las tareas */}
      {tasks.length > 0 && (
        <button
          className="btn btn-danger mb-3"
          onClick={clearAllTasks}
        >
          Limpiar Todas las Tareas
        </button>
      )}

      {/* Lista de tareas */}
      {loading ? (
        <p>Cargando tareas...</p>
      ) : tasks.length === 0 ? (
        <p>No hay tareas pendientes</p>
      ) : (
        <ul className="list-group">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              {task.label}
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => deleteTask(task.id)}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TodoList;
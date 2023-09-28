import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Emoji from 'react-emoji-render';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faCheck, faPlus } from '@fortawesome/free-solid-svg-icons';

import './index.js';

class App extends React.Component {
  constructor(props) {
    super(props);

    // Load tasks from localStorage if available, or initialize with an empty array
    const savedTasks = localStorage.getItem('tasks');
    this.state = {
      tasks: savedTasks ? JSON.parse(savedTasks) : [],
      newTask: '',
    };
  }

  // Save tasks to localStorage whenever the state changes
  saveTasksToLocalStorage = () => {
    localStorage.setItem('tasks', JSON.stringify(this.state.tasks));
  };

  componentDidMount() {
    // Handle the beforeunload event to save tasks when the user refreshes or closes the page
    window.addEventListener('beforeunload', this.saveTasksToLocalStorage);
  }

  componentWillUnmount() {
    // Remove the event listener to avoid memory leaks
    window.removeEventListener('beforeunload', this.saveTasksToLocalStorage);
  }

  handleNewTask = (event) => {
    this.setState({ newTask: event.target.value });
  };

  handleAddNewTask = () => {
    const { newTask } = this.state;
    if (newTask && newTask.trim() !== '') {
      const tasks = [...this.state.tasks];
      const task = {
        taskDiscription: this.state.newTask,
        id: Math.floor(Math.random() * 1000),
        isDone: false,
        letToEdit: false,
      };
      tasks.push(task);
      this.setState(
        {
          tasks,
          newTask: '',
        },
        () => {
          // Save tasks to localStorage after adding a new task
          this.saveTasksToLocalStorage();
        }
      );
    }
  };

  handleActiveEditInput = (id) => {
    const { tasks } = this.state;
    const taskToEditIndex = tasks.findIndex((task) => task.id === id);
    const taskToEdit = tasks[taskToEditIndex];
    taskToEdit.letToEdit = !taskToEdit.letToEdit;
    const allTasks = [...tasks];
    allTasks[taskToEditIndex] = taskToEdit;
    this.setState(
      { tasks: allTasks },
      () => {
        // Save tasks to localStorage after editing
        this.saveTasksToLocalStorage();
      }
    );
  };

  handleEditTask = (event, id) => {
    const newValue = event.target.value;
    if (newValue && newValue.trim() !== '') {
      const { tasks } = this.state;
      const taskToEditIndex = tasks.findIndex((task) => task.id === id);
      const taskToEdit = tasks[taskToEditIndex];
      taskToEdit.taskDiscription = newValue;
      const allTasks = [...tasks];
      allTasks[taskToEditIndex] = taskToEdit;
      this.setState(
        { tasks: allTasks },
        () => {
          // Save tasks to localStorage after editing
          this.saveTasksToLocalStorage();
        }
      );
    }
  };

  handleDeleteTask = (id) => {
    const { tasks } = this.state;
    this.setState(
      {
        tasks: tasks.filter((task) => task.id !== id),
      },
      () => {
        // Save tasks to localStorage after deletion
        this.saveTasksToLocalStorage();
      }
    );
  };

  handleIsDone = (id) => {
    const { tasks } = this.state;
    const doneTaskIndex = tasks.findIndex((task) => task.id === id);
    const doneTask = tasks[doneTaskIndex];
    doneTask.isDone = !doneTask.isDone;
    const allTasks = [...tasks];

    // Separate completed and incomplete tasks
    const completedTasks = allTasks.filter((task) => task.isDone);
    const incompleteTasks = allTasks.filter((task) => !task.isDone);

    // Combine the incomplete and completed tasks, with completed tasks at the bottom
    const sortedTasks = incompleteTasks.concat(completedTasks);

    this.setState(
      {
        tasks: sortedTasks,
      },
      () => {
        // Save tasks to localStorage after marking as done
        this.saveTasksToLocalStorage();
      }
    );
  };

  handleReset = () => {
    // Clear all todos and return to the initial state
    this.setState(
      {
        tasks: [],
        newTask: '',
      },
      () => {
        // Save tasks to localStorage after resetting
        this.saveTasksToLocalStorage();
      }
    );
  };

  render() {
    const { tasks } = this.state;

    // Sort tasks to have completed tasks at the bottom
    tasks.sort((a, b) => {
      if (a.isDone && !b.isDone) return 1;
      if (!a.isDone && b.isDone) return -1;
      return 0;
    });

    const len = tasks.filter((task) => !task.isDone).length;

    return (
      <div id="todos-app-container">
        <div id="header">
          <h2>
            {len ? (
              len !== 1 ? (
                len > 5 ? (
                  <Emoji text="OMG there is a lot to do &#128542;" />
                ) : (
                  <Emoji text={`you have ${len} tasks to do today :) `} />
                )
              ) : (
                <Emoji text="just one task to do &#128526;" />
              )
            ) : (
              <Emoji text="nothing to do today &#129300;" />
            )}
          </h2>
          <button onClick={this.handleReset}>Reset</button>
        </div>
        <NewTask newTask={this.handleNewTask} addNewTask={this.handleAddNewTask} />
        <Tasks
          tasks={this.state.tasks}
          activeEditInput={this.handleActiveEditInput}
          editTask={this.handleEditTask}
          deleteTask={this.handleDeleteTask}
          toggleDone={this.handleIsDone}
        />
      </div>
    );
  }
}

const NewTask = ({ newTask, addNewTask }) => {
  const handleKeyPress = (event) => {
    // Check if Enter key is pressed (key code 13)
    if (event.key === 'Enter') {
      addNewTask();
    }
  };

  return (
    <form id="new-task">
      <input
        type="text"
        placeholder="add new task"
        onChange={newTask}
        onKeyPress={handleKeyPress}
      />
      <button type="reset" onClick={addNewTask}>
        <FontAwesomeIcon icon={faPlus} />
      </button>
    </form>
  );
};

const Tasks = ({ tasks, activeEditInput, editTask, deleteTask, toggleDone }) => {
  return (
    <div id="tasks-container">
      {tasks.map((task) => (
        <Task
          taskDiscription={task.taskDiscription}
          taskIsDone={task.isDone}
          key={task.id}
          activeEditInput={() => activeEditInput(task.id)}
          letToEdit={task.letToEdit}
          editTask={(event) => editTask(event, task.id)}
          deleteTask={() => deleteTask(task.id)}
          toggleDone={() => toggleDone(task.id)}
        />
      ))}
    </div>
  );
};

const Task = ({
  taskDiscription,
  taskIsDone,
  activeEditInput,
  letToEdit,
  editTask,
  deleteTask,
  toggleDone,
}) => {
  let input = null;
  if (letToEdit) {
    input = (
      <input
        type="text"
        placeholder={taskDiscription}
        onChange={editTask}
        value={taskDiscription}
      ></input>
    );
  }
  return (
    <div className="task-item">
      <div className="text-div">
        <p
          onClick={toggleDone}
          className={
            taskIsDone && letToEdit
              ? 'done hide'
              : !taskIsDone && !letToEdit
              ? null
              : taskIsDone && !letToEdit
              ? 'done'
              : 'hide'
          }
        >
          {taskDiscription}
        </p>
        {input}
      </div>
      <div className="icon-div">
        <span onClick={activeEditInput} className={letToEdit ? 'fix' : null}>
          {!letToEdit ? (
            <FontAwesomeIcon icon={faPen} />
          ) : (
            <FontAwesomeIcon icon={faCheck} />
          )}
        </span>
        <span onClick={deleteTask} className={letToEdit ? 'fix' : null}>
          <FontAwesomeIcon icon={faTrash} />
        </span>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
export default App;

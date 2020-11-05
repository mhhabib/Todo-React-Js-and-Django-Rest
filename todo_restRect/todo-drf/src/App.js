import React, { Component } from 'react';
import './App.css';
import "bootstrap/dist/css/bootstrap.css";

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      todoList: [],
      activeItem: {
        id: null,
        title: '',
        completed:false,
      },
      editing: false,
    };
    this.fetchtask = this.fetchtask.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getCookie = this.getCookie.bind(this);
    this.startEdit = this.startEdit.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.strikeUnstrike = this.strikeUnstrike.bind(this);
  }
   getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
  componentWillMount(){
    this.fetchtask()
  }
  fetchtask() {
    fetch('http://127.0.0.1:8000/api/task-list/')
      .then(response => response.json())
      .then(data => this.setState({
        todoList:data
      }))
  }
  handleChange(e) {
    var name=e.target.name
    var value = e.target.value
    console.log('Name: ', name)
    console.log('value: ',value)
    this.setState({
      activeItem: {
        ...this.state.activeItem,
        title:value
      }
    })
  }
  handleSubmit(e) {
    e.preventDefault()
    console.log('Result: ', this.state.activeItem)
    var csrftoken=this.getCookie('csrftoken')
    var url = 'http://127.0.0.1:8000/api/task-create/'
    if (this.state.editing === true) {
      url = `http://127.0.0.1:8000/api/task-update/${ this.state.activeItem.id }/`
      this.setState({
        editing:false
      })
    }
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'X-CSRFToken':csrftoken,
      },
      body:JSON.stringify(this.state.activeItem)
    }).then((response) => {
      this.fetchtask()
      this.setState({
        activeItem: {
          id: null,
          title: '',
          completed:false,
        }
      })
    }).catch(function (error) {
      console.log('ERROR: ',console)
    })
  }
  startEdit(task) {
    this.setState({
      activeItem: task,
      editing:true,
    })
  }
  deleteItem(task) {
    var csrftoken = this.getCookie('csrftoken')
    fetch(`http://127.0.0.1:8000/api/task-delete/${task.id}/`, {
      method: 'DELETE',
      headers: {
        'Content-type': 'application/json',
        'X-CSRFToken':csrftoken,
      }
    }).then((response) => {
      this.fetchtask()
    })
  }

  strikeUnstrike(task){
    task.completed = !task.completed
    var csrftoken = this.getCookie('csrftoken')
    var url = `http://127.0.0.1:8000/api/task-update/${task.id}/`
    fetch(url, {
        method:'POST',
        headers:{
          'Content-type':'application/json',
          'X-CSRFToken':csrftoken,
        },
        body:JSON.stringify({'completed': task.completed, 'title':task.title})
      }).then(() => {
        this.fetchtask()
      })
  }
  render() {
    var task = this.state.todoList
    var self=this
    return (
      <div className="container">
          <div id="task-container">
            <div id="form-wrapper">
              <form onSubmit={this.handleSubmit} id="form">
                <div className="flex-wrapper">
                    <div style={{flex: 6}}>
                        <input onChange={this.handleChange} className="form-control" id="title" value={this.state.activeItem.title} type="text" name="title" placeholder="Add task..." />
                    </div>
                    <div style={{flex: 1}}>
                      <input id="submit" className="btn btn-warning" type="submit" name="Add" />
                    </div>
                </div>
            </form>
          </div>
          <div id="list-wrapper">   
            {task.map(function (task, index) {
              return (
                <div key={index} className="task-wrapper flex-wrapper">
                  <div onClick={()=>self.strikeUnstrike(task)} style={{ flex: 6 }}>
                    {task.completed===false?(<span>{task.title}</span>):(<strike>{task.title}</strike>)}
                  </div>
                    <div style={{flex: 1}}>
                      <button onClick={()=>self.startEdit(task)} className="btn btn-outline-info btn-sm">Edit</button>
                  </div>
                  <div style={{flex: 1}}>
                      <button onClick={()=>self.deleteItem(task)} className="btn btn-outline-danger btn-sm">Delete</button>
                  </div>
                </div>
              )
            })}  
          </div>
          </div>
      </div>
    );
  }
}

export default App;

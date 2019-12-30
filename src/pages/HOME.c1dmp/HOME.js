import wixData from 'wix-data'
import wixWindow from 'wix-window'
import { getJSON } from 'wix-fetch'
import { getActiveTodosCount } from 'backend/todoOperations';

$w.onReady(function () {
	console.log(' I AM CORVID ')
	renderTodosCount()
	$w('#addTaskButton').onClick(async () => await addTodo())

	$w('#taskInput').onKeyPress(async ({ key }) => {
		if (key === 'Enter') await addTodo()
	})

});

async function addTodo() {
	console.log('adding todo')
	const title = $w('#taskInput').value
	const newTodo = {
		title,
		isDone: false
	}
	await wixData.insert('Task', newTodo)
	await $w('#taskDataset').refresh()
	await renderTodosCount()
	$w('#taskInput').value = ''
}

async function renderTodosCount() {
	const activeTodosCount = await getActiveTodosCount()
	let countStr
	switch (activeTodosCount) {
	case 1:
		countStr = 'One Item Left'
		break;
	case 0:
		countStr = 'No Items Left'
		break;
	default:
		countStr = `${activeTodosCount} Items Left`
		break;
	}
	$w('#activeTasksCount').text = countStr
}

export async function toggleTodo(ev) {
	const { context: { itemId } } = ev
	const { target: { checked: isDone } } = ev
	const todoToUpdate = await wixData.get('Task', itemId)
	const updatedTodo = Object.assign({}, todoToUpdate, { isDone })
	await wixData.update('Task', updatedTodo)
	$w('#taskDataset').refresh()
	await renderTodosCount()
}

export async function filterTodos(ev) {
	const { target: { value: filterValue } } = ev
	let filter
	switch (filterValue) {
	case 'Completed':
		filter = wixData.filter().eq('isDone', true)
		break;
	case 'Active':
		filter = wixData.filter().eq('isDone', false)
		break;
	case 'All Tasks':
		filter = wixData.filter()
		break;
	}
	await $w('#taskDataset').setFilter(filter)
}

export async function confirmDelete(event) {
	const res = await wixWindow.openLightbox('Clear Confirmation')
	if (!res) return
	const { items: completedTodos } = await wixData.query('Task').eq('isDone', true).find()
	const todosToDeleteIds = completedTodos.map(todo => todo._id)
	const removeRes = await wixData.bulkRemove('Task', todosToDeleteIds)
	await $w('#taskDataset').refresh()

}

export async function getRandomTodos(ev) {
	const todos = await getJSON('https://jsonplaceholder.typicode.com/todos')
	console.log(todos)
	const realTodos = todos.slice(0, 10).map(todo => {
		return {title:todo.title, isDone:todo.completed}
	})
	await wixData.bulkInsert('Task', realTodos)
	await $w('#taskDataset').refresh()
}
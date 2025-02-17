import type { File, Task, TaskResultPack } from '../types'

export class StateManager {
  filesMap = new Map<string, File>()
  idMap = new Map<string, Task>()
  taskFileMap = new WeakMap<Task, File>()

  getFiles(keys?: string[]): File[] {
    if (keys)
      return keys.map(key => this.filesMap.get(key)!)
    return Array.from(this.filesMap.values())
  }

  collectFiles(files: File[] = []) {
    files.forEach((file) => {
      this.filesMap.set(file.filepath, file)
      this.updateId(file)
    })
  }

  updateId(task: Task) {
    if (this.idMap.get(task.id) === task)
      return
    this.idMap.set(task.id, task)
    if (task.type === 'suite') {
      task.tasks.forEach((task) => {
        this.updateId(task)
      })
    }
  }

  updateTasks(packs: TaskResultPack[]) {
    for (const [id, result] of packs) {
      if (this.idMap.has(id))
        this.idMap.get(id)!.result = result
    }
  }
}

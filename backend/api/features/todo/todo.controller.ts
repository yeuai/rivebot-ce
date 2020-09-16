import { Controller, Get, Put, RequestParam, Delete, Post, RequestBody } from '@kites/rest';
import { TodoService } from './todo.service';
import { Inject } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';

@Controller('/todo')
export class TodoController {

  constructor(
    @Inject(KITES_INSTANCE)
    private kites: KitesInstance,
    @Inject(TodoService)
    private svTodo: TodoService,
  ) { }

  @Get('/')
  list() {
    this.kites.logger.info('Get all todo ...');
    return this.svTodo.getAll();
  }

  @Get('/:id')
  details(@RequestParam('id') task) {
    return this.svTodo.get(task);
  }

  @Post('/')
  create(@RequestBody() body) {
    return this.svTodo.create(body);
  }

  @Put('/:id')
  begin(
    @RequestParam('id') task,
    @RequestBody() body,
  ) {
    const user = body.user;
    const msg = this.svTodo.begin(task);
    this.kites.logger.info(`Update task ${task} from ${user}`);
    return { msg, user };
  }

  /**
   * HTTP Delete with a route middleware
   * @param task
   */
  @Delete('/:id', (req, res, next) => {
    const id = req.param('id');
    // console.log(`Preparing delete: task ${id}`);
    next();
  })
  remove(@RequestParam('id') task) {
    return this.svTodo.trash(task);
  }
}

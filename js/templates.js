export const messages = {
  errorText: 'The text length cannot be more than 100 characters and less than 3 characters',
  errorEmpty: 'This field must be filled',
  errorDate: {
    smDate: 'The date must be greater than the current one',
    lgDate: 'The date must be no later than one year in advance',
  },
  errorTime: {
    getDate: 'First fill in the date field correctly',
    smTime: 'The time should be 30 minutes longer than now.',
  },
  notifications: {
    // Notification Texts
    textAdd: 'New task added',
    textRemove: 'Task deleted',
    textDone: 'The task is done',
    textArchive: 'The task has been added to the archive',
    textUnarchive: 'The task was extracted from the archive',
    testEdit: 'The task has been changed',
    // Notification Types
    typeAdd: 'add-task',
    typeRemove: 'remove-task',
    typeDone: 'done-task',
    typeArchive: 'archive-task',
    typeEdit: 'edit-task',
  },
};

export const categories = {
  urgent: 'Urgently',
  study: 'Education',
  work: 'Work',
  hobby: 'Hobby',
};

export const patterns = {
  characters: /^.{3,100}$/,
};

export const markups = {
  notification:
    `<div class="notification">
      <div class="notification__text"></div>
    </div>`,
  task:
    `<li class="task-list__item">
      <div class="task">
        <div class="task__head">
          <div class="task__check">
            <input class="sr-only checkbox-input" type="checkbox">
            <label class="task__checkbox checkbox"></label>
            <div class="task__name"></div>
          </div>
          <div class="task__actions">
            <button class="btn btn--icon btn--orange task__btn task__btn--edit" type="button" title="Edit"></button>
            <button class="btn btn--icon btn--red task__btn task__btn--remove" type="button" title="Remove"></button>
          </div>
        </div>
        <div class="task__info">
          <div class="task__category"></div>
          <div class="task__date"></div>
        </div>
      <button class="btn btn--icon btn--gray task__btn task__btn--archive" type="button" title="Archive/Extract"></button>
      </div>
    </li>`,
  editable:
    `<form class="form form--edit" name="editTask">
      <div class="add-task">
        <div class="add-task__group">
            <textarea class="form-field" id="task-text" name="taskText"></textarea>
            <div class="form-error-msg"></div>
        </div>
        <div class="d-flex j-end g-10">
            <button class="btn btn--sm btn--gray js_reject-changes" type="button">Cancel</button>
            <button class="btn btn--sm btn--green js_save-changes" type="button">Save</button>
        </div>
      </div>
    </form>`
};
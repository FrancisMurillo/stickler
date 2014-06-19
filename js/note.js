/* Create a note */
function createNewNote(width , height , target_elem , note_class) {	
	var noteTemplate = "\
			<div id='{{noteID}}' class='note note-task'> \
				<header class='note-header note-task-header'> \
					<a	class='note-header-cancel'><span class='ui-icon ui-icon-close'></span></a> \
					<span class='timeago' title='{{noteDate}}'></span> \
				</header> \
				<section class='note-body note-main note-task-main'> \
					<textarea class='note-task-title' placeholder='<Your Note Title>'></textarea> \
					<textarea class='note-task-result' placeholder='<Your Task Result>'></textarea>\
				</section>\
				<section class='note-body note-task-subtask'>\
					<header class='note-task-subtask-group'>\
						<a class='note-task-subtask-add'><span class='ui-icon ui-icon-plus'></span></a>\
						<span class='note-task-subtask-title'>Subtasks</span>\
						<a class='note-task-subtask-collapse'><span class='ui-icon ui-icon-triangle-1-s'></span></a>\
						<a class='note-task-subtask-checked'><span class='ui-icon ui-icon-check'></span></a>\
					</header>\
					<section class='note-task-subtasks'>\
						<span class='subtask-notask'>No subtasks</span>\
						<ul class='subtask-list'>\
						</ul>\
					</section>\
				</section>\
				<footer class='note-footer'>\
				</footer>\
			</div>";
	var $newNote = $(Mustache.render(noteTemplate, {
		noteID: 'note-task-' +  Date.now().toString() , //Cheap ID
		noteDate: new Date().toISOString()
	}));
	$newNote.on('click.raise' , function() {
		$(this).css('z-index' , nextZIndex(note_class));
	});
	$newNote.find('.note-task-subtask-add').on('click.addsubtask', function() {
		var $section = $(this).closest('.note-task-subtask');
		var $notask = $section.find('.subtask-notask');
		$notask.hide();
		
		var $list = $section.find('.subtask-list');
				
		var taskTemplate = "\
					<li class='subtask'> \
						<div class='subtask-content' >\
							<input type='checkbox'/>\
							<textarea placeholder='<Your subtask>'></textarea>\
							</div>\
						<div class='timeago' title='{{subtaskDate}}' />\
					</li>";
		var	$task = $(Mustache.render(taskTemplate , {
			subtaskDate : new Date().toISOString()
		}));
		
		$task.find('.timeago').timeago();
		$task.find('textarea').resize({
			append: '' 
		});
		
		$list.append($task);
		fitNoteHeight($section.closest('.note'));
	});
	
	$newNote.find('.note-header-cancel').on('click.remove', function() {
		var $note = $(this).closest('.note');
		
		var noteTitle = $note.find('.note-task-title').val();
		
		if (!confirm('Are you sure you want to delete this <'+ noteTitle+'> note?')) 
			return;
		
		var noteID = $note.attr('id');	
		$('#' + noteID).remove();
	});

	$newNote.appendTo($(target_elem));	
	$newNote.draggable({
		containment:'parent' , 
		zIndex : 9007199254740992,	
		stop: function() {
			$(this).css('z-index' , nextZIndex(note_class));
		}
	})
	$newNote.resizable({
		minWidth: 150 , 
		minHeight: 100 
	});
	$newNote.find('.timeago').timeago();
	$newNote.find('textarea').autosize({
		append : '' ,
		callback : function() {
			fitNoteHeight($(this).parents('.note'));
		}
	});
					
	$newNote.css({			
		'width' 	: 	toPx(width) 	, 
		'height'	: 	toPx(height)	,
		
		'left'		:	toPx(randomNoteX(width , $('body').width()))	,
		'top'		:	toPx(randomNoteY(height , $('body').height()))	,
		
		'zIndex'	:	nextZIndex(note_class)
	});
	fitNoteHeight($newNote);
}

function nextZIndex(note_class) {
	return $.topZIndex('.' + note_class) + 1;
}

function randomNoteX(width , containerWidth) {
	return	( Math.random() * (containerWidth - 2 *  width)).toFixed();
}

/* Generates a random Y coordinate for a note, see randomNoteX() */ 	
function randomNoteY(height , containerHeight) {
	return ( Math.random() * (containerHeight - 2 *  height)).toFixed();
}

/* Fit note height */
function fitNoteHeight($note) {
	var $myNote = $($note);

	var getTotalHeight = function($arr) {
		var height = 0;
		$arr.each(function(index , elem) {
			height += $(elem).height();
		});
		return height;
	}
					
	var header = getTotalHeight($myNote.children('.note-header'));
	var body =  getTotalHeight($myNote.children('.note-body'));
	var footer = getTotalHeight($myNote.children('.note-footer'));

	$myNote.css({
		'height' : header + body + footer
	});
}


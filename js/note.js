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
						<a class='note-task-subtask-collapse'><span class='ui-icon ui-icon-triangle-1-n'></span></a>\
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

	$newNote.stickler().sticklerTask();
}

function saveSticklers() {
	var noteArea = $.fn.stickler.defaults.noteArea;
	var $noteArea = $('#' + noteArea);
	
	var noteClass = $.fn.stickler.defaults.noteClass;
	
	var notes = [];
	var noteClasses = [
						$.fn.stickler.defaults.noteHeaderClass , 
						$.fn.stickler.defaults.noteBodyClass , 
						$.fn.stickler.defaults.noteFooterClass 
						];
	var noteClassesSelector = $.map(noteClasses , function(item) {return '.' + item}).join(',');
	$noteArea.find('.' + noteClass).each(function(idx, elem) {
		var $cloned = $(elem).clone();
		$cloned.children(':not('+ noteClassesSelector+')').remove();
		notes.push($cloned);
	});
	
	var notesJSON = JSON.stringify(
						$.map(notes , function(item) {return item.outerHTML()})
						);
	localStorage.setItem('stickler__notes' ,notesJSON);
	alert('Sticklers Saved');
}

/* Load Sticklers */
function loadSticklers() {
	var noteArea = $.fn.stickler.defaults.noteArea;
	var noteClass = $.fn.stickler.defaults.noteClass;

	// Load sticklers
	var sticklers = $.map(JSON.parse(localStorage.getItem('stickler__notes')) , function(item){return $(item);})
	$.each(sticklers , function(idx , val){
		var $stickler = val;
		$('#' + noteArea).append($stickler);
	});
	
	// Attach functionality to notes
	
	var taskClass = $.fn.sticklerTask.defaults.sticklerClass;
	$('#' + noteArea).find('.' + noteClass).each(function(idx , elem) {
		var $note = $(elem);
		
		$note.stickler();
		if ($note.hasClass(taskClass)) 
			$note.sticklerTask();
		
	});
	
}

function nextZIndex(note_class) {
	return $.topZIndex('.' + note_class) + 1;
}

function randomNoteX(width , containerWidth) {
	return	( Math.random() * (containerWidth - 2 *  width)).toFixed();
}
	
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


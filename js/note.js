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
					<footer>\
						<span class='subtask-collapse'># Task</span>\
					</footer>\
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

/* Save Sticklers */
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
	var noteClassesSelector = $.map(noteClasses , function(item) {return '.' + item;}).join(',');
	$noteArea.find('.' + noteClass).each(function(idx, elem) {
		var $cloned = $(elem).clone().show();
		$cloned.children(':not('+ noteClassesSelector+')').remove();
		notes.push($cloned);
	});
	
	var notesJSON = JSON.stringify($.map(notes , function(item) {return item.outerHTML();}));
	localStorage.setItem('stickler__notes' ,notesJSON);
	alert('Sticklers Saved');
}

/* Load Sticklers */
function loadSticklers() {
	var noteArea = $.fn.stickler.defaults.noteArea;
	var noteClass = $.fn.stickler.defaults.noteClass;

	// Load sticklers
	var data = localStorage.getItem('stickler__notes');
	if (data == null || data == "" ) { return };

	$('#' + noteArea).html('');
	
	var sticklers = $.map(JSON.parse(data) , function(item){return $(item);})
	$.each(sticklers , function(idx , val){
		var $stickler = val;
		$('#' + noteArea).append($stickler);
	});
	
	// Attach functionality to notes
	var taskClass = $.fn.sticklerTask.defaults.sticklerClass;
	$('#' + noteArea).find('.' + noteClass).each(function(idx , elem) {
		var $note = $(elem);
		
		$note.stickler({} , false);
		if ($note.hasClass(taskClass))  {
			$note.sticklerTask();
		}
		
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

/* Display Notes As In Slideshow */
function displayNotesRandomly() {
	var areaClass = $.fn.stickler.defaults.noteArea;
	var $area = $('#' + areaClass);
	
	var delay = 500;
	var ctr = 0;
	shuffle($area.find('.note')).each(function(idx, el){
		var $note = $(el);
		$note.popIn(ctr , delay);
		ctr += delay;
	});
}

/* Shuffles an array randomly */
function shuffle(o) {
	for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
};

/* Filter notes by title */
function filterNotes(title) {
	var noteClass = $.fn.stickler.defaults.noteClass;
	var noteArea = $.fn.stickler.defaults.noteArea;
	var $area = $('#' + noteArea);
	
	if (title.length == 0) {
		$area.find('.' + noteClass).each(function(idx , el) {
			var $note = $(el);
			$note.show();
		});
	} else {	
		$area.find('.' + noteClass).each(function(idx , el) {
			var $note = $(el);
			$note.hide();
			if ($note.find('.' + $.fn.sticklerTask.defaults.taskTitle ).val().indexOf(title) >= 0 ) {
				$note.show();
			}
		});
	}
}

/* Syncs notes to a web service */
var DEFAULT_URL = 'http://francisavmurillo.pythonanywhere.com/stickler/notes/';
var sticklerKey = 'fmurillo'
function syncNotes(userURL) {
	var url = typeof(userURL) == 'undefined' ||  userURL == "" ? DEFAULT_URL : userURL;
	var data = localStorage.getItem('stickler__notes');
	$.ajax({
		crossdomain: true,
		cache: false , 
		url: url + sticklerKey + '/', 
		type: 'post' ,
		data: {'notes' : data }, 
		success: function(data , status , xhr) {
			alert('Data sent');
		} , 
		error: function(xhr , status , err) {
			alert('Failed to send data to ' + url);
		}
	});
}
function downloadNotes(userURL) {
	var url = typeof(userURL) == 'undefined' || userURL == "" ? DEFAULT_URL : userURL;

	$.ajax({
		crossdomain: true,
		cache: false , 
		url: url + sticklerKey + '/', 
		type: 'get' , 
		success: function(data , status , xhr) {
			var toJQuery = function(obj) {return $(obj);}

			var mapToID = function(arr) {return $.map(arr , function(obj) { return $(obj).attr('id');});}
			var zipArrayPair = function(arr1 , arr2) { // Assuming arr1 & arr2 are of equal size
				var length = arr1.length;
				var obj = {};
				for (var i = 0; i < length;i++) {
					obj[arr1[i]] = arr2[i];
				}
				return obj;
			}
			
			var new_notes = $.map( JSON.parse(data) , toJQuery);
			var new_note_set = zipArrayPair( mapToID(new_notes) , new_notes);
			var cur_notes = $.map( JSON.parse(localStorage.getItem('stickler__notes')) , toJQuery);
			var cur_note_set = zipArrayPair( mapToID(cur_notes) , new_notes);
			
			var true_notes = $.map( $.extend(cur_note_set , new_note_set) , function(val , k) {return val.outerHTML();});
			
			localStorage.setItem('stickler__notes' , JSON.stringify(true_notes));
			loadSticklers();
			alert('Data loaded');
		} , 
		error: function(xhr , status , err) {
			alert('Failed to send data to ' + url);
		}
	});
}
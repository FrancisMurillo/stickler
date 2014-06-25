// Basic Stickler Note plugin
(function($) {
	$.fn.stickler = function(options , recreate) {
		recreate = typeof(recreate) !== 'undefined' ? recreate : true
		var opts = $.extend( {} , $.fn.stickler.defaults , options );
		
		var $note = $(this);		
		$note.appendTo('#' + opts.noteArea);
				
		// Get the highest z-index in the area
		var nextZIndex = function() {
			return $.topZIndex('.' + opts.noteClass) + 1;
		}
		
		// Sends a note to the top of the pile
		var sendToTop = function() {
			$note.css('z-index' , nextZIndex());
		}
		
		// Fits a note height to it's current content
		var getNoteHeight = function() {
			var getTotalHeight = function($arr) {
				var height = 0;
				$arr.each(function(index , elem) {
					height += $(elem).height();
				});
				return height;
			}
							
			var header = getTotalHeight($note.children('.note-header'));
			var body =  getTotalHeight($note.children('.note-body'));
			var footer = getTotalHeight($note.children('.note-footer'));	
			
			return header + body + footer;
		}
		
		var fitNoteHeight = function() {
			$note.css({
				'height' :getNoteHeight()
			});
		}
		
		// Send to top on click
		$note.on('click.raise' , sendToTop);
		// Default on close
		$note.find('.note-header-cancel').on('click.remove', function() {
			var noteID = $note.attr('id');			
			if (!confirm('Are you sure you want to delete this note#'+noteID+'?')) 
				return;
			$note.remove();
		});
		
		
		// Drag n Drop 
		$note.draggable({
			containment:'parent' , 
			zIndex : 9007199254740992,	
			stop: function() {
				sendToTop();
			}
		});
		// Note resize
		$note.resizable({
			minWidth: opts.noteMinWidth , 
			minHeight: opts.noteMinHeight , 
			start : function(ev , ui) {
				$note.resizable('option' , 'minHeight' , getNoteHeight());
			}
		});
		
		// Relative time 
		$note.find('.timeago').timeago();
		// Textarea auto resize
		$note.find('textarea').autosize({
			append : '' ,
			callback : function() {
				fitNoteHeight();
			}
		});
		// Update note relative time
		$note.find('textarea').on('change.modify' , function() {
			var $time = $note.find('.note-header .timeago');
			$time.timeago('update' , new Date().toISOString());
		});
		// Autoupdate HTML on change, needed for OuterHTML save
		$note.find('textarea').on('change.update' ,function(e){
			var $text = $(this);
			$text.html($text.val());
		});
		
		// Place note in area randomly
		var $area = $('#' + opts.noteArea);
		if (recreate) {
			$note.css({			
				'width' 	: 	toPx(opts.noteWidth) 	, 
				'height'	: 	toPx(opts.noteHeight)	,
			
				'left'		:	toPx(randomPlacement(opts.noteWidth , $area.width()))	,
				'top'		:	toPx(randomPlacement(opts.noteHeight , $area.height()))	,
			
				'zIndex'	:	nextZIndex()
		}	);
			fitNoteHeight(); // Fit for safety
		}
		
		return $note;
		
	}
	$.fn.stickler.defaults = {
		noteClass	: 'note' , 
		noteArea	: 'note-area' ,
		
		noteHeaderClass	:	'note-header' , 
		noteBodyClass	:	'note-body' , 
		noteFooterClass	:	'note-footer' , 
		
		// Units in px
		noteWidth		: 200 ,
		noteMinWidth	: 150 ,
		noteHeight		: 250 ,
		noteMinHeight	: 100 
	}
	
	function randomPlacement(value , maxValue) {
		return	( Math.random() * (maxValue - 1 * value)).toFixed();
	}
	
	function toPx(unit) {
		return unit + 'px';
	}
	
	$.fn.sticklerTask = function() {
		var $note = $(this);
		
		// Fits a note height to it's current content
		var fitNoteHeight = function() {
			var getTotalHeight = function($arr) {
				var height = 0;
				$arr.each(function(index , elem) {
					height += $(elem).height();
				});
				return height;
			}
							
			var header = getTotalHeight($note.children('.note-header'));
			var body =  getTotalHeight($note.children('.note-body'));
			var footer = getTotalHeight($note.children('.note-footer'));

			$note.css({
				'height' : header + body + footer
			});
		}
		
		// Recreate subtask events
		var attachSubtaskEvents = function($task) {
			$task.find('.timeago').timeago();
			$task.find('textarea').autosize({
				append: '' 
			});
			
			// Update textarea for save and relative time
			$task.find('textarea').on('change.update' ,function(e){
				var $text = $(this);
				$text.html($text.val());
				
				$task.find('.timeago').timeago('update' , new Date().toISOString());
			});
			
			// Update checkbox for save and time as well
			$task.find('input:checkbox').change(function() {
				if ($(this).prop('checked')) {
					$(this).addClass('checked');
				} else {
					$(this).removeClass('checked');
				}
				
				$task.find('.timeago').timeago('update' , new Date().toISOString());
				$task.closest('.note').find('.note-header .timeago').timeago('update' , new Date().toISOString());
			});
			if ($task.find('input:checkbox').hasClass('checked')) {
				$task.find('input:checkbox').prop('checked' , true);
			}
			
		}
		var $tasks = $note.find('.subtask');
		$tasks.each(function(idx , elem){
			var $task = $(elem);
			attachSubtaskEvents($task);
		});
		
			
		// Add subtask
		$note.find('.note-task-subtask-add').on('click.addsubtask', function() {
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
			
			$list.append($task);
			attachSubtaskEvents($task);
			
			fitNoteHeight($section.closest('.note'));
		});
		
		$note.find('.note-task-subtask-collapse').on('click.collapse', function() {
			var $collapse = $note.find('.note-task-subtasks');
			var $icon = $(this).find('span');
			
			$icon.toggleClass('ui-icon-triangle-1-n').toggleClass('ui-icon-triangle-1-s');
			
			$collapse.toggle(125 , function() {
				fitNoteHeight($note);
			});
		});
		
		$note.find('.note-task-subtask-checked').on('click.check', function() {
			var $subtasks = $note.find('.note-task-subtasks');
			var $icon = $(this).find('span');
			
			$icon.toggleClass('ui-icon-check').toggleClass('ui-icon-circle-check');
			
			$subtasks.find('li').each(function(idx , el) {
				var hasChecked = $(el).find('input:checked').length
				if (hasChecked == 1) 
					$(el).toggle(125 , function() {
						fitNoteHeight($note);
					});
			});
		
			return $note;
		});
		
		return $note;
	}
	$.fn.sticklerTask.defaults = {
		sticklerClass	: 'note-task'
	}
}(jQuery));
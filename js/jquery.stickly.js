// Basic Stickler Note plugin
(function($) {
	$.fn.purifyStyle = function() {
		var $note = $(this);
		$note.find('*').each(function(idx, elem){$(elem).removeAttr('style');});
	}

	function nextZCoordinate(clazz) {
		return $.topZIndex('.' + clazz) + 1;
	}
	
	$.fn.stickler = function(options , recreate) {
		recreate = typeof(recreate) !== 'undefined' ? recreate : true
		var opts = $.extend( {} , $.fn.stickler.defaults , options );
		
		var $note = $(this);		
		$note.appendTo('#' + opts.noteArea);
				
		// Get the highest z-index in the area
		var nextZIndex = function() {
			return nextZCoordinate(opts.noteClass);
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
				'height' : toPercent (getNoteHeight() / $note.parent().height())
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
				
				// Relative positioning
				var p = $note.position();
				var container = $note.parent();
				var leftPercent = p.left / container.width();
				var topPercent = p.top / container.height();
				$note.css({"left": toPercent(leftPercent) , "top" : toPercent(topPercent)});
			}
		});
		// Note resize
		$note.resizable({
			containment: 'parent',
			minWidth: opts.noteMinWidth * $note.parent().width() , 
			minHeight: opts.noteMinHeight , 
			//maxHeight: $note.parent().height() * 0.90 ,
			start : function(ev , ui) {
				$note.resizable('option' , 'minHeight' , getNoteHeight());
				//$note.resizable('option' , 'maxHeight' , ($note.parent().height() - $note.position().top ) );
			} , 
			stop : function(ev , ui) {
				// Relative sizing
				var s = $note;
				var container = $note.parent();
				var widthPercent = s.width() / container.width();
				var heightPercent = s.height() / container.height();
				$note.css({"width": toPercent(widthPercent) , "height" : toPercent(heightPercent)});
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
				'width' 	: 	toPercent(opts.noteWidth)  	, 
				'height'	: 	toPercent(opts.noteHeight)	,
			
				'left'		:	toPercent(randomPlacement(opts.noteWidth ))	,
				'top'		:	toPercent(randomPlacement(opts.noteHeight))	,
			
				'zIndex'	:	nextZIndex()
			});
			fitNoteHeight(); // Fit for safety
		}
		
		// Make sure the note is absolute in the area
		$note.css({
			'position' : 'absolute'
		});
		
		return $note;
		
	}
	$.fn.stickler.defaults = {
		noteClass	: 'note' , 
		noteArea	: 'note-area' ,
		
		noteHeaderClass	:	'note-header' , 
		noteBodyClass	:	'note-body' , 
		noteFooterClass	:	'note-footer' , 
		
		// Units in %
		noteWidth		: .20 ,
		noteMinWidth	: .15 ,
		noteHeight		: .25 ,
		noteMinHeight	: .10 
	}
	
	function randomPlacement(value ) {
		return	( Math.random() * (1 - value)) ;
	}
	
	function toPx(unit) {
		return unit + 'px';
	}
	
	function toPercent(unit) {
		return (100 * unit) + "%";
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
				'height' : (header + body + footer) + 'px'
			});
			
			$note.find('.subtask-list').css({
				'max-height' : $('#' + $.fn.stickler.defaults.noteArea).height() 
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
				
				if ($text.val().length == 0) {
					$task.remove();
					fitNoteHeight($note);
				}
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
				
				var $section = $task.closest('.note-task-subtask').find('.note-task-subtask-checked span');
				if ($section.hasClass('ui-icon-circle-check')) {
					$task.toggle(125 , function() {fitNoteHeight($note)});
				}
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
		
		// Collapse subtask
		$note.find('.subtask-collapse').hide();
		$note.find('.note-task-subtask-collapse').on('click.collapse', function() {
			var $collapse = $note.find('.note-task-subtasks');
			var $icon = $(this).find('span');
			
			$icon.toggleClass('ui-icon-triangle-1-n').toggleClass('ui-icon-triangle-1-s');
			
			$collapse.toggle(125 , function() {
				fitNoteHeight($note);			
			});
			
			if ($icon.hasClass('ui-icon-triangle-1-n')) {
				$note.find('.subtask-collapse').html('This is hidden').hide();
			} else {
				var $tasks = $note.find('input:checkbox');
				var $unfinished = $note.find('input:checkbox:not(:checked)');
				
				$note.find('.subtask-collapse').html('Total tasks:' + $tasks.length + ';Open tasks:' + $unfinished.length).show();
			}
		});
		
		$note.find('.note-task-subtask-checked').on('click.check', function() {
			var $subtasks = $note.find('.note-task-subtasks');
			var $icon = $(this).find('span');
			
			$icon.toggleClass('ui-icon-check').toggleClass('ui-icon-circle-check');
			
			$subtasks.find('li').each(function(idx , el) {
				var hasChecked = $(el).find('input:checked').prop('checked')
				if (hasChecked ) {
					$(el).toggle(125 , function() {
						fitNoteHeight($note);
					});
				} 
			});
		
			return $note;
		});
		
		return $note;
	}
	$.fn.sticklerTask.defaults = {
		sticklerClass	: 'note-task' ,
		
		taskTitle		: 'note-task-title'
	}
	
	$.fn.popIn = function(delay , duration) {
		var $note = $(this);
		$note.hide();
		window.setTimeout(function() {	
			$note.css('z-index' , nextZCoordinate($.fn.stickler.defaults.noteClass));
			$note.fadeIn(duration);
		}, delay );
	}
	
}(jQuery));
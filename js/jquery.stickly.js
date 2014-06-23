// Basic Stickler Note plugin
(function($) {
	$.fn.stickler = function(options) {
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
			minHeight: opts.noteMinHeight
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
		
		// Place note in area randomly
		var $area = $('#' + opts.noteArea);
		$note.css({			
			'width' 	: 	toPx(opts.noteWidth) 	, 
			'height'	: 	toPx(opts.noteHeight)	,
			
			'left'		:	toPx(randomPlacement(opts.noteWidth , $area.width()))	,
			'top'		:	toPx(randomPlacement(opts.noteHeight , $area.height()))	,
			
			'zIndex'	:	nextZIndex()
		});
		fitNoteHeight(); // Fit for safety
		
		return $note;
		
	}
	$.fn.stickler.defaults = {
		noteClass	: 'note' , 
		noteArea	: 'note-area' ,
		
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
	
}(jQuery));

// Task Note plugin
(function($) {

}(jQuery));
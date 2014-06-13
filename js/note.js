/* Create a note */
function createNewNote(width , height , target_elem , note_class) {	
	var noteHTML = "<div></div>";
	var $newNote = $(noteHTML, {
						'class'	:	note_class	,
						'text'	:	'Hello'		,
						'on'	:	{
							'click'	:	function() { // Raise the clicked note to view
								$(this).css('z-index' , nextZIndex(note_class));
							}
						}				
					});

	$newNote.appendTo($(target_elem));	
	$newNote.draggable({
		containment:'parent' , 
		zIndex : 9007199254740992,	
		stop: function() {
			$(this).css('z-index' , nextZIndex(note_class));
		}
	})
	$newNote.resizable();
					
	$newNote.css({			
		'width' 	: 	toPx(width) 	, 
		'height'	: 	toPx(height)	,
		
		'left'		:	toPx(randomNoteX(width , $('body').width()))	,
		'top'		:	toPx(randomNoteY(height , $('body').height()))	,
		
		'zIndex'	:	nextZIndex(note_class)
	});
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
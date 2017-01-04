define(function(require) {
	
	var $ = require('jquery');
	var Ajax = require('elgg/Ajax');
	var elgg = require('elgg');
	
	var comments_loading = false;
	
	var advanced_comments_is_scrolled_into_view = function(elem){
	    var docViewTop = $(window).scrollTop();
	    var docViewBottom = docViewTop + $(window).height();

	    var elemTop = $(elem).offset().top;
	    var elemBottom = elemTop + $(elem).height();

	    return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom));
	};

	var advanced_comment_load_comments = function(data) {
		
		if (comments_loading) {
			return;
		}
		comments_loading = true;
		
		var ajax = new Ajax();
		ajax.view('advanced_comments/load', {
			data: data,
			success: function(result) {
				if (data.auto_load === 'yes' && parseInt(data.offset) !== 0) {
					var $html = $('<div>' + result + '</div>');
					
					// add comments to the list
					$('#advanced-comment-list ul.elgg-list').append($html.find('ul.elgg-list').html());
					
					// replace more button
					$('#advanced-comments-more').replaceWith($html.find('#advanced-comments-more'));
				} else {
					$('#advanced-comment-list').html(result).focus();
				}
			},
			complete: function() {
				comments_loading = false;
			}
		});
	};
	
	var advanced_comments_change = function() {
		
		var ajax = new Ajax();
		var $form = $(this).closest('form');
		var data = ajax.objectify($form);
		
		advanced_comment_load_comments(data);
	};
	
	var advanced_comments_pagination = function() {
		
		var ajax = new Ajax();
		var $form = $('#advanced-comments-form');
		
		var data = ajax.objectify($form);
		var query = elgg.parse_url($(this).prop('href'), 'query', true);
		
		data.offset = query.offset;
		data.save_settings = null;
		
		advanced_comment_load_comments(data);
		
		return false;
	};
	
	var advanced_comments_check_autoload = function() {
		
		if (!$('#advanced-comments-more').length) {
			// no autoload placeholder found
			return;
		}
		
		if (!advanced_comments_is_scrolled_into_view('#advanced-comments-more')) {
			// placeholder not in view
			return;
		}
		
		$('#advanced-comments-more a').click();
	};
	
	var advanced_comments_load_more = function() {
		
		var ajax = new Ajax();
		var data = elgg.parse_url($(this).prop('href'), 'query', true);

		advanced_comment_load_comments(data);
		
		return false;
	};

	$(document).on('change', '#advanced-comments-form select', advanced_comments_change);
	$(document).on('click', '#advanced-comment-list .elgg-pagination a', advanced_comments_pagination);
	$(document).on('click', '#advanced-comments-more a', advanced_comments_load_more);
	$(window).on('scroll', advanced_comments_check_autoload);
});
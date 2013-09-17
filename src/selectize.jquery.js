$.fn.selectize = function(settings) {
	settings = settings || {};

	var defaults = $.fn.selectize.defaults;
	var dataAttr = settings.dataAttr || defaults.dataAttr;

	/**
	 * Initializes selectize from a <input type="text"> element.
	 *
	 * @param {object} $input
	 * @param {object} settings
	 */
	var init_textbox = function($input, settings_element) {
		var i, n, values, value = $.trim($input.val() || '');
		if (!value.length) return;

		values = value.split(settings.delimiter || defaults.delimiter);
		for (i = 0, n = values.length; i < n; i++) {
			settings_element.options[values[i]] = {
				'text'  : values[i],
				'value' : values[i]
			};
		}

		settings_element.items = values;
	};

	/**
	 * Initializes selectize from a <select> element.
	 *
	 * @param {object} $input
	 * @param {object} settings
	 */
	var init_select = function($input, settings_element) {
		var i, n, tagName;
		var $children;
		var order = 0;
		var options = settings_element.options;

		settings_element.maxItems = !!$input.attr('multiple') ? null : 1;

		var readData = function($el) {
			var data = dataAttr && $el.attr(dataAttr);
			if (typeof data === 'string' && data.length) {
				return JSON.parse(data);
			}
			return null;
		};

		var addOption = function($option, group) {
			var value, option;

			$option = $($option);

			value = $option.attr('value') || '';
			if (!value.length) return;

			// if the option already exists, it's probably been
			// duplicated in another optgroup. in this case, push
			// the current group to the "optgroup" property on the
			// existing option so that it's rendered in both places.
			if (options.hasOwnProperty(value)) {
				if (group) {
					if (!options[value].optgroup) {
						options[value].optgroup = group;
					} else if (!$.isArray(options[value].optgroup)) {
						options[value].optgroup = [options[value].optgroup, group];
					} else {
						options[value].optgroup.push(group);
					}
				}
				return;
			}

			option = readData($option) || {
				'text'     : $option.text(),
				'value'    : value,
				'optgroup' : group
			};

			option.$order = ++order;
			options[value] = option;

			if ($option.is(':selected')) {
				settings_element.items.push(value);
			}
		};

		var addGroup = function($optgroup) {
			var i, n, $options = $('option', $optgroup);
			$optgroup = $($optgroup);

			var id = $optgroup.attr('label');
			if (id && id.length) {
				settings_element.optgroups[id] = readData($optgroup) || {
					'label': id
				};
			}

			for (i = 0, n = $options.length; i < n; i++) {
				addOption($options[i], id);
			}
		};

		$children = $input.children();
		for (i = 0, n = $children.length; i < n; i++) {
			tagName = $children[i].tagName.toLowerCase();
			if (tagName === 'optgroup') {
				addGroup($children[i]);
			} else if (tagName === 'option') {
				addOption($children[i]);
			}
		}
	};

	return this.each(function() {
		var instance;
		var $input = $(this);
		var tag_name = $input[0].tagName.toLowerCase();
		var settings_element = {
			'placeholder' : $input.children('option[value=""]').text() || $input.attr('placeholder'),
			'options'     : {},
			'optgroups'   : {},
			'items'       : []
		};

		if (tag_name === 'select') {
			init_select($input, settings_element);
		} else {
			init_textbox($input, settings_element);
		}

		instance = new Selectize($input, $.extend(true, {}, defaults, settings_element, settings));
		$input.data('selectize', instance);
		$input.addClass('selectized');
	});
};

$.fn.selectize.defaults = Selectize.defaults;
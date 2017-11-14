/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.plugins.add('format', {
	requires: 'richcombo',
	// jscs:disable maximumLineLength
	lang: 'en', // %REMOVE_LINE_CORE%
	// jscs:enable maximumLineLength
	init: function (editor) {
		var config = editor.config;
		
		// addCombo(editor, 'Volume', editor.lang.format.volume, config.volume_tags, 'volume', config.volume_styles);
		// addCombo(editor, 'Pitch', editor.lang.format.pitch, config.pitch_tags, 'pitch', config.pitch_styles);
		// addCombo(editor, 'Rate', editor.lang.format.rate, config.rate_tags, 'rate', config.rate_styles);
	}
});

function addCombo(editor, comboName, lang, entries, styleType, format_styles) {
	if (editor.blockless)
		return;

	var config = editor.config;

	// Gets the list of tags from the settings.
	var tags = entries.split(';');

	// Create style objects for all defined styles.
	var styles = {},
		stylesCount = 0,
		allowedContent = [];
	for (var i = 0; i < tags.length; i++) {
		var tag = tags[i].split('/');

		var vars = {};
		vars[ styleType ] = tag[1];

		
		var style = new CKEDITOR.style(format_styles, vars);
		if (!editor.filter.customConfig || editor.filter.check(style)) {
			stylesCount++;
			styles[tag[0]] = style;
			styles[tag[0]]._.enterMode = editor.config.enterMode;
			allowedContent.push(style);
		}
	}

	// Hide entire combo when all formats are rejected.
	if (stylesCount === 0)
		return;

	editor.ui.addRichCombo(comboName, {
		label: lang.label,
		title: lang.panelTitle,
		toolbar: 'styles,20',
		allowedContent: allowedContent,

		panel: {
			css: [CKEDITOR.skin.getPath('editor')].concat(config.contentsCss),
			multiSelect: false,
			attributes: { 'aria-label': lang.panelTitle }
		},

		init: function () {
			this.startGroup(lang.panelTitle);

			for (var tag in styles) {
				var label = tag;

				// Add the tag entry to the panel list.
				this.add(tag, styles[tag].buildPreview(label), label);
			}
		},

		onClick: function (value) {
			editor.focus();
			editor.fire('saveSnapshot');

			var style = styles[value],
				elementPath = editor.elementPath();

			editor[style.checkActive(elementPath, editor) ? 'removeStyle' : 'applyStyle'](style);

			// Save the undo snapshot after all changes are affected. (http://dev.ckeditor.com/ticket/4899)
			setTimeout(function () {
				editor.fire('saveSnapshot');
			}, 0);
		},

		onRender: function () {
			editor.on('selectionChange', function (ev) {
				var currentTag = this.getValue(),
					elementPath = ev.data.path;

				this.refresh();

				for (var tag in styles) {
					if (styles[tag].checkActive(elementPath, editor)) {
						if (tag != currentTag)
							this.setValue(tag);
						return;
					}
				}

				// If no styles match, just empty it.
				this.setValue('');

			}, this);
		},

		onOpen: function () {
			this.showAll();
			for (var name in styles) {
				var style = styles[name];

				// Check if that style is enabled in activeFilter.
				if (!editor.activeFilter.check(style))
					this.hideItem(name);

			}
		},

		refresh: function () {
			var elementPath = editor.elementPath();

			if (!elementPath)
				return;

			// Check if element path contains 'p' element.
			if (!elementPath.isContextFor('p')) {
				this.setState(CKEDITOR.TRISTATE_DISABLED);
				return;
			}

			// Check if there is any available style.
			for (var name in styles) {
				if (editor.activeFilter.check(styles[name]))
					return;
			}
			this.setState(CKEDITOR.TRISTATE_DISABLED);
		}
	});

}
/**
 * A list of semicolon-separated style names (by default: tags) representing
 * the style definition for each entry to be displayed in the Format drop-down list
 * in the toolbar. Each entry must have a corresponding configuration in a
 * setting named `'format_(tagName)'`. For example, the `'p'` entry has its
 * definition taken from [config.format_p](#!/api/CKEDITOR.config-cfg-format_p).
 *
 * Read more in the [documentation](#!/guide/dev_format)
 * and see the [SDK sample](http://sdk.ckeditor.com/samples/format.html).
 *
 *		config.format_tags = 'p;h2;h3;pre';
 *
 * @cfg {String} [format_tags='p;h1;h2;h3;h4;h5;h6;pre;address;div']
 * @member CKEDITOR.config
 */
CKEDITOR.config.format_tags = 'p;h1;h2;h3;h4;h5;h6;pre;address;div;span';

CKEDITOR.config.volume_tags = 'x-soft/x-soft;soft/soft;medium/medium;loud/loud;x-loud/x-loud;silent/silent';

CKEDITOR.config.volume_styles = { element: 'span', attributes: { 'title': 'volume: #(volume)' } };

CKEDITOR.config.pitch_tags = 'x-low/x-low;low/low;medium/medium;high/high;x-high/x-high';

CKEDITOR.config.pitch_styles = { element: 'div', attributes: { 'title': 'pitch: #(pitch)' } };

CKEDITOR.config.rate_tags = 'x-slow/x-slow;slow/slow;medium/medium;fast/fast;x-fast/x-fast';

CKEDITOR.config.rate_styles = { element: 'strong', attributes: { 'title': 'rate: #(rate)' } };
/**
 * The style definition to be used to apply the `Normal` format.
 *
 * Read more in the [documentation](#!/guide/dev_format)
 * and see the [SDK sample](http://sdk.ckeditor.com/samples/format.html).
 *
 *		config.format_p = { element: 'p', attributes: { 'class': 'normalPara' } };
 *
 * @cfg {Object} [format_p={ element: 'p' }]
 * @member CKEDITOR.config
 */
CKEDITOR.config.format_p = { element: 'p' };

CKEDITOR.config.format_volume = { element: 'span', attributes: { 'title': 'volume: #(volume)' } };

/**
 * The style definition to be used to apply the `Normal (DIV)` format.
 *
 * Read more in the [documentation](#!/guide/dev_format)
 * and see the [SDK sample](http://sdk.ckeditor.com/samples/format.html).
 *
 *		config.format_div = { element: 'div', attributes: { 'class': 'normalDiv' } };
 *
 * @cfg {Object} [format_div={ element: 'div' }]
 * @member CKEDITOR.config
 */
CKEDITOR.config.format_div = { element: 'div' };

/**
 * The style definition to be used to apply the `Formatted` format.
 *
 * Read more in the [documentation](#!/guide/dev_format)
 * and see the [SDK sample](http://sdk.ckeditor.com/samples/format.html).
 *
 *		config.format_pre = { element: 'pre', attributes: { 'class': 'code' } };
 *
 * @cfg {Object} [format_pre={ element: 'pre' }]
 * @member CKEDITOR.config
 */
CKEDITOR.config.format_pre = { element: 'pre' };

/**
 * The style definition to be used to apply the `Address` format.
 *
 * Read more in the [documentation](#!/guide/dev_format)
 * and see the [SDK sample](http://sdk.ckeditor.com/samples/format.html).
 *
 *		config.format_address = { element: 'address', attributes: { 'class': 'styledAddress' } };
 *
 * @cfg {Object} [format_address={ element: 'address' }]
 * @member CKEDITOR.config
 */
CKEDITOR.config.format_address = { element: 'address' };

/**
 * The style definition to be used to apply the `Heading 1` format.
 *
 * Read more in the [documentation](#!/guide/dev_format)
 * and see the [SDK sample](http://sdk.ckeditor.com/samples/format.html).
 *
 *		config.format_h1 = { element: 'h1', attributes: { 'class': 'contentTitle1' } };
 *
 * @cfg {Object} [format_h1={ element: 'h1' }]
 * @member CKEDITOR.config
 */
CKEDITOR.config.format_h1 = { element: 'h1' };

/**
 * The style definition to be used to apply the `Heading 2` format.
 *
 * Read more in the [documentation](#!/guide/dev_format)
 * and see the [SDK sample](http://sdk.ckeditor.com/samples/format.html).
 *
 *		config.format_h2 = { element: 'h2', attributes: { 'class': 'contentTitle2' } };
 *
 * @cfg {Object} [format_h2={ element: 'h2' }]
 * @member CKEDITOR.config
 */
CKEDITOR.config.format_h2 = { element: 'h2' };

/**
 * The style definition to be used to apply the `Heading 3` format.
 *
 * Read more in the [documentation](#!/guide/dev_format)
 * and see the [SDK sample](http://sdk.ckeditor.com/samples/format.html).
 *
 *		config.format_h3 = { element: 'h3', attributes: { 'class': 'contentTitle3' } };
 *
 * @cfg {Object} [format_h3={ element: 'h3' }]
 * @member CKEDITOR.config
 */
CKEDITOR.config.format_h3 = { element: 'h3' };

/**
 * The style definition to be used to apply the `Heading 4` format.
 *
 * Read more in the [documentation](#!/guide/dev_format)
 * and see the [SDK sample](http://sdk.ckeditor.com/samples/format.html).
 *
 *		config.format_h4 = { element: 'h4', attributes: { 'class': 'contentTitle4' } };
 *
 * @cfg {Object} [format_h4={ element: 'h4' }]
 * @member CKEDITOR.config
 */
CKEDITOR.config.format_h4 = { element: 'h4' };

/**
 * The style definition to be used to apply the `Heading 5` format.
 *
 * Read more in the [documentation](#!/guide/dev_format)
 * and see the [SDK sample](http://sdk.ckeditor.com/samples/format.html).
 *
 *		config.format_h5 = { element: 'h5', attributes: { 'class': 'contentTitle5' } };
 *
 * @cfg {Object} [format_h5={ element: 'h5' }]
 * @member CKEDITOR.config
 */
CKEDITOR.config.format_h5 = { element: 'h5' };

/**
 * The style definition to be used to apply the `Heading 6` format.
 *
 * Read more in the [documentation](#!/guide/dev_format)
 * and see the [SDK sample](http://sdk.ckeditor.com/samples/format.html).
 *
 *		config.format_h6 = { element: 'h6', attributes: { 'class': 'contentTitle6' } };
 *
 * @cfg {Object} [format_h6={ element: 'h6' }]
 * @member CKEDITOR.config
 */
CKEDITOR.config.format_h6 = { element: 'h6' };
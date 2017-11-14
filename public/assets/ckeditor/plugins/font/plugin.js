/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

( function() {
	function addCombo( editor, comboName, styleType, lang, entries, defaultLabel, styleDefinition, order ) {
		var config = editor.config,
			style = new CKEDITOR.style( styleDefinition );

		// Gets the list of fonts from the settings.
		var names = entries.split( ';' ),
			values = [];

		// Create style objects for all fonts.
		var styles = {};
		for ( var i = 0; i < names.length; i++ ) {
			var parts = names[ i ];

			if ( parts ) {
				parts = parts.split( '/' );

				var vars = {},
					name = names[ i ] = parts[ 0 ];

				vars[ styleType ] = values[ i ] = parts[ 1 ] || name;

				styles[ name ] = new CKEDITOR.style( styleDefinition, vars );
				styles[ name ]._.definition.name = name;
			} else {
				names.splice( i--, 1 );
			}
		}

		editor.ui.addRichCombo( comboName, {
			label: lang.label,
			title: lang.panelTitle,
			toolbar: 'styles,' + order,
			allowedContent: style,
			requiredContent: style,
			contentTransformations: [
				[
					{
						element: 'font',
						check: 'span',
						left: function( element ) {
							return !!element.attributes.size ||
								!!element.attributes.align ||
								!!element.attributes.face;
						},
						right: function( element ) {
							var sizes = [
								'', // Non-existent size "0"
								'x-small',
								'small',
								'medium',
								'large',
								'x-large',
								'xx-large',
								'48px' // Closest value to what size="7" might mean.
							];

							element.name = 'span';

							if ( element.attributes.size ) {
								element.styles[ 'font-size' ] = sizes[ element.attributes.size ];
								delete element.attributes.size;
							}

							if ( element.attributes.align ) {
								element.styles[ 'text-align' ] = element.attributes.align;
								delete element.attributes.align;
							}

							if ( element.attributes.face ) {
								element.styles[ 'font-family' ] = element.attributes.face;
								delete element.attributes.face;
							}
						}
					}
				]
			],
			panel: {
				css: [ CKEDITOR.skin.getPath( 'editor' ) ].concat( config.contentsCss ),
				multiSelect: false,
				attributes: { 'aria-label': lang.panelTitle }
			},

			init: function() {
				this.startGroup( lang.panelTitle );

				for ( var i = 0; i < names.length; i++ ) {
					var name = names[ i ];

					// Add the tag entry to the panel list.
					this.add( name, name );
				}
			},

			onClick: function( value ) {
				editor.focus();
				editor.fire( 'saveSnapshot' );

				var previousValue = this.getValue(),
					style = styles[ value ];

				// When applying one style over another, first remove the previous one (http://dev.ckeditor.com/ticket/12403).
				// NOTE: This is only a temporary fix. It will be moved to the styles system (http://dev.ckeditor.com/ticket/12687).
				if ( previousValue && value != previousValue ) {
					var previousStyle = styles[ previousValue ],
						range = editor.getSelection().getRanges()[ 0 ];

					// If the range is collapsed we can't simply use the editor.removeStyle method
					// because it will remove the entire element and we want to split it instead.
					if ( range.collapsed ) {
						var path = editor.elementPath(),
							// Find the style element.
							matching = path.contains( function( el ) {
								return previousStyle.checkElementRemovable( el );
							} );

						if ( matching ) {
							var startBoundary = range.checkBoundaryOfElement( matching, CKEDITOR.START ),
								endBoundary = range.checkBoundaryOfElement( matching, CKEDITOR.END ),
								node, bm;

							// If we are at both boundaries it means that the element is empty.
							// Remove it but in a way that we won't lose other empty inline elements inside it.
							// Example: <p>x<span style="font-size:48px"><em>[]</em></span>x</p>
							// Result: <p>x<em>[]</em>x</p>
							if ( startBoundary && endBoundary ) {
								bm = range.createBookmark();
								// Replace the element with its children (TODO element.replaceWithChildren).
								while ( ( node = matching.getFirst() ) ) {
									node.insertBefore( matching );
								}
								matching.remove();
								range.moveToBookmark( bm );

							// If we are at the boundary of the style element, move out and copy nested styles/elements.
							} else if ( startBoundary || endBoundary ) {
								range.moveToPosition( matching, startBoundary ? CKEDITOR.POSITION_BEFORE_START : CKEDITOR.POSITION_AFTER_END );
								cloneSubtreeIntoRange( range, path.elements.slice(), matching );
							} else {
								// Split the element and clone the elements that were in the path
								// (between the startContainer and the matching element)
								// into the new place.
								range.splitElement( matching );
								range.moveToPosition( matching, CKEDITOR.POSITION_AFTER_END );
								cloneSubtreeIntoRange( range, path.elements.slice(), matching );
							}

							editor.getSelection().selectRanges( [ range ] );
						}
					} else {
						editor.removeStyle( previousStyle );
					}
				}

				editor[ previousValue == value ? 'removeStyle' : 'applyStyle' ]( style );

				editor.fire( 'saveSnapshot' );
			},

			onRender: function() {
				editor.on( 'selectionChange', function( ev ) {
					var currentValue = this.getValue();

					var elementPath = ev.data.path,
						elements = elementPath.elements;

					// For each element into the elements path.
					for ( var i = 0, element; i < elements.length; i++ ) {
						element = elements[ i ];

						// Check if the element is removable by any of
						// the styles.
						for ( var value in styles ) {
							if ( styles[ value ].checkElementMatch( element, true, editor ) ) {
								if ( value != currentValue )
									this.setValue( value );
								return;
							}
						}
					}

					// If no styles match, just empty it.
					this.setValue( '', defaultLabel );
				}, this );
			},

			refresh: function() {
				if ( !editor.activeFilter.check( style ) )
					this.setState( CKEDITOR.TRISTATE_DISABLED );
			}
		} );
	}

	// Clones the subtree between subtreeStart (exclusive) and the
	// leaf (inclusive) and inserts it into the range.
	//
	// @param range
	// @param {CKEDITOR.dom.element[]} elements Elements path in the standard order: leaf -> root.
	// @param {CKEDITOR.dom.element/null} substreeStart The start of the subtree.
	// If null, then the leaf belongs to the subtree.
	function cloneSubtreeIntoRange( range, elements, subtreeStart ) {
		var current = elements.pop();
		if ( !current ) {
			return;
		}
		// Rewind the elements array up to the subtreeStart and then start the real cloning.
		if ( subtreeStart ) {
			return cloneSubtreeIntoRange( range, elements, current.equals( subtreeStart ) ? null : subtreeStart );
		}

		var clone = current.clone();
		range.insertNode( clone );
		range.moveToPosition( clone, CKEDITOR.POSITION_AFTER_START );

		cloneSubtreeIntoRange( range, elements );
	}

	CKEDITOR.plugins.add( 'font', {
		requires: 'richcombo',
		// jscs:disable maximumLineLength
		lang: 'af,ar,az,bg,bn,bs,ca,cs,cy,da,de,de-ch,el,en,en-au,en-ca,en-gb,eo,es,es-mx,et,eu,fa,fi,fo,fr,fr-ca,gl,gu,he,hi,hr,hu,id,is,it,ja,ka,km,ko,ku,lt,lv,mk,mn,ms,nb,nl,no,oc,pl,pt,pt-br,ro,ru,si,sk,sl,sq,sr,sr-latn,sv,th,tr,tt,ug,uk,vi,zh,zh-cn', // %REMOVE_LINE_CORE%
		// jscs:enable maximumLineLength
		init: function( editor ) {
			var config = editor.config;

			//addCombo( editor, 'Font', 'family', editor.lang.font, config.font_names, config.font_defaultLabel, config.font_style, 30 );
			//addCombo( editor, 'FontSize', 'size', editor.lang.font.fontSize, config.fontSize_sizes, config.fontSize_defaultLabel, config.fontSize_style, 40 );
			addCombo( editor, 'Volume', 'volume', editor.lang.font.volume, config.volume_tags, config.fontSize_defaultLabel, config.volume_styles, 50 );
			addCombo( editor, 'Pitch', 'pitch', editor.lang.font.pitch, config.pitch_tags, config.fontSize_defaultLabel, config.pitch_styles, 60 );
			addCombo( editor, 'Rate', 'rate', editor.lang.font.rate, config.rate_tags, config.fontSize_defaultLabel, config.rate_styles, 60 );
			addCombo( editor, 'SayAs', 'say', editor.lang.font.say, config.say_tags, config.fontSize_defaultLabel, config.say_styles, 70 );
			
		}
	} );
} )();

CKEDITOR.config.fontSize_defaultLabel = '';

/**
 * The style definition to be used to apply the font size in the text.
 *
 *		// This is actually the default value for it.
 *		config.fontSize_style = {
 *			element:		'span',
 *			styles:			{ 'font-size': '#(size)' },
 *			overrides:		[ { element: 'font', attributes: { 'size': null } } ]
 *		};
 *
 * @cfg {Object} [fontSize_style=see example]
 * @member CKEDITOR.config
 */
CKEDITOR.config.fontSize_style = {
	element: 'span',
	styles: { 'font-size': '#(size)' },
	overrides: [ {
		element: 'font', attributes: { 'size': null }
	} ]
};

CKEDITOR.config.volume_tags = 'x-soft/x-soft;soft/soft;medium/medium;loud/loud;x-loud/x-loud;silent/silent';

CKEDITOR.config.volume_styles = { element: 'span', attributes: { 'class': 'rcVolume', 'data-volume': '#(volume)'  } };

CKEDITOR.config.pitch_tags = 'x-low/x-low;low/low;medium/medium;high/high;x-high/x-high';

CKEDITOR.config.pitch_styles = { element: 'span', attributes: { 'class': 'rcPitch', 'data-pitch': '#(pitch)' }};

CKEDITOR.config.rate_tags = 'x-slow/x-slow;slow/slow;medium/medium;fast/fast;x-fast/x-fast';

CKEDITOR.config.rate_styles = { element: 'span', attributes: { 'class': 'rcRate', 'data-rate': '#(rate)' } };


CKEDITOR.config.say_tags = 'character/character;number/number;ordinal/ordinal;digits/digits;fraction/fraction;unit/unit;date/date;time/time;address/address;expletive/expletive;telephone/telephone';

CKEDITOR.config.say_styles = { element: 'span', attributes: { 'class': 'rcSay', 'data-say': '#(say)' } };

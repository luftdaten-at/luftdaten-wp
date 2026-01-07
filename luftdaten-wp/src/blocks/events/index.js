(function(blocks, element, blockEditor, components, i18n) {
    var el = element.createElement;
    var registerBlockType = blocks.registerBlockType;
    var InspectorControls = blockEditor.InspectorControls;
    var PanelBody = components.PanelBody;
    var TextControl = components.TextControl;
    var RangeControl = components.RangeControl;
    var __ = i18n.__;

    registerBlockType('luftdaten/events', {
        title: __('Events List', 'luftdaten'),
        icon: 'calendar-alt',
        category: 'luftdaten',
        attributes: {
            numberOfPosts: {
                type: 'number',
                default: 3,
            },
            title: {
                type: 'string',
                default: __('Nächste Veranstaltungen', 'luftdaten'),
            },
        },
        edit: function(props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;

            return el('div', { className: 'luftdaten-events-block' },
                el(InspectorControls, {},
                    el(PanelBody, { title: __('Block Settings', 'luftdaten') },
                        el(TextControl, {
                            label: __('Title', 'luftdaten'),
                            value: attributes.title,
                            onChange: function(value) {
                                setAttributes({ title: value });
                            }
                        }),
                        el(RangeControl, {
                            label: __('Number of Events', 'luftdaten'),
                            value: attributes.numberOfPosts,
                            onChange: function(value) {
                                setAttributes({ numberOfPosts: value });
                            },
                            min: 1,
                            max: 10,
                        })
                    )
                ),
                el('div', { className: 'luftdaten-events-preview' },
                    el('h3', {}, attributes.title),
                    el('p', {}, __('This block will display', 'luftdaten') + ' ' + attributes.numberOfPosts + ' ' + __('upcoming events.', 'luftdaten'))
                )
            );
        },
        save: function() {
            return null; // Dynamic block, rendered server-side
        },
    });
})(
    window.wp.blocks,
    window.wp.element,
    window.wp.blockEditor,
    window.wp.components,
    window.wp.i18n
);
